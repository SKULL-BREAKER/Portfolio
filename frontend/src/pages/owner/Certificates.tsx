import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, File, Plus } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  organization: string;
  issueDate: string;
  fileUrl: string;
  originalFileName: string;
  mimeType: string;
}

const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase.from('certificates').select('*').order('issue_date', { ascending: false });
      if (data) {
        setCertificates(data.map(d => ({
          ...d,
          issueDate: d.issue_date,
          fileUrl: d.file_url,
          originalFileName: d.original_file_name,
          mimeType: d.mime_type
        })));
      }
    } catch (error) {
      console.error('Error fetching certificates', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !organization || !issueDate || !file) {
      setMessage('Please fill all fields and select a file.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('portfolio_files').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('portfolio_files').getPublicUrl(filePath);
      
      const payload = {
        profile_id: user.id,
        title,
        organization,
        issue_date: issueDate,
        file_url: data.publicUrl,
        original_file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        is_public: true
      };

      const { error } = await supabase.from('certificates').insert([payload]);
      if (error) throw error;
      
      setMessage('Certificate uploaded successfully!');
      setTitle('');
      setOrganization('');
      setIssueDate('');
      setFile(null);
      fetchCertificates();
    } catch (error) {
      console.error('Error uploading certificate', error);
      setMessage('Failed to upload certificate.');
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    
    try {
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) throw error;
      setCertificates(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting certificate', error);
      alert('Failed to delete certificate.');
    }
  };

  if (loading) return <div>Loading certificates...</div>;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>
        Manage Certificates
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        
        <div className="premium-card">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Add New Certificate
          </h3>
          
          {message && (
            <div style={{ 
              padding: 'var(--space-3)', 
              backgroundColor: message.includes('success') ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)', 
              color: message.includes('success') ? '#2ecc71' : '#e74c3c',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Certificate Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                placeholder="e.g. AWS Certified Developer"
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Organization / Issuer</label>
              <input 
                type="text" 
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                style={inputStyle}
                placeholder="e.g. Amazon Web Services"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Issue Date</label>
              <input 
                type="date" 
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Certificate File (PDF or Image)</label>
              <input 
                type="file" 
                onChange={handleFileChange}
                style={{ ...inputStyle, padding: 'var(--space-2)' }}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={uploading} style={{ marginTop: 'var(--space-2)' }}>
              {uploading ? 'Uploading...' : 'Upload Certificate'}
            </button>
          </form>
        </div>

        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Your Certificates</h3>
          
          {certificates.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No certificates uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {certificates.map(cert => (
                <div key={cert.id} className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {cert.mimeType?.startsWith('image/') ? (
                        <img 
                          src={cert.fileUrl} 
                          alt={cert.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <File size={24} color="var(--primary-color)" />
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 'var(--text-base)' }}>{cert.title}</h4>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {cert.organization} &bull; {new Date(cert.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(cert.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 'var(--space-2)' }}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: 'var(--space-3)', 
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'rgba(0,0,0,0.2)',
  color: 'var(--text-primary)'
};

export default Certificates;
