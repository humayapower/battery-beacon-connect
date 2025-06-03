
import { useAuth } from '@/contexts/AuthContext';
import { Partner } from '@/types';

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
    name: string, 
    phone: string, 
    username: string, 
    password: string = '123456',
    address?: string
  ) => {
    if (userRole !== 'admin') {
      throw new Error('Only admins can create partners');
    }

    try {
      const passwordHash = await hashPassword(password);

      const response = await fetch('https://mloblwqwsefhossgwvzt.supabase.co/rest/v1/rpc/create_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb2Jsd3F3c2VmaG9zc2d3dnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTc2NDIsImV4cCI6MjA2NDQ3MzY0Mn0.pjKLodHDjHsQw_a_n7m9qGU_DkxQ4LWGQLTgt4eCYJ0'
        },
        body: JSON.stringify({
          p_name: name,
          p_phone: phone,
          p_username: username,
          p_password_hash: passwordHash,
          p_role: 'partner',
          p_address: address || null
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create partner');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  };

  const updatePartner = async (
    partnerId: string,
    updates: Partial<Pick<Partner, 'name' | 'phone' | 'address'>> & { password?: string }
  ) => {
    if (userRole !== 'admin') {
      throw new Error('Only admins can update partners');
    }

    try {
      const updateData: any = { ...updates };
      
      if (updates.password) {
        updateData.password_hash = await hashPassword(updates.password);
        delete updateData.password;
      }

      const response = await fetch(`https://mloblwqwsefhossgwvzt.supabase.co/rest/v1/users?id=eq.${partnerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb2Jsd3F3c2VmaG9zc2d3dnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTc2NDIsImV4cCI6MjA2NDQ3MzY0Mn0.pjKLodHDjHsQw_a_n7m9qGU_DkxQ4LWGQLTgt4eCYJ0',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update partner');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  };

  return {
    createPartner,
    updatePartner,
    isAdmin: userRole === 'admin'
  };
};
