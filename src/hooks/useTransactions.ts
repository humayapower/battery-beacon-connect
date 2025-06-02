
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  transaction_id: string;
  customer_id: string | null;
  battery_id: string | null;
  partner_id: string | null;
  amount: number;
  type: 'Payment' | 'Refund' | 'Fee' | 'Maintenance';
  status: 'Completed' | 'Pending' | 'Failed';
  description: string | null;
  transaction_date: string;
  created_at: string;
  customers?: {
    name: string;
    email: string;
  };
  batteries?: {
    battery_id: string;
    model: string;
  };
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole, user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select(`
          *,
          customers:customer_id (
            name,
            email
          ),
          batteries:battery_id (
            battery_id,
            model
          )
        `);
      
      if (userRole === 'partner') {
        query = query.eq('partner_id', user?.id);
      }
      
      const { data, error } = await query.order('transaction_date', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching transactions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'customers' | 'batteries'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTransactions(); // Refetch to get the related data
      toast({
        title: "Transaction recorded successfully",
        description: `Transaction ${transactionData.transaction_id} has been recorded.`,
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error recording transaction",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, userRole]);

  return {
    transactions,
    loading,
    addTransaction,
    refetch: fetchTransactions,
  };
};
