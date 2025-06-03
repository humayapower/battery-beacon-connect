
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      
      // Get all partners from local_auth table
      const { data: partnersData, error: partnersError } = await supabase
        .from('local_auth')
        .select('*')
        .eq('role', 'partner');

      if (partnersError) throw partnersError;

      if (!partnersData || partnersData.length === 0) {
        setPartners([]);
        return;
      }

      // Get battery and customer counts for each partner
      const partnersWithCounts = await Promise.all(
        partnersData.map(async (partner) => {
          const [batteryCount, customerCount] = await Promise.all([
            supabase
              .from('batteries')
              .select('id', { count: 'exact' })
              .eq('partner_id', partner.id),
            supabase
              .from('customers')
              .select('id', { count: 'exact' })
              .eq('partner_id', partner.id)
          ]);

          return {
            ...partner,
            battery_count: batteryCount.count || 0,
            customer_count: customerCount.count || 0
          };
        })
      );

      setPartners(partnersWithCounts);
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
