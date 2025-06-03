
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Battery } from '@/types';

export const useBatteries = () => {
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole, user } = useAuth();
  const { toast } = useToast();

  const fetchBatteries = async () => {
    try {
      setLoading(true);
      let query = supabase.from('batteries').select(`
        id,
        serial_number,
        model,
        model_name,
        manufacturing_date,
        voltage,
        capacity,
        status,
        partner_id,
        customer_id,
        warranty_expiry,
        warranty_period,
        purchase_date,
        last_maintenance,
        location,
        imei_number,
        sim_number,
        created_at,
        updated_at
      `);
      
      if (userRole === 'partner') {
        query = query.eq('partner_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setBatteries((data || []) as Battery[]);
    } catch (error: any) {
      toast({
        title: "Error fetching batteries",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBattery = async (batteryData: Omit<Battery, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('batteries')
        .insert([batteryData])
        .select(`
          id,
          serial_number,
          model,
          model_name,
          manufacturing_date,
          voltage,
          capacity,
          status,
          partner_id,
          customer_id,
          warranty_expiry,
          warranty_period,
          purchase_date,
          last_maintenance,
          location,
          imei_number,
          sim_number,
          created_at,
          updated_at
        `)
        .single();

      if (error) throw error;
      
      setBatteries(prev => [data as Battery, ...prev]);
      toast({
        title: "Battery added successfully",
        description: `Battery ${batteryData.serial_number} has been added.`,
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error adding battery",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateBattery = async (id: string, updates: Partial<Battery>) => {
    try {
      const { data, error } = await supabase
        .from('batteries')
        .update(updates)
        .eq('id', id)
        .select(`
          id,
          serial_number,
          model,
          model_name,
          manufacturing_date,
          voltage,
          capacity,
          status,
          partner_id,
          customer_id,
          warranty_expiry,
          warranty_period,
          purchase_date,
          last_maintenance,
          location,
          imei_number,
          sim_number,
          created_at,
          updated_at
        `)
        .single();

      if (error) throw error;
      
      setBatteries(prev => prev.map(battery => 
        battery.id === id ? { ...battery, ...data } as Battery : battery
      ));
      
      toast({
        title: "Battery updated successfully",
        description: "Battery information has been updated.",
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error updating battery",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchBatteries();
    }
  }, [user, userRole]);

  return {
    batteries,
    loading,
    addBattery,
    updateBattery,
    refetch: fetchBatteries,
  };
};

export type { Battery };
