import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, Plus, GraduationCap } from 'lucide-react';

interface Education {
  id: string;
  institution: string;
  degree: string;
  department: string;
  startDate: string;
  endDate: string | null;
  grade: string;
  description: string;
}

const EducationPage: React.FC = () => {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    department: '',
    startDate: '',
    endDate: '',
    grade: '',
    description: '',
    isPublic: true
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const { data, error } = await supabase.from('education').select('*').order('start_date', { ascending: false });
      if (data) {
        setEducationList(data.map(d => ({
          ...d,
          startDate: d.start_date,
          endDate: d.end_date
        })));
      }
    } catch (error) {
      console.error('Error fetching education', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        profile_id: user.id,
        institution: formData.institution,
        degree: formData.degree,
        department: formData.department,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        grade: formData.grade,
        description: formData.description,
        is_public: formData.isPublic
      };

      if (editingId) {
        const { error } = await supabase.from('education').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('education').insert([payload]);
        if (error) throw error;
      }
      setShowForm(false);
      resetForm();
      fetchEducation();
    } catch (error) {
      console.error('Error saving education', error);
      alert('Failed to save education details.');
    }
  };

  const handleEdit = (edu: Education) => {
    setFormData({
      institution: edu.institution,
      degree: edu.degree,
      department: edu.department || '',
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
      grade: edu.grade || '',
      description: edu.description || '',
      isPublic: true
    });
    setEditingId(edu.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this education record?')) return;
    try {
      const { error } = await supabase.from('education').delete().eq('id', id);
      if (error) throw error;
      setEducationList(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting education', error);
    }
  };

  const resetForm = () => {
    setFormData({
      institution: '', degree: '', department: '', startDate: '', endDate: '', grade: '', description: '', isPublic: true
    });
    setEditingId(null);
  };

  if (loading) return <div>Loading education history...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', margin: 0 }}>
          Education History
        </h2>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Education
          </button>
        )}
      </div>

      {showForm ? (
        <div className="premium-card" style={{ maxWidth: '800px' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>{editingId ? 'Edit Education' : 'Add New Education'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Institution / University Name</label>
                <input type="text" name="institution" value={formData.institution} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Degree / Certification</label>
                <input type="text" name="degree" value={formData.degree} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Bachelor of Science" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Field of Study / Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Computer Science" />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Grade / GPA (Optional)</label>
                <input type="text" name="grade" value={formData.grade} onChange={handleInputChange} style={inputStyle} placeholder="e.g. 3.8 / 4.0" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>End Date (or expected)</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} style={inputStyle} />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Description / Activities (Optional)</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...inputStyle, minHeight: '100px' }} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <button type="submit" className="btn btn-primary">Save Education</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {educationList.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No education history added yet.</p>
          ) : (
            educationList.map(edu => (
              <div key={edu.id} className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <div style={{ padding: 'var(--space-3)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', height: 'fit-content' }}>
                    <GraduationCap size={24} color="var(--primary-color)" />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-lg)' }}>{edu.degree}</h3>
                    <p style={{ margin: '0 0 var(--space-2) 0', color: 'var(--primary-color)', fontWeight: 500 }}>
                      {edu.institution} {edu.department && `• ${edu.department}`}
                    </p>
                    <p style={{ margin: '0 0 var(--space-3) 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                      {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                      {edu.grade && <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Grade: {edu.grade}</span>}
                    </p>
                    {edu.description && <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{edu.description}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', height: 'fit-content' }}>
                  <button onClick={() => handleEdit(edu)} style={iconBtnStyle} title="Edit"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(edu.id)} style={{ ...iconBtnStyle, color: '#ff6b6b' }} title="Delete"><Trash2 size={18} /></button>
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

export default EducationPage;
