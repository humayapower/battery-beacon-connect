
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  phone: string;
  address: string | null;
}

interface UserRole {
  role: 'admin' | 'partner';
}

interface User {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  role: 'admin' | 'partner';
}

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, phone: string, address?: string) => Promise<{ error: any }>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId)
      ]);

      if (profile && roles && roles.length > 0) {
        const userData: User = {
          id: profile.id,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          role: roles[0].role as 'admin' | 'partner'
        };
        setUser(userData);
        setUserRole(roles[0].role);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Login failed. Please try again.' } };
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string, address?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            address,
            role: 'partner' // Default role
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign up failed. Please try again.' } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setSession(null);
    window.location.href = '/auth';
  };

  const value = {
    user,
    userRole,
    loading,
    session,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
