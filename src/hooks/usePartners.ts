
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Partner } from '@/types';

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useAuth();
  const { toast } = useToast();

  const fetchPartners = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/rest/v1/rpc/get_partners_with_counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb2Jsd3F3c2VmaG9zc2d3dnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTc2NDIsImV4cCI6MjA2NDQ3MzY0Mn0.pjKLodHDjHsQw_a_n7m9qGU_DkxQ4LWGQLTgt4eCYJ0'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch partners');
      }

      setPartners(data || []);
    } catch (error: any) {
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
      const response = await fetch(`/rest/v1/partners?id=eq.${partnerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb2Jsd3F3c2VmaG9zc2d3dnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTc2NDIsImV4cCI6MjA2NDQ3MzY0Mn0.pjKLodHDjHsQw_a_n7m9qGU_DkxQ4LWGQLTgt4eCYJ0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete partner');
      }

      toast({
        title: "Partner deleted successfully",
        description: "The partner and their associated data have been updated.",
      });

      fetchPartners(); // Refresh the list
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error deleting partner",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      fetchPartners();
    }
  }, [userRole]);

  return {
    partners,
    loading,
    refetch: fetchPartners,
    deletePartner,
  };
};
