import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, Plus, Briefcase } from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  companyUrl: string;
}

const ExperiencePage: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    companyUrl: '',
    isPublic: true
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase.from('experience').select('*').order('start_date', { ascending: false });
      if (data) {
        setExperiences(data.map(d => ({
          ...d,
          startDate: d.start_date,
          endDate: d.end_date,
          isCurrent: d.is_current,
          companyUrl: d.company_url
        })));
      }
    } catch (error) {
      console.error('Error fetching experience', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        profile_id: user.id,
        company: formData.company,
        position: formData.position,
        start_date: formData.startDate,
        end_date: formData.isCurrent ? null : formData.endDate,
        is_current: formData.isCurrent,
        description: formData.description,
        company_url: formData.companyUrl,
        is_public: formData.isPublic
      };

      if (editingId) {
        const { error } = await supabase.from('experience').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('experience').insert([payload]);
        if (error) throw error;
      }
      setShowForm(false);
      resetForm();
      fetchExperiences();
    } catch (error) {
      console.error('Error saving experience', error);
      alert('Failed to save experience.');
    }
  };

  const handleEdit = (exp: Experience) => {
    setFormData({
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
      isCurrent: exp.isCurrent,
      description: exp.description || '',
      companyUrl: exp.companyUrl || '',
      isPublic: true
    });
    setEditingId(exp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      const { error } = await supabase.from('experience').delete().eq('id', id);
      if (error) throw error;
      setExperiences(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting experience', error);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '', companyUrl: '', isPublic: true
    });
    setEditingId(null);
  };

  if (loading) return <div>Loading experience...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', margin: 0 }}>
          Work Experience
        </h2>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Experience
          </button>
        )}
      </div>

      {showForm ? (
        <div className="premium-card" style={{ maxWidth: '800px' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>{editingId ? 'Edit Role' : 'Add New Role'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Company Name</label>
                <input type="text" name="company" value={formData.company} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Position / Title</label>
                <input type="text" name="position" value={formData.position} onChange={handleInputChange} style={inputStyle} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} style={inputStyle} disabled={formData.isCurrent} required={!formData.isCurrent} />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>
              <input type="checkbox" name="isCurrent" checked={formData.isCurrent} onChange={handleInputChange} />
              I currently work here
            </label>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Company Website URL (Optional)</label>
              <input type="url" name="companyUrl" value={formData.companyUrl} onChange={handleInputChange} style={inputStyle} />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Description / Achievements</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...inputStyle, minHeight: '100px' }} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <button type="submit" className="btn btn-primary">Save Experience</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {experiences.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No work experience added yet.</p>
          ) : (
            experiences.map(exp => (
              <div key={exp.id} className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <div style={{ padding: 'var(--space-3)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', height: 'fit-content' }}>
                    <Briefcase size={24} color="var(--primary-color)" />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-lg)' }}>{exp.position}</h3>
                    <p style={{ margin: '0 0 var(--space-2) 0', color: 'var(--primary-color)', fontWeight: 500 }}>{exp.company}</p>
                    <p style={{ margin: '0 0 var(--space-3) 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                      {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : '')}
                    </p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{exp.description}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', height: 'fit-content' }}>
                  <button onClick={() => handleEdit(exp)} style={iconBtnStyle} title="Edit"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(exp.id)} style={{ ...iconBtnStyle, color: '#ff6b6b' }} title="Delete"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const formGroupStyle = { display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' };
const labelStyle = { fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' };
const inputStyle = {
  padding: 'var(--space-3)', 
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'rgba(0,0,0,0.2)',
  color: 'var(--text-primary)'
};
const iconBtnStyle = {
  background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px'
};

export default ExperiencePage;
