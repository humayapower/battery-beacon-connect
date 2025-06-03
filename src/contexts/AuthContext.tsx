
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

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
      const hashedPassword = await hashPassword(password);
      
      const response = await fetch('/rest/v1/rpc/authenticate_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb2Jsd3F3c2VmaG9zc2d3dnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTc2NDIsImV4cCI6MjA2NDQ3MzY0Mn0.pjKLodHDjHsQw_a_n7m9qGU_DkxQ4LWGQLTgt4eCYJ0'
        },
        body: JSON.stringify({
          p_username: username,
          p_password_hash: hashedPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data || data.length === 0) {
        return { error: { message: 'Invalid username or password' } };
      }

      const userData: User = {
        id: data[0].id,
        name: data[0].name,
        phone: data[0].phone,
        username: data[0].username,
        address: data[0].address,
        role: data[0].role
      };

      setUser(userData);
      setUserRole(data[0].role);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'Login failed' } };
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
