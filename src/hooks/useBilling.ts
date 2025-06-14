import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      
      const { data, error } = await supabase.rpc('get_monthly_payment_summary', {
        target_month: month,
        target_year: parseInt(year)
      });

      console.log('Monthly payment summary response:', { data, error });

      if (error) {
        console.error('Error fetching monthly payment summary:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setMonthlyPaymentSummary(data[0]);
      } else {
        setMonthlyPaymentSummary(null);
      }
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
      
      const { data, error } = await supabase.rpc('get_transaction_summary');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setTransactionSummary(data[0]);
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

  const getPaymentSummary = async (customerId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_payment_summary', {
        customer_id: customerId
      });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching payment summary:', error);
      toast({
        title: "Error fetching payment summary",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    monthlyPaymentSummary,
    transactionSummary,
    loading,
    fetchMonthlyPaymentSummary,
    fetchTransactionSummary,
		getPaymentSummary
  };
};
