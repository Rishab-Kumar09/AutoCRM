import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, Building2, Mail, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import styles from './CompanyRegister.module.css';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    description: '',
    supportEmail: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);

      // 1. Create admin user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.password,
        options: {
          data: {
            role: 'company_admin'
          }
        }
      });

      if (authError) throw authError;

      // 2. Upload company logo if provided
      let logoUrl = null;
      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, formData.logo);

        if (uploadError) throw uploadError;
        logoUrl = fileName;
      }

      // 3. Create company record
      const { error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: formData.companyName,
            website: formData.website,
            industry: formData.industry,
            description: formData.description,
            support_email: formData.supportEmail,
            admin_id: authData.user.id,
            logo_url: logoUrl,
            is_verified: false
          }
        ]);

      if (companyError) throw companyError;

      // Success - redirect to success page or dashboard
      navigate('/auth/login', { 
        state: { 
          message: 'Registration successful! Please check your email to verify your account.' 
        }
      });

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerCompany}>
        <div className={styles.header}>
          <h2 className={styles.title}>Get started with AutoCRM</h2>
          <p className={styles.subtitle}>Create a company account to start providing customer support</p>
        </div>

        <div className={styles.formSteps}>
          <div className={`${styles.step} ${styles.stepActive}`}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepLabel}>Company Details</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepLabel}>Account Setup</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepLabel}>Verification</div>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.sectionTitle}>Company Information</div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Company Name</label>
              <div className={styles.inputWrapper}>
                <Building2 className={styles.icon} size={20} />
                <input
                  type="text"
                  name="companyName"
                  className={styles.input}
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Website</label>
              <div className={styles.inputWrapper}>
                <input
                  type="url"
                  name="website"
                  className={styles.input}
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Industry</label>
            <div className={styles.inputWrapper}>
              <select
                name="industry"
                className={styles.input}
                value={formData.industry}
                onChange={handleChange}
                required
              >
                <option value="">Select your industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Company Description</label>
            <textarea
              name="description"
              className={styles.textarea}
              placeholder="Tell us about your company..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Company Logo</label>
            <div className={styles.logoContainer}>
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className={styles.logoImage}
                />
              ) : (
                <Building2 size={24} className="text-gray-400" />
              )}
            </div>
            <input
              type="file"
              name="logo"
              id="logo"
              className="hidden"
              accept="image/*"
              onChange={handleLogoChange}
            />
            <label htmlFor="logo" className={styles.uploadButton}>
              <Upload size={20} />
              Choose Logo
            </label>
          </div>

          <div className={styles.sectionTitle}>Contact Information</div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Support Email</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.icon} size={20} />
                <input
                  type="email"
                  name="supportEmail"
                  className={styles.input}
                  placeholder="support@company.com"
                  value={formData.supportEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Admin Email</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.icon} size={20} />
                <input
                  type="email"
                  name="adminEmail"
                  className={styles.input}
                  placeholder="admin@company.com"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.icon} size={20} />
                <input
                  type="password"
                  name="password"
                  className={styles.input}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.icon} size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  className={styles.input}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Company Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegister; 