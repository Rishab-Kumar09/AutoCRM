import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError, data } = await signUp(formData.email, formData.password);
      
      if (signUpError) {
        if (signUpError.message.includes('email confirmation')) {
          // Ignore email confirmation errors and proceed
          navigate('/');
          return;
        }
        throw signUpError;
      }

      // User is signed in at this point
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-secondary mt-2">Get started with AutoCRM</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-red-600 bg-red-50 rounded-md">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="settings-field">
              <label>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="settings-field">
              <label>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            </div>

            <div className="settings-field">
              <label>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="button button-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/auth/login" className="text-primary hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 