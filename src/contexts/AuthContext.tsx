
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple hash function for passwords (in production, use bcrypt or similar)
const hashPassword = async (password: string): Promise<string> => {
  try {
    // Check if crypto.subtle is available (required for HTTPS or localhost)
    if (!crypto?.subtle) {
      console.warn('crypto.subtle not available, falling back to simple encoding');
      // Fallback for non-HTTPS environments
      return btoa(password).replace(/[^a-zA-Z0-9]/g, '');
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error hashing password:', error);
    // Fallback for any crypto errors
    return btoa(password).replace(/[^a-zA-Z0-9]/g, '');
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setUserRole(userData.role);
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      console.log('Attempting login with username:', username);
      const hashedPassword = await hashPassword(password);
      console.log('Password hash generated:', hashedPassword);
      
      // For debugging: log the expected hash for admin123
      if (username === 'admin' && password === 'admin123') {
        console.log('Expected hash for admin123:', 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d');
        console.log('Generated hash matches expected:', hashedPassword === 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d');
      }
      
      // Use Supabase client for better error handling and CORS compatibility
      const { data, error } = await supabase.rpc('authenticate_user', {
        p_username: username,
        p_password_hash: hashedPassword
      });

      console.log('Authentication response:', { data, error });

      if (error) {
        console.error('Authentication error:', error);
        return { error: { message: 'Authentication failed. Please check your credentials.' } };
      }

      if (!data || data.length === 0) {
        return { error: { message: 'Invalid username or password' } };
      }

      const userData: User = {
        id: data[0].id,
        name: data[0].name,
        phone: data[0].phone,
        username: data[0].username,
        address: data[0].address,
        role: data[0].role as 'admin' | 'partner'
      };

      setUser(userData);
      setUserRole(data[0].role);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error: { message: 'Login failed. Please try again.' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('auth_user');
    window.location.href = '/auth';
  };

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
