
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminFunctions = () => {
  const { userRole } = useAuth();

  const createPartner = async (
    fullName: string, 
    phone: string, 
    username: string, 
    password: string = '123456',
    address?: string,
    additionalDetails?: string
  ) => {
    if (userRole !== 'admin') {
      throw new Error('Only admins can create partners');
    }

    try {
      // Create a temporary email for Supabase auth using username
      const tempEmail = `${username}@partner.internal`;

      // Use regular signup with temporary email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            username: username,
            address: address || null,
            additional_details: additionalDetails || null,
          },
          emailRedirectTo: undefined, // No email verification for partners
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Assign partner role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'partner'
        });

      if (roleError) throw roleError;

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  };

  return {
    createPartner,
    isAdmin: userRole === 'admin'
  };
};
