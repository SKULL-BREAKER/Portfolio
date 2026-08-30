import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, FolderGit2, Mail, Link as LinkIcon } from 'lucide-react';


const Home: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
        if (profileData) {
          setProfile({
            ...profileData,
            profileImage: profileData.profile_image,
            resumeFile: profileData.resume_file
          });
        }
        
        const { data: linksData, error: linksError } = await supabase.from('social_links').select('*').order('display_order', { ascending: true });
        if (linksData) {
          setLinks(linksData.map(l => ({ ...l, displayName: l.display_name })));
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
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
            lineHeight: '1.1',
            letterSpacing: '-0.03em',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)'
          }}>
            {profile?.profileImage && (
              <img 
                src={profile.profileImage} 
                alt="Profile"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--border-color)',
                  boxShadow: '0 0 15px rgba(226, 232, 240, 0.2)'
                }}
              />
            )}
            {profile?.name || 'Nanthakumar.T'}
          </h1>
          
          <p style={{ 
            fontSize: 'var(--text-lg)', 
            color: 'var(--text-tertiary)',
            maxWidth: '600px',
            marginBottom: 'var(--space-8)'
          }}>
            {profile?.about}
          </p>
          
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
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
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--border-color)',
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
        
      </div>
    </div>
  );
};

export default Home;
