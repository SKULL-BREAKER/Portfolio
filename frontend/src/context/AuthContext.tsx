import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configure axios for credentials
axios.defaults.withCredentials = true;

interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  loading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/session');
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setRole(response.data.role);
        }
      } catch (error) {
        console.error('Session check failed');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loginWithGoogle = () => {
    // Navigate directly to backend URL to ensure session cookie is set properly
    // This avoids issues with cross-origin AJAX Set-Cookie headers being blocked by SameSite policies
    window.location.href = '/api/auth/google/url';
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setIsAuthenticated(false);
      setRole(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
