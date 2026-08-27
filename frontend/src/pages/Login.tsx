import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { isAuthenticated, role, loading, loginWithGoogle } = useAuth();

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Initializing Secure Protocol...</div>;
  }

  if (isAuthenticated && role === 'OWNER') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="bg-grid"></div>
      <div className="premium-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', zIndex: 10 }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Owner Access</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Secure authentication required for dashboard access.
        </p>
        <button onClick={loginWithGoogle} className="btn btn-primary" style={{ width: '100%' }}>
          Authenticate via Google
        </button>
        {isAuthenticated && role !== 'OWNER' && (
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            Access denied. Visitor credentials detected.
          </p>
        )}
        <div style={{ marginTop: 'var(--space-8)' }}>
          <a href="/" style={{ fontSize: 'var(--text-sm)' }}>&larr; Return to public portfolio</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
