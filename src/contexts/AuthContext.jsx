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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: undefined
        }
      });

      // If we have user data but get an email confirmation error, consider it successful
      if (error?.message?.includes('Email not confirmed') && data?.user) {
        return { data, error: null };
      }

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'customer' },
          emailRedirectTo: undefined
        }
      });

      // If signup is successful, immediately sign in
      if (!error && data?.user) {
        return await signIn(email, password);
      }

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email),
    updatePassword: (newPassword) => supabase.auth.updateUser({ password: newPassword })
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 