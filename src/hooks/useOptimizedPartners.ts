
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Partner } from '@/types';

export const useOptimizedPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useAuth();
  const { toast } = useToast();

  const fetchPartners = async () => {
    if (userRole !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_partners_with_counts');

      if (error) {
        throw error;
      }

      setPartners(data || []);
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      toast({
        title: "Error fetching partners",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePartner = async (partnerId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', partnerId);

      if (error) {
        throw error;
      }

      toast({
        title: "Partner deleted successfully",
        description: "The partner and their associated data have been updated.",
      });

      await fetchPartners();
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Error deleting partner",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [userRole]);

  return {
    partners,
    loading,
    refetch: fetchPartners,
    deletePartner,
  };
};
