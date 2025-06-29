
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/types';

interface CustomerWithBattery extends Customer {
  batteries?: {
    serial_number: string;
    model: string;
    capacity: string;
  } | null;
  partner?: {
    name: string;
  } | null;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<CustomerWithBattery[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole, user } = useAuth();
  const { toast } = useToast();

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchCustomers = useCallback(async () => {
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
          ),
          users!customers_partner_id_fkey (
            name
          )
        `);
      
      if (userRole === 'partner') {
        query = query.eq('partner_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const transformedData = (data || []).map(customer => ({
        ...customer,
        partner: customer.users ? { name: customer.users.name } : null,
        users: undefined
      }));
      
      setCustomers(transformedData as CustomerWithBattery[]);
    } catch (error: any) {
      toast({
        title: "Error fetching customers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userRole, user?.id, toast]);

  const addCustomer = useCallback(async (customerData: Omit<CustomerWithBattery, 'id' | 'created_at' | 'updated_at' | 'batteries'>) => {
    try {
      const customerToInsert = { ...customerData };
      delete customerToInsert.battery_id;
      
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([customerToInsert])
        .select()
        .single();

      if (customerError) throw customerError;

      if (customerData.battery_id && customerData.battery_id !== 'none') {
        const { error: batteryUpdateError } = await supabase
          .from('batteries')
          .update({ 
            customer_id: customer.id,
            status: 'assigned'
          })
          .eq('id', customerData.battery_id);

        if (!batteryUpdateError) {
          await supabase
            .from('customers')
            .update({ battery_id: customerData.battery_id })
            .eq('id', customer.id);
        }
      }
      
      await fetchCustomers();
      toast({
        title: "Customer added successfully",
        description: `Customer ${customerData.name} has been added.`,
      });
      
      return { success: true, data: customer };
    } catch (error: any) {
      toast({
        title: "Error adding customer",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [fetchCustomers, toast]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCustomers();
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
  }, [fetchCustomers, toast]);

  const getCustomerById = useCallback(async (id: string) => {
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
      
      return { success: true, data: data as CustomerWithBattery };
    } catch (error: any) {
      toast({
        title: "Error fetching customer details",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user, fetchCustomers]);

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    getCustomerById,
    refetch: fetchCustomers,
  };
};

export type { Customer, CustomerWithBattery };
