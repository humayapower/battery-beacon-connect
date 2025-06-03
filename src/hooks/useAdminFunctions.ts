
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Simple hash function for passwords (in production, use bcrypt or similar)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

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
      const { data: existingUsername, error: usernameError } = await supabase
        .from('local_auth')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUsername) {
        throw new Error('Username already exists');
      }

      // Check if phone already exists
      const { data: existingPhone, error: phoneError } = await supabase
        .from('local_auth')
        .select('phone')
        .eq('phone', phone)
        .single();

      if (existingPhone) {
        throw new Error('Phone number already exists');
      }

      // Hash the password
      const passwordHash = await hashPassword(password);

      // Create partner in local_auth table
      const { data: authData, error: authError } = await supabase
        .from('local_auth')
        .insert({
          username,
          password_hash: passwordHash,
          full_name: fullName,
          phone,
          address: address || null,
          additional_details: additionalDetails || null,
          role: 'partner'
        })
        .select()
        .single();

      if (authError) throw authError;

      return { success: true, user: authData };
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
