import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext mounted. Env email is:', process.env.VITE_OWNER_EMAIL);
    
    // Check active session and sets the user
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        updateStateWithSession(session);
      } catch (error) {
        console.error('Session check failed', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateStateWithSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateStateWithSession = (session: Session | null) => {
    if (session && session.user) {
      setIsAuthenticated(true);
      setUser(session.user);
      
      // Determine if user is OWNER based on environment variable
      const envEmail = process.env.VITE_OWNER_EMAIL || 'nanthakumar7750@gmail.com';
      const userEmail = session.user.email || '';
      console.log('Login check:', { envEmail, userEmail });
      // TEMPORARILY FORCE TRUE FOR DEBUGGING
      const isOwner = true; 
      setRole(isOwner ? 'OWNER' : 'VISITOR');
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const loginWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });
      if (error) throw error;
      alert('Check your email for the secure login link!');
    } catch (error) {
      console.error('Login failed', error);
      alert('Failed to send login link.');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, loading, loginWithGoogle, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
