
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EMI, MonthlyRent, PaymentStatus } from '@/types/billing';

interface MonthlyPaymentSummary {
  total_rent_this_month: number;
  total_emi_this_month: number;
  total_amount_collected: number;
  pending_amount: number;
}

interface TransactionSummary {
  total_transactions: number;
  total_amount: number;
  pending_amount: number;
  completed_amount: number;
}

export const useBilling = () => {
  const [monthlyPaymentSummary, setMonthlyPaymentSummary] = useState<MonthlyPaymentSummary | null>(null);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>({
    total_transactions: 0,
    total_amount: 0,
    pending_amount: 0,
    completed_amount: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMonthlyPaymentSummary = async (month: string, year: string) => {
    try {
      setLoading(true);
      console.log('Fetching monthly payment summary for:', { month, year });
      
      // Since RPC function doesn't exist, calculate manually
      const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      
      const { data: rents, error: rentsError } = await supabase
        .from('monthly_rents')
        .select('amount, paid_amount')
        .gte('rent_month', currentDate.toISOString())
        .lt('rent_month', nextMonth.toISOString());

      const { data: emis, error: emisError } = await supabase
        .from('emis')
        .select('amount, paid_amount')
        .gte('due_date', currentDate.toISOString().split('T')[0])
        .lt('due_date', nextMonth.toISOString().split('T')[0]);

      if (rentsError) throw rentsError;
      if (emisError) throw emisError;

      const totalRent = (rents || []).reduce((sum, rent) => sum + rent.amount, 0);
      const totalRentPaid = (rents || []).reduce((sum, rent) => sum + rent.paid_amount, 0);
      const totalEmi = (emis || []).reduce((sum, emi) => sum + emi.amount, 0);
      const totalEmiPaid = (emis || []).reduce((sum, emi) => sum + emi.paid_amount, 0);

      setMonthlyPaymentSummary({
        total_rent_this_month: totalRent,
        total_emi_this_month: totalEmi,
        total_amount_collected: totalRentPaid + totalEmiPaid,
        pending_amount: (totalRent - totalRentPaid) + (totalEmi - totalEmiPaid)
      });
    } catch (error: any) {
      console.error('Error in fetchMonthlyPaymentSummary:', error);
      toast({
        title: "Error fetching monthly summary",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionSummary = async () => {
    try {
      setLoading(true);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, payment_status');

      if (error) throw error;
      
      if (transactions && transactions.length > 0) {
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        const completedAmount = transactions
          .filter(t => t.payment_status === 'paid')
          .reduce((sum, t) => sum + t.amount, 0);
        
        setTransactionSummary({
          total_transactions: transactions.length,
          total_amount: totalAmount,
          pending_amount: totalAmount - completedAmount,
          completed_amount: completedAmount
        });
      } else {
        setTransactionSummary({
          total_transactions: 0,
          total_amount: 0,
          pending_amount: 0,
          completed_amount: 0
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching transaction summary",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentSummary = async (customerId?: string) => {
    try {
      // Calculate payment summary manually
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('payment_type', 'monthly_rent')
        .eq('status', 'active');

      const { data: rents, error: rentsError } = await supabase
        .from('monthly_rents')
        .select('*')
        .gte('rent_month', currentMonth.toISOString());

      const { data: emis, error: emisError } = await supabase
        .from('emis')
        .select('*');

      if (customersError) throw customersError;
      if (rentsError) throw rentsError;
      if (emisError) throw emisError;

      const activeRentalCustomers = customers?.length || 0;
      const totalRentDue = (rents || []).reduce((sum, rent) => sum + rent.amount, 0);
      const totalRentPaid = (rents || []).reduce((sum, rent) => sum + rent.paid_amount, 0);
      const totalRentOverdue = (rents || [])
        .filter(rent => rent.payment_status === 'overdue')
        .reduce((sum, rent) => sum + rent.remaining_amount, 0);

      const totalEmiDue = (emis || []).reduce((sum, emi) => sum + emi.amount, 0);
      const totalEmiPaid = (emis || []).reduce((sum, emi) => sum + emi.paid_amount, 0);
      const totalEmiOverdue = (emis || [])
        .filter(emi => emi.payment_status === 'overdue')
        .reduce((sum, emi) => sum + emi.remaining_amount, 0);

      const overdueCustomers = new Set([
        ...(rents || []).filter(r => r.payment_status === 'overdue').map(r => r.customer_id),
        ...(emis || []).filter(e => e.payment_status === 'overdue').map(e => e.customer_id)
      ]).size;

      const summary = {
        month_year: currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        total_rent_due: totalRentDue,
        total_rent_paid: totalRentPaid,
        total_rent_overdue: totalRentOverdue,
        total_emi_due: totalEmiDue,
        total_emi_paid: totalEmiPaid,
        total_emi_overdue: totalEmiOverdue,
        active_rental_customers: activeRentalCustomers,
        active_emi_customers: 0, // We can calculate this if needed
        overdue_customers: overdueCustomers
      };

      return { success: true, data: summary };
    } catch (error: any) {
      console.error('Error fetching payment summary:', error);
      return { success: false, error: error.message };
    }
  };

  const generateMonthlyRents = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_monthly_rent_charges');
      
      if (error) throw error;
      
      toast({
        title: "Monthly rents generated",
        description: "Successfully generated monthly rent charges for all active customers",
      });

      return { success: true, processedCount: 0 }; // RPC doesn't return count
    } catch (error: any) {
      console.error('Error generating monthly rents:', error);
      toast({
        title: "Error generating monthly rents",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const updateOverdueStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('update_overdue_status');
      
      if (error) throw error;
      
      toast({
        title: "Overdue status updated",
        description: "Successfully updated overdue payment statuses",
      });

      return { 
        success: true, 
        overdue_rents_count: 0, 
        overdue_emis_count: 0, 
        affected_customers_count: 0 
      }; // RPC doesn't return counts
    } catch (error: any) {
      console.error('Error updating overdue status:', error);
      toast({
        title: "Error updating overdue status",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const getBillingDetails = async (customerId: string) => {
    try {
      // Fetch EMIs
      const { data: emisData, error: emisError } = await supabase
        .from('emis')
        .select('*')
        .eq('customer_id', customerId)
        .order('emi_number');

      // Fetch monthly rents
      const { data: rentsData, error: rentsError } = await supabase
        .from('monthly_rents')
        .select('*')
        .eq('customer_id', customerId)
        .order('rent_month');

      // Fetch customer credits
      const { data: credits, error: creditsError } = await supabase
        .from('customer_credits')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('transaction_date', { ascending: false });

      if (emisError) throw emisError;
      if (rentsError) throw rentsError;
      if (creditsError && creditsError.code !== 'PGRST116') throw creditsError; // PGRST116 is "no rows found"
      if (transactionsError) throw transactionsError;

      // Type cast the data to match our TypeScript interfaces
      const emis: EMI[] = (emisData || []).map(emi => ({
        ...emi,
        payment_status: emi.payment_status as PaymentStatus,
        paid_amount: emi.paid_amount || 0
      }));

      const rents: MonthlyRent[] = (rentsData || []).map(rent => ({
        ...rent,
        payment_status: rent.payment_status as PaymentStatus,
        paid_amount: rent.paid_amount || 0
      }));

      const transactions = (transactionsData || []).map(transaction => ({
        ...transaction,
        payment_status: transaction.payment_status as PaymentStatus
      }));

      // Calculate totals
      const totalPaid = transactions
        .filter(t => t.payment_status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalDue = [
        ...emis.filter(e => e.payment_status !== 'paid'),
        ...rents.filter(r => r.payment_status !== 'paid')
      ].reduce((sum, item) => sum + item.remaining_amount, 0);

      const overdueAmount = [
        ...emis.filter(e => e.payment_status === 'overdue'),
        ...rents.filter(r => r.payment_status === 'overdue')
      ].reduce((sum, item) => sum + item.remaining_amount, 0);

      // Find next due date
      const upcomingDueDates = [
        ...emis.filter(e => e.payment_status !== 'paid').map(e => e.due_date),
        ...rents.filter(r => r.payment_status !== 'paid').map(r => r.due_date)
      ].sort();

      const nextDueDate = upcomingDueDates.length > 0 ? upcomingDueDates[0] : null;

      // Calculate EMI progress
      let emiProgress = undefined;
      if (emis && emis.length > 0) {
        const paidEmis = emis.filter(e => e.payment_status === 'paid').length;
        const totalEmis = emis.length;
        emiProgress = {
          paid: paidEmis,
          total: totalEmis,
          percentage: Math.round((paidEmis / totalEmis) * 100)
        };
      }

      // Ensure credits object has all required properties
      const creditBalance = credits || {
        id: 'default-credit-id',
        customer_id: customerId,
        credit_balance: 0,
        updated_at: new Date().toISOString()
      };

      return {
        emis,
        rents,
        credits: creditBalance,
        transactions,
        ledger: [], // Payment ledger not implemented yet
        totalPaid,
        totalDue,
        nextDueDate,
        overdueAmount,
        emiProgress
      };
    } catch (error: any) {
      console.error('Error fetching billing details:', error);
      toast({
        title: "Error fetching billing details",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    monthlyPaymentSummary,
    transactionSummary,
    loading,
    fetchMonthlyPaymentSummary,
    fetchTransactionSummary,
    getPaymentSummary,
    generateMonthlyRents,
    updateOverdueStatus,
    getBillingDetails
  };
};
