import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (mounted) {
          setUser(session?.user ?? null);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Auth initialization error:', err);
          setError(err.message);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    error,
    signIn: async (email, password) => {
      try {
        setError(null);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        setError(err.message);
        return { data: null, error: err };
      }
    },
    signOut: async () => {
      try {
        setError(null);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (err) {
        setError(err.message);
        console.error('Sign out error:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 