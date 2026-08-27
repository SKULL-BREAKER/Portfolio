import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VisitorLayout: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  
  return (
    <>
      <header style={{ 
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(10, 10, 11, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 50
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: '80px'
        }}>
          <Link to="/" style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'var(--font-mono)', 
            fontWeight: 600,
            letterSpacing: '0.05em' 
          }}>

            PORTFOLIO
          </Link>
          
          <nav style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
            <Link to="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Home</Link>
            <Link to="/profile" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Profile</Link>
            <Link to="/products" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Products</Link>
            <Link to="/certificates" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Certificates</Link>
          </nav>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
      
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: 'var(--space-8) 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
          <span>&copy; {new Date().getFullYear()} Secure Portfolio System</span>
          <span>SYSTEM STATUS: ONLINE</span>
        </div>
      </footer>
    </>
  );
};

export default VisitorLayout;
