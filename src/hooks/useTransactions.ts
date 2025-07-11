
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types';

interface TransactionWithRelations extends Transaction {
  customers?: {
    name: string;
    email: string;
  };
  batteries?: {
    serial_number: string;
    model: string;
  };
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
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
            serial_number,
            model
          )
        `);
      
      if (userRole === 'partner') {
        query = query.eq('partner_id', user?.id);
      }
      
      const { data, error } = await query.order('transaction_date', { ascending: false });
      
      if (error) throw error;
      
      // Fixed: Removed redundant property mapping
      setTransactions((data || []) as TransactionWithRelations[]);
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

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
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
        description: `Transaction has been recorded.`,
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

export type { TransactionWithRelations };
