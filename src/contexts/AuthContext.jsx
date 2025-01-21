import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Company admin registration
  const registerCompanyAdmin = async (email, password, companyName) => {
    try {
      // 1. Create user with admin role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'company_admin'
          }
        }
      });

      if (authError) throw authError;

      // 2. Create company record
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          admin_id: authData.user.id
        });

      if (companyError) throw companyError;

      return { data: authData, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { data: null, error };
    }
  };

  // Agent invitation
  const inviteAgent = async (email, companyId) => {
    try {
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // Create invitation record
      const { error: inviteError } = await supabase
        .from('invites')
        .insert({
          email,
          role: 'agent',
          company_id: companyId,
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          created_by: user.id
        });

      if (inviteError) throw inviteError;

      // In a real app, you'd send an email here
      // For now, we'll just return the invitation link
      const inviteUrl = `/auth/register?invite=${token}&email=${email}`;
      
      return { data: { inviteUrl }, error: null };
    } catch (error) {
      console.error('Invite error:', error);
      return { data: null, error };
    }
  };

  // Customer registration
  const registerCustomer = async (email, password, companyId) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'customer',
            company_id: companyId
          }
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Customer registration error:', error);
      return { data: null, error };
    }
  };

  // Helper function to check user role
  const hasRole = (requiredRole) => {
    return user?.user_metadata?.role === requiredRole;
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    registerCompanyAdmin,
    inviteAgent,
    registerCustomer,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F3F4F6'
        }}>
          Loading...
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}; 