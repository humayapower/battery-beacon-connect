
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
      // Hash the password
      const passwordHash = await hashPassword(password);

      // Use raw fetch to avoid TypeScript issues with local_auth table
      const response = await fetch('/rest/v1/rpc/create_partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb2Jsd3F3c2VmaG9zc2d3dnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTc2NDIsImV4cCI6MjA2NDQ3MzY0Mn0.pjKLodHDjHsQw_a_n7m9qGU_DkxQ4LWGQLTgt4eCYJ0'
        },
        body: JSON.stringify({
          p_username: username,
          p_password_hash: passwordHash,
          p_full_name: fullName,
          p_phone: phone,
          p_address: address || null,
          p_additional_details: additionalDetails || null
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create partner');
      }

      return { success: true, user: data };
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
