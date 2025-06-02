
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminFunctions = () => {
  const { userRole } = useAuth();

  const createPartner = async (email: string, password: string, fullName: string) => {
    if (userRole !== 'admin') {
      throw new Error('Only admins can create partners');
    }

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name: fullName },
        email_confirm: true
      });

      if (authError) throw authError;

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
