import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, Download, FolderGit2, Mail, Link as LinkIcon, X } from 'lucide-react';


const Home: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      try {
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
        if (profileData) {
          setProfile({
            ...profileData,
            profileImage: profileData.profile_image,
            resumeFile: profileData.resume_file
          });
          
          const { data: linksData, error: linksError } = await supabase.from('social_links').select('*').eq('profile_id', profileData.id).order('display_order', { ascending: true });
          if (linksData) {
            setLinks(linksData.map(l => ({ ...l, displayName: l.display_name })));
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        // Fallback placeholder to demonstrate aesthetic
        setProfile({
          headline: 'Senior Software Engineer & Data Scientist',
          about: 'Specializing in high-performance distributed systems and applied machine learning.',
          name: 'Anonymous Engineer'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (notFound) {
    return <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
      <h1>Portfolio Not Found</h1>
      <p>The username "{username}" does not exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Create Your Own Portfolio</Link>
    </div>;
  }

  if (loading) {
    return <div className="container" style={{ padding: '8rem 0' }}>Initializing systems...</div>;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
        
        {/* HERO SECTION */}
        <section style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          maxWidth: '800px'
        }}>
          <div style={{
            display: 'inline-block',
            padding: 'var(--space-1) var(--space-3)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-secondary)'
          }}>
            Status: {profile?.status || 'Available for opportunities'}
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 6vw, 4rem)', 
            lineHeight: '1.1',
            letterSpacing: '-0.03em',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            whiteSpace: 'nowrap',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {profile?.profileImage && (
              <img 
                src={profile.profileImage} 
                alt="Profile"
                onClick={() => setIsImageModalOpen(true)}
                style={{
                  width: 'min(80px, 12vw)',
                  height: 'min(80px, 12vw)',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--border-color)',
                  boxShadow: '0 0 15px rgba(226, 232, 240, 0.2)',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}
              />
            )}
            {profile?.name || profile?.username || 'Anonymous'}
          </h1>
          
          <p style={{ 
            fontSize: 'var(--text-lg)', 
            color: 'var(--text-tertiary)',
            maxWidth: '600px',
            marginBottom: 'var(--space-8)',
            whiteSpace: 'pre-wrap'
          }}>
            {profile?.about}
          </p>
          
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link to={`/${profile?.username}/products`} className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
              Explore Products <ArrowRight size={16} />
            </Link>
            {profile?.resumeFile && (
              <a href={profile.resumeFile} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ gap: 'var(--space-2)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <Download size={16} /> View Resume
              </a>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-6)', 
            marginTop: 'var(--space-12)',
            width: '100%',
            flexWrap: 'wrap'
          }}>
            {links.map(link => {
              let Icon = LinkIcon;
              if (link.platform === 'github') Icon = FolderGit2;
              if (link.platform === 'linkedin') Icon = Mail;
              if (link.platform === 'twitter') Icon = LinkIcon;
              if (link.platform === 'email') Icon = Mail;

              return (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                  <Icon size={18} /> {link.displayName}
                </a>
              );
            })}
          </div>
        </section>
        
        {/* PROFILE IMAGE FULLSCREEN MODAL */}
        {isImageModalOpen && profile?.profileImage && (
          <div 
            onClick={() => setIsImageModalOpen(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'zoom-out'
            }}
          >
            <button 
              onClick={() => setIsImageModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <X size={24} />
            </button>
            <img 
              src={profile.profileImage} 
              alt="Profile Full"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 0 40px rgba(0,0,0,0.5)',
                cursor: 'default'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
