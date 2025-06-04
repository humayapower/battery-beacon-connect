
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EMI, MonthlyRent, CustomerCredit, Payment, BillingDetails } from '@/types/billing';

export const useBilling = () => {
  const { toast } = useToast();

  const getBillingDetails = async (customerId: string): Promise<BillingDetails | null> => {
    try {
      // Fetch EMIs
      const { data: emisData, error: emisError } = await supabase
        .from('emis')
        .select('*')
        .eq('customer_id', customerId)
        .order('emi_number');

      if (emisError) throw emisError;

      // Fetch Monthly Rents
      const { data: rentsData, error: rentsError } = await supabase
        .from('monthly_rents')
        .select('*')
        .eq('customer_id', customerId)
        .order('rent_month', { ascending: false });

      if (rentsError) throw rentsError;

      // Fetch Customer Credits
      const { data: credits, error: creditsError } = await supabase
        .from('customer_credits')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') throw creditsError;

      // Fetch Transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          emis:emi_id (emi_number, amount),
          monthly_rents:monthly_rent_id (rent_month, amount)
        `)
        .eq('customer_id', customerId)
        .order('transaction_date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Type cast the data to ensure proper typing
      const emis: EMI[] = (emisData || []).map(emi => ({
        ...emi,
        payment_status: emi.payment_status as 'due' | 'paid' | 'partial' | 'overdue'
      }));

      const rents: MonthlyRent[] = (rentsData || []).map(rent => ({
        ...rent,
        payment_status: rent.payment_status as 'due' | 'paid' | 'partial' | 'overdue'
      }));

      // Calculate totals
      const totalPaid = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      
      const totalEmisDue = emis?.filter(e => e.payment_status !== 'paid')
        .reduce((sum, e) => sum + e.remaining_amount, 0) || 0;
      
      const totalRentsDue = rents?.filter(r => r.payment_status !== 'paid')
        .reduce((sum, r) => sum + r.remaining_amount, 0) || 0;
      
      const totalDue = totalEmisDue + totalRentsDue;

      // Find next due date
      const nextEmiDue = emis?.find(e => e.payment_status !== 'paid')?.due_date;
      const nextRentDue = rents?.find(r => r.payment_status !== 'paid')?.due_date;
      
      let nextDueDate = null;
      if (nextEmiDue && nextRentDue) {
        nextDueDate = new Date(nextEmiDue) < new Date(nextRentDue) ? nextEmiDue : nextRentDue;
      } else {
        nextDueDate = nextEmiDue || nextRentDue || null;
      }

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

      return {
        emis,
        rents,
        credits: credits || { id: '', customer_id: customerId, credit_balance: 0, updated_at: '' },
        transactions: transactions || [],
        totalPaid,
        totalDue,
        nextDueDate,
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

  const processPayment = async (
    customerId: string, 
    payment: Payment,
    targetType: 'emi' | 'rent',
    targetId?: string
  ) => {
    try {
      let remainingAmount = payment.amount;
      
      // Get customer credits
      const { data: creditData } = await supabase
        .from('customer_credits')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      let currentCredit = creditData?.credit_balance || 0;

      // Process EMI payment
      if (targetType === 'emi') {
        // Get EMIs in order (overdue/partial first, then by emi_number)
        const { data: emis } = await supabase
          .from('emis')
          .select('*')
          .eq('customer_id', customerId)
          .neq('payment_status', 'paid')
          .order('payment_status')
          .order('emi_number');

        if (emis) {
          for (const emi of emis) {
            if (remainingAmount <= 0) break;

            const amountToPay = Math.min(remainingAmount, emi.remaining_amount);
            const newPaidAmount = emi.paid_amount + amountToPay;
            const newRemainingAmount = emi.remaining_amount - amountToPay;
            
            let newStatus = emi.payment_status;
            if (newRemainingAmount === 0) {
              newStatus = 'paid';
            } else if (newPaidAmount > 0) {
              newStatus = 'partial';
            }

            // Update EMI
            await supabase
              .from('emis')
              .update({
                paid_amount: newPaidAmount,
                remaining_amount: newRemainingAmount,
                payment_status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', emi.id);

            // Record transaction
            await supabase
              .from('transactions')
              .insert({
                customer_id: customerId,
                amount: amountToPay,
                transaction_type: 'emi',
                payment_status: 'paid',
                transaction_date: payment.payment_date,
                emi_id: emi.id,
                remarks: payment.remarks
              });

            remainingAmount -= amountToPay;
          }
        }
      }

      // Process Rent payment
      if (targetType === 'rent') {
        const { data: rents } = await supabase
          .from('monthly_rents')
          .select('*')
          .eq('customer_id', customerId)
          .neq('payment_status', 'paid')
          .order('due_date');

        if (rents) {
          for (const rent of rents) {
            if (remainingAmount <= 0) break;

            const amountToPay = Math.min(remainingAmount, rent.remaining_amount);
            const newPaidAmount = rent.paid_amount + amountToPay;
            const newRemainingAmount = rent.remaining_amount - amountToPay;
            
            let newStatus = rent.payment_status;
            if (newRemainingAmount === 0) {
              newStatus = 'paid';
            } else if (newPaidAmount > 0) {
              newStatus = 'partial';
            }

            // Update Rent
            await supabase
              .from('monthly_rents')
              .update({
                paid_amount: newPaidAmount,
                remaining_amount: newRemainingAmount,
                payment_status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', rent.id);

            // Record transaction
            await supabase
              .from('transactions')
              .insert({
                customer_id: customerId,
                amount: amountToPay,
                transaction_type: 'rent',
                payment_status: 'paid',
                transaction_date: payment.payment_date,
                monthly_rent_id: rent.id,
                remarks: payment.remarks
              });

            remainingAmount -= amountToPay;
          }
        }
      }

      // Handle excess payment (add to credit)
      if (remainingAmount > 0) {
        const newCreditBalance = currentCredit + remainingAmount;
        
        await supabase
          .from('customer_credits')
          .upsert({
            customer_id: customerId,
            credit_balance: newCreditBalance,
            updated_at: new Date().toISOString()
          });

        // Record credit transaction
        await supabase
          .from('transactions')
          .insert({
            customer_id: customerId,
            amount: remainingAmount,
            transaction_type: 'deposit',
            payment_status: 'paid',
            transaction_date: payment.payment_date,
            credit_added: remainingAmount,
            remarks: `Credit added from excess payment. ${payment.remarks || ''}`
          });
      }

      toast({
        title: "Payment processed successfully",
        description: `Payment of ₹${payment.amount} has been recorded.`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error processing payment",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const generateMonthlyRents = async () => {
    try {
      const { error } = await supabase.rpc('generate_monthly_rent_charges');
      if (error) throw error;
      
      toast({
        title: "Monthly rents generated",
        description: "Monthly rent charges have been generated for all rental customers.",
      });
    } catch (error: any) {
      console.error('Error generating monthly rents:', error);
      toast({
        title: "Error generating monthly rents",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateOverdueStatus = async () => {
    try {
      const { error } = await supabase.rpc('update_overdue_status');
      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating overdue status:', error);
    }
  };

  return {
    getBillingDetails,
    processPayment,
    generateMonthlyRents,
    updateOverdueStatus
  };
};
