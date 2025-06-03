
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  partner_id: string | null;
  battery_id: string | null;
  status: 'Active' | 'Pending' | 'Inactive';
  join_date: string | null;
  last_payment_date: string | null;
  monthly_fee: number | null;
  created_at: string;
  updated_at: string;
  batteries?: {
    serial_number: string;
    model: string;
    capacity: string;
  } | null;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole, user } = useAuth();
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('customers')
        .select(`
          *,
          batteries!customers_battery_id_fkey (
            serial_number,
            model,
            capacity
          )
        `);
      
      if (userRole === 'partner') {
        query = query.eq('partner_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Customer interface
      const transformedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'Active' | 'Pending' | 'Inactive',
        batteries: item.batteries || null
      }));
      
      setCustomers(transformedData);
    } catch (error: any) {
      toast({
        title: "Error fetching customers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'batteries'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchCustomers(); // Refetch to get the battery data
      toast({
        title: "Customer added successfully",
        description: `Customer ${customerData.name} has been added.`,
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error adding customer",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCustomers(); // Refetch to get updated data with relations
      toast({
        title: "Customer updated successfully",
        description: "Customer information has been updated.",
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error updating customer",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const getCustomerById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          batteries!customers_battery_id_fkey (
            serial_number,
            model,
            capacity,
            status
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Transform the data to match our Customer interface
      const transformedData = {
        ...data,
        status: data.status as 'Active' | 'Pending' | 'Inactive',
        batteries: data.batteries || null
      };
      
      return { success: true, data: transformedData };
    } catch (error: any) {
      toast({
        title: "Error fetching customer details",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user, userRole]);

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    getCustomerById,
    refetch: fetchCustomers,
  };
};
