
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Partner {
  id: string;
  email: string;
  full_name: string;
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
      
      // First get all partner user IDs
      const { data: partnerRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'partner');

      if (rolesError) throw rolesError;

      if (!partnerRoles || partnerRoles.length === 0) {
        setPartners([]);
        return;
      }

      const partnerIds = partnerRoles.map(role => role.user_id);

      // Get partner profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', partnerIds);

      if (profilesError) throw profilesError;

      // Get battery counts for each partner
      const partnersWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [batteryCount, customerCount] = await Promise.all([
            supabase
              .from('batteries')
              .select('id', { count: 'exact' })
              .eq('partner_id', profile.id),
            supabase
              .from('customers')
              .select('id', { count: 'exact' })
              .eq('partner_id', profile.id)
          ]);

          return {
            ...profile,
            role: 'partner',
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
