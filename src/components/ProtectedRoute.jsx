import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow access if user exists, even if email isn't confirmed
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to appropriate dashboard based on user's role
    const role = user.user_metadata?.role;
    switch (role) {
      case 'company_admin':
        return <Navigate to="/company/dashboard" replace />;
      case 'agent':
        return <Navigate to="/agent/dashboard" replace />;
      case 'customer':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 