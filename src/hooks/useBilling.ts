
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BillingService } from '@/services/billingService';

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
      const result = await BillingService.getBillingSummary(customerId);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Failed to get billing details');
      }
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
