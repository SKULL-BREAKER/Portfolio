import React, { useEffect } from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const VisitorLayout: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const { username } = useParams<{ username: string }>();
  const { fetchThemeByUsername } = useTheme();

  useEffect(() => {
    if (username) {
      fetchThemeByUsername(username);
    }
  }, [username]);
  
  const base = `/${username}`;

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
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 0',
          minHeight: '80px'
        }}>
          <Link to={base} style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'var(--font-mono)', 
            fontWeight: 600,
            letterSpacing: '0.05em' 
          }}>
            PORTFOLIO
          </Link>
          
          <nav style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to={base} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Home</Link>
            <Link to={`${base}/profile`} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Profile</Link>
            <Link to={`${base}/products`} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Products</Link>
            <Link to={`${base}/certificates`} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Certificates</Link>
          </nav>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
      
      <footer style={{ padding: 'var(--space-8) 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
          <span>&copy; {new Date().getFullYear()} Secure Portfolio System</span>
          <span>SYSTEM STATUS: ONLINE</span>
        </div>
      </footer>
    </>
  );
};

export default VisitorLayout;
