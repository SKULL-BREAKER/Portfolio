import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Shield, Zap, Globe, LayoutTemplate } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleGetStarted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await loginWithEmail(email);
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'transparent', 
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          <Shield style={{ color: '#3b82f6' }} />
          <span>PORTFOLIO</span>
        </div>
        <Link to="/admin" style={{
          padding: '0.5rem 1.25rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '6rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          fontSize: '0.875rem',
          fontWeight: 500,
          marginBottom: '2rem'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
          The Ultimate Portfolio SaaS
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Build your professional <br /> identity in minutes.
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: '#a1a1aa',
          maxWidth: '600px',
          marginBottom: '3rem',
          lineHeight: 1.6
        }}>
          Create a stunning, highly secure portfolio with your own unique URL. Just enter your email to get started. No passwords required.
        </p>

        <form 
          onSubmit={handleGetStarted}
          style={{
            display: 'flex',
            gap: '0.5rem',
            width: '100%',
            maxWidth: '450px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '0.5rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '9999px',
              padding: '0 1.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? 'Sending...' : 'Get Started'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0', width: '100%', maxWidth: '450px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button 
          onClick={loginWithGoogle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100%',
            maxWidth: '450px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '9999px',
            padding: '0.875rem 1.5rem',
            fontWeight: 500,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </main>

      {/* Features */}
      <section style={{
        maxWidth: '1200px',
        margin: '4rem auto 8rem',
        padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {[
          { icon: <LayoutTemplate size={24} />, title: 'Beautiful Themes', desc: 'Customizable colors and layouts designed to impress.' },
          { icon: <Globe size={24} />, title: 'Unique URL', desc: 'Claim your username and share your unique portfolio link.' },
          { icon: <Zap size={24} />, title: 'Lightning Fast', desc: 'Built with Vite and React for instant page loads.' },
        ].map((feature, i) => (
          <div key={i} style={{
            padding: '2rem',
            borderRadius: '1rem',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ color: '#3b82f6' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{feature.title}</h3>
            <p style={{ color: '#a1a1aa', lineHeight: 1.5 }}>{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Landing;
