
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
      // Check if username already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingProfile) {
        throw new Error('Username already exists');
      }

      // Check if phone already exists
      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', phone)
        .single();

      if (existingPhone) {
        throw new Error('Phone number already exists');
      }

      // Create a dummy email that follows email format but isn't real
      const dummyEmail = `${username.replace(/[^a-zA-Z0-9]/g, '')}.partner@internal.local`;

      // Use regular signup with dummy email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dummyEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            username: username,
            address: address || null,
            additional_details: additionalDetails || null,
            is_partner: true,
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
