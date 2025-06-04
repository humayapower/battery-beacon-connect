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
      // Create customer without battery assignment first
      const customerToInsert = { ...customerData };
      delete customerToInsert.battery_id; // Remove battery_id completely for initial insert
      
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([customerToInsert])
        .select()
        .single();

      if (customerError) throw customerError;

      // If there's a battery to assign, handle it after customer creation
      if (customerData.battery_id && customerData.battery_id !== 'none') {
        // First update the battery to assign it to the customer
        const { error: batteryUpdateError } = await supabase
          .from('batteries')
          .update({ 
            customer_id: customer.id,
            status: 'assigned'
          })
          .eq('id', customerData.battery_id);

        if (batteryUpdateError) {
          console.error('Error updating battery:', batteryUpdateError);
          toast({
            title: "Customer created but battery assignment failed",
            description: "Customer was created successfully, but the battery could not be assigned.",
            variant: "destructive",
          });
        } else {
          // Then update the customer record with the battery_id
          const { error: customerUpdateError } = await supabase
            .from('customers')
            .update({ battery_id: customerData.battery_id })
            .eq('id', customer.id);

          if (customerUpdateError) {
            console.error('Error updating customer with battery_id:', customerUpdateError);
          }
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
