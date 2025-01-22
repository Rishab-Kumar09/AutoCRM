import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './Auth.module.css';

interface FormData {
  email: string;
  password: string;
  role: 'admin' | 'customer' | 'agent';
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    role: 'customer'
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (roleData?.role) {
          console.log('User already logged in, redirecting to:', `/${roleData.role}/dashboard`);
          navigate(`/${roleData.role}/dashboard`, { replace: true });
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        console.log('Attempting signup with:', { email: formData.email, role: formData.role });
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { role: formData.role }
          }
        });

        console.log('Signup response:', { error: signUpError, data });

        if (signUpError) throw signUpError;

        if (data?.user) {
          try {
            console.log('Creating user role:', { userId: data.user.id, role: formData.role });
            const { error: roleError } = await supabase.from('user_roles').insert({
              user_id: data.user.id,
              role: formData.role
            });

            if (roleError) throw roleError;
            
            setError('Please check your email to confirm your account.');
            setIsLoading(false);
            return;
          } catch (roleErr) {
            console.error('Role assignment failed:', roleErr);
            await supabase.auth.admin.deleteUser(data.user.id);
            throw new Error('Failed to set up account. Please try again.');
          }
        }
      } else {
        console.log('Attempting signin with:', { email: formData.email, role: formData.role });
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        console.log('Signin response:', { error: signInError, data });

        if (signInError) throw signInError;

        if (!data?.user) {
          throw new Error('No user data received');
        }

        // Get user role
        console.log('Fetching user role for:', data.user.id);
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        console.log('Role data:', { roleData, roleError });

        if (roleError) {
          throw new Error('Failed to verify user role');
        }
        
        if (roleData.role !== formData.role) {
          throw new Error(`Invalid role selected. You are registered as a ${roleData.role}`);
        }

        console.log('Navigating to dashboard:', `/${formData.role}/dashboard`);
        navigate(`/${formData.role}/dashboard`, { replace: true });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
    
    // Always reset loading state unless we've returned early
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Welcome to AutoCRM</h1>
        <p className={styles.subtitle}>{isSignUp ? 'Create an account' : 'Sign in to continue'}</p>
        
        {error && (
          <div className={`${styles.error} ${error.includes('check your email') ? styles.success : ''}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              required
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              required
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{isSignUp ? 'Register as' : 'Login as'}</label>
            <select
              name="role"
              required
              className={styles.input}
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="customer">Customer</option>
              <option value="agent">Support Agent</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign in')}
          </button>
        </form>

        <div className={styles.links}>
          <button 
            onClick={() => {
              if (!isLoading) {
                setIsSignUp(!isSignUp);
                setError(null);
                setFormData({ ...formData, password: '' });
              }
            }} 
            className={styles.link}
            disabled={isLoading}
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
          <span className={styles.divider}>•</span>
          <a href="#" className={`${styles.link} ${isLoading ? styles.disabled : ''}`}>Need help?</a>
        </div>
      </div>
    </div>
  );
};

export default Auth; 