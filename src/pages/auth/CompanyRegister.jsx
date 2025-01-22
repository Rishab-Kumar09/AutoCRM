import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './CompanyRegister.module.css';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    email: '',
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
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
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
          name: formData.companyName,
          industry: formData.industry,
          is_verified: false
        });

      if (companyError) throw companyError;

      // 3. Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) throw signInError;

      navigate('/company/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Register Your Company</h2>
          <p className={styles.subtitle}>
            Start providing customer support with AutoCRM
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Company Name</label>
              <input
                name="companyName"
                type="text"
                required
                className={styles.input}
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Industry</label>
              <select
                name="industry"
                required
                className={styles.input}
                value={formData.industry}
                onChange={handleChange}
              >
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Admin Email</label>
              <input
                name="email"
                type="email"
                required
                className={styles.input}
                value={formData.email}
                onChange={handleChange}
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
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Registering Company...' : 'Register Company'}
          </button>

          <div className={styles.terms}>
            By registering, you agree to our{' '}
            <Link to="/terms" className={styles.link}>Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegister; 