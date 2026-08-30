import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';
import { Award, ExternalLink } from 'lucide-react';

const CertificatesSection: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!username) return;
      try {
        const { data: profile } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
        if (!profile) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.from('certificates').select('*').eq('profile_id', profile.id).order('issue_date', { ascending: false });
        if (data) {
          setCertificates(data.map(d => ({
            ...d, 
            issueDate: d.issue_date, 
            fileUrl: d.file_url, 
            mimeType: d.mime_type
          })));
        }
      } catch (err) {
        console.error('Failed to fetch certificates');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) return <div>Loading certificates...</div>;
  if (certificates.length === 0) return null;

  return (
    <section id="certificates" style={{ padding: 'var(--space-16) 0' }}>
      <div className="container">
        <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          Certifications
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
          {certificates.map((cert) => (
            <div key={cert.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
              <div style={{ 
                width: '100%', 
                aspectRatio: '1.414 / 1', /* Standard certificate/A4 landscape ratio */
                backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
              }}>
                {cert.mimeType?.startsWith('image/') ? (
                  <img 
                    src={cert.fileUrl} 
                    alt={cert.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', gap: 'var(--space-2)' }}>
                    <Award size={48} color="var(--primary-color)" />
                    <span style={{ fontSize: 'var(--text-sm)' }}>PDF Document</span>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', margin: '0 0 var(--space-1) 0' }}>{cert.title}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--space-4) 0', fontSize: 'var(--text-sm)' }}>
                  {cert.organization} &bull; {new Date(cert.issueDate).getFullYear()}
                </p>
                <div style={{ marginTop: 'auto' }}>
                  {cert.fileUrl && (
                    <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <ExternalLink size={16} /> Open Full Size
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificatesSection;
