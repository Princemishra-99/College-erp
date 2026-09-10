import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * ProtectedRoute – wraps routes to enforce role-based access control.
 * If a user tries to access a route they don't have permission for,
 * they are redirected to their own dashboard with a toast notification.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, role } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Show a friendly access-denied message
    toast.error(`Access denied! This page is for ${allowedRoles.join(' / ')} only.`, { id: 'access-denied' });

    // Redirect to their own role's dashboard
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};
