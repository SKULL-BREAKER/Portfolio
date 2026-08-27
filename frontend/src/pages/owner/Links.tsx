import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Link as LinkIcon, Plus } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  displayName: string;
  url: string;
  isPublic: boolean;
}

const Links: React.FC = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    platform: 'github',
    displayName: '',
    url: '',
    isPublic: true
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await axios.get('/api/links');
      if (response.data.success) {
        setLinks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching links', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const response = await axios.post('/api/links', formData);
      if (response.data.success) {
        setMessage('Link added successfully!');
        setFormData({ platform: 'github', displayName: '', url: '', isPublic: true });
        fetchLinks();
      }
    } catch (error) {
      console.error('Error adding link', error);
      setMessage('Failed to add link.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    
    try {
      const response = await axios.delete(`/api/links/${id}`);
      if (response.data.success) {
        setLinks(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting link', error);
      alert('Failed to delete link.');
    }
  };

  if (loading) return <div>Loading links...</div>;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>
        Manage Social Links
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        
        {/* Add Link Form */}
        <div className="premium-card">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Add New Link
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Platform</label>
              <select 
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="github">GitHub</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter / X</option>
                <option value="email">Email / Contact</option>
                <option value="other">Other Website</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Display Name</label>
              <input 
                type="text" 
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g. GITHUB, LINKEDIN, MY BLOG"
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>URL</label>
              <input 
                type="url" 
                name="url"
                value={formData.url}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g. https://github.com/yourname"
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input 
                type="checkbox" 
                name="isPublic"
                id="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <label htmlFor="isPublic" style={{ color: 'var(--text-secondary)' }}>Visible on site</label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 'var(--space-2)' }}>
              {saving ? 'Saving...' : 'Add Link'}
            </button>
          </form>
        </div>

        {/* Links List */}
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Your Links</h3>
          
          {links.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No links added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {links.map(link => (
                <div key={link.id} className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ padding: 'var(--space-3)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                      <LinkIcon size={20} color="var(--primary-color)" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 'var(--text-base)' }}>{link.displayName}</h4>
                      <a href={link.url} target="_blank" rel="noreferrer" style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        {link.url}
                      </a>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(link.id)}
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

export default Links;
