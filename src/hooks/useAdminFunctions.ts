import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Partner } from '@/types';

export const useAdminFunctions = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();

  const createPartner = async (
    name: string, 
    phone: string, 
    email: string, 
    password: string = '123456',
    address?: string
  ) => {
    if (userRole !== 'admin') {
      throw new Error('Only admins can create partners');
    }

    try {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            address,
            role: 'partner'
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      toast({
        title: "Partner created successfully",
        description: `Partner ${name} has been created. They will receive a confirmation email.`,
      });

      return { success: true, data: authData.user };
    } catch (error: any) {
      console.error('Error creating partner:', error);
      toast({
        title: "Error creating partner",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePartner = async (
    partnerId: string,
    updates: Partial<Pick<Partner, 'name' | 'phone' | 'address'>>
  ) => {
    if (userRole !== 'admin') {
      throw new Error('Only admins can update partners');
    }

    try {
      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', partnerId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Partner updated successfully",
        description: "Partner information has been updated.",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating partner:', error);
      toast({
        title: "Error updating partner",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePartner = async (partnerId: string) => {
    if (userRole !== 'admin') {
      throw new Error('Only admins can delete partners');
    }

    try {
      // Delete user from auth (cascade will handle profiles and user_roles)
      const { error } = await supabase.auth.admin.deleteUser(partnerId);

      if (error) throw error;

      toast({
        title: "Partner deleted successfully",
        description: "The partner has been removed.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Error deleting partner",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    createPartner,
    updatePartner,
    deletePartner,
    isAdmin: userRole === 'admin'
  };
};
