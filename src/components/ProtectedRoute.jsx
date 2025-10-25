import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Redirect Hayabusa users to their dashboard if they try to access other routes
  if (user?.role === 'hayabusa' && !location.pathname.startsWith('/hayabusa')) {
    return <Navigate to="/hayabusa/dashboard" />;
  }

  // Prevent non-Hayabusa users from accessing Hayabusa routes
  if (user?.role !== 'hayabusa' && location.pathname.startsWith('/hayabusa')) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;