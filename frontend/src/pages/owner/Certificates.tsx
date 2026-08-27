import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  // Form state
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/api/certificates');
      if (response.data.success) {
        setCertificates(response.data.certificates || []);
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

    const formData = new FormData();
    formData.append('title', title);
    formData.append('organization', organization);
    formData.append('issueDate', issueDate);
    formData.append('file', file);
    formData.append('isPublic', 'true');

    try {
      const response = await axios.post('/api/certificates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setMessage('Certificate uploaded successfully!');
        // Reset form
        setTitle('');
        setOrganization('');
        setIssueDate('');
        setFile(null);
        // Refresh list
        fetchCertificates();
      }
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
      const response = await axios.delete(`/api/certificates/${id}`);
      if (response.data.success) {
        setCertificates(prev => prev.filter(c => c.id !== id));
      }
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
        
        {/* Upload Form */}
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

        {/* Certificates List */}
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
                          src={`/api/files/${cert.fileUrl}`} 
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
