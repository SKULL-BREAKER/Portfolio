import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div className="container" style={{ padding: '2rem' }}>Loading secure environment...</div>;
  }

  if (!isAuthenticated || role !== 'OWNER') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
