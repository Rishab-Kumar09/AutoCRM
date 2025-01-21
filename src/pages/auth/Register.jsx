import React, { useState } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get registration context from URL params
  const queryParams = new URLSearchParams(location.search);
  const inviteToken = queryParams.get('invite');
  const role = queryParams.get('role') || 'customer';
  
  const [formData, setFormData] = useState({
    email: queryParams.get('email') || '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // If there's an invite token, verify it first
      if (inviteToken) {
        const { data: inviteData, error: inviteError } = await supabase
          .from('invites')
          .select('role, company_id, email')
          .eq('token', inviteToken)
          .single();

        if (inviteError || !inviteData) {
          throw new Error('Invalid or expired invitation');
        }

        if (inviteData.email !== formData.email) {
          throw new Error('Email does not match invitation');
        }

        // Use invite data for registration
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: inviteData.role,
              company_id: inviteData.company_id
            }
          }
        });

        if (signUpError) throw signUpError;

        // Delete used invitation
        await supabase
          .from('invites')
          .delete()
          .eq('token', inviteToken);

        // Redirect based on role
        if (inviteData.role === 'agent') {
          navigate('/agent/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Regular customer registration
        if (!companyId) {
          throw new Error('Company ID is required for registration');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: 'customer',
              company_id: companyId
            }
          }
        });

        if (signUpError) throw signUpError;
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {inviteToken ? 'Accept Invitation' : 'Create an Account'}
          </h2>
          <p className={styles.subtitle}>
            {inviteToken 
              ? 'Complete your account setup'
              : 'Get started with customer support'}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              required
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              disabled={!!inviteToken} // Email is locked for invites
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              required
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              placeholder="Choose a password"
              minLength={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className={styles.input}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading 
              ? 'Creating Account...' 
              : inviteToken 
                ? 'Accept Invitation'
                : 'Create Account'}
          </button>

          <div className={styles.links}>
            <p>
              Already have an account?{' '}
              <Link to="/auth/login" className={styles.link}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 