
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  full_name: string;
  phone: string;
  address?: string;
  additional_details?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string, username?: string) => Promise<{ error: any }>;
  signIn: (identifier: string, password: string) => Promise<{ error: any }>;
  signInPartner: (username: string, password: string) => Promise<{ error: any }>;
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
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('local_auth_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setUserRole(userData.role);
      } catch (error) {
        localStorage.removeItem('local_auth_user');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string, username?: string) => {
    // This is kept for compatibility but we'll use local auth
    return { error: { message: 'Please use admin panel to create accounts' } };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const hashedPassword = await hashPassword(password);
      
      const { data, error } = await supabase
        .from('local_auth')
        .select('*')
        .eq('username', email) // Using email field as username for regular login
        .eq('password_hash', hashedPassword)
        .single();

      if (error || !data) {
        return { error: { message: 'Invalid credentials' } };
      }

      const userData: User = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        additional_details: data.additional_details,
        role: data.role
      };

      setUser(userData);
      setUserRole(data.role);
      localStorage.setItem('local_auth_user', JSON.stringify(userData));
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'Login failed' } };
    }
  };

  const signInPartner = async (username: string, password: string) => {
    try {
      const hashedPassword = await hashPassword(password);
      
      const { data, error } = await supabase
        .from('local_auth')
        .select('*')
        .eq('username', username)
        .eq('password_hash', hashedPassword)
        .single();

      if (error || !data) {
        return { error: { message: 'Invalid username or password' } };
      }

      const userData: User = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        additional_details: data.additional_details,
        role: data.role
      };

      setUser(userData);
      setUserRole(data.role);
      localStorage.setItem('local_auth_user', JSON.stringify(userData));
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'Invalid username or password' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('local_auth_user');
    window.location.href = '/auth';
  };

  const value = {
    user,
    userRole,
    loading,
    signUp,
    signIn,
    signInPartner,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
