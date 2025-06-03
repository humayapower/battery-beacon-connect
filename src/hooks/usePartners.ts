
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Partner {
  id: string;
  username: string;
  full_name: string;
  phone: string;
  address?: string;
  additional_details?: string;
  created_at: string;
  updated_at: string;
  role: string;
  battery_count?: number;
  customer_count?: number;
}

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useAuth();
  const { toast } = useToast();

  const fetchPartners = async () => {
    try {
      setLoading(true);
      
      // Use raw fetch to avoid TypeScript issues with local_auth table
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

  useEffect(() => {
    if (userRole === 'admin') {
      fetchPartners();
    }
  }, [userRole]);

  return {
    partners,
    loading,
    refetch: fetchPartners,
  };
};
