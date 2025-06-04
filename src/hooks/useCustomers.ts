import { useState, useEffect } from 'react';
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
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<CustomerWithBattery[]>([]);
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
      
      setCustomers((data || []) as CustomerWithBattery[]);
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

  const addCustomer = async (customerData: Omit<CustomerWithBattery, 'id' | 'created_at' | 'updated_at' | 'batteries'>) => {
    try {
      // First, create the customer without battery assignment
      const customerToInsert = { ...customerData };
      const batteryId = customerToInsert.battery_id;
      
      // Temporarily remove battery_id to avoid constraint issues
      if (batteryId === 'none' || !batteryId) {
        customerToInsert.battery_id = null;
      }

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([customerToInsert])
        .select()
        .single();

      if (customerError) throw customerError;

      // If there's a battery to assign, update it separately
      if (batteryId && batteryId !== 'none') {
        const { error: batteryError } = await supabase
          .from('batteries')
          .update({ customer_id: customer.id })
          .eq('id', batteryId);

        if (batteryError) {
          console.error('Error assigning battery:', batteryError);
          // Don't fail the customer creation if battery assignment fails
          toast({
            title: "Customer created but battery assignment failed",
            description: "Customer was created successfully, but the battery could not be assigned.",
            variant: "destructive",
          });
        } else {
          // Update the customer record with the battery_id
          await supabase
            .from('customers')
            .update({ battery_id: batteryId })
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
      
      return { success: true, data: data as CustomerWithBattery };
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

export type { Customer, CustomerWithBattery };
