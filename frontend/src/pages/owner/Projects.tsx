import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, Plus, FolderGit2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  shortDescription: string;
  technologies: string;
  isPublic: boolean;
  isFeatured: boolean;
  slug: string;
  description: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    technologies: '',
    isPublic: true,
    isFeatured: false
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
      if (data) {
        setProjects(data.map(d => ({
          ...d,
          shortDescription: d.short_description,
          githubUrl: d.github_url,
          liveUrl: d.live_url,
          isPublic: d.is_public,
          isFeatured: d.is_featured
        })));
      }
    } catch (error) {
      console.error('Error fetching projects', error);
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
      // auto-generate slug from title if title is changed
      if (name === 'title' && !editingId) {
        setFormData(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        profile_id: user.id,
        title: formData.title,
        slug: formData.slug,
        short_description: formData.shortDescription,
        description: formData.description,
        technologies: formData.technologies,
        is_public: formData.isPublic,
        is_featured: formData.isFeatured
      };

      if (editingId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project', error);
      alert('Failed to save project. Ensure slug is unique.');
    }
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      description: project.description,
      technologies: project.technologies,
      isPublic: project.isPublic,
      isFeatured: project.isFeatured
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', slug: '', shortDescription: '', description: '', technologies: '', isPublic: true, isFeatured: false
    });
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', margin: 0 }}>
          Manage Projects
        </h2>
        {!showForm && (
          <button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Project
          </button>
        )}
      </div>

      {showForm ? (
        <div className="premium-card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>{editingId ? 'Edit Project' : 'Add New Project'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Slug (URL friendly)</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} style={inputStyle} required />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Short Description</label>
              <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} style={inputStyle} required />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Technologies (comma separated)</label>
              <input type="text" name="technologies" value={formData.technologies} onChange={handleInputChange} style={inputStyle} required />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Full Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...inputStyle, minHeight: '120px' }} required />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleInputChange} />
                Public (Visible on site)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} />
                Featured
              </label>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <button type="submit" className="btn btn-primary">Save Project</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No projects found. Create one!</p>
          ) : (
            projects.map(project => (
              <div key={project.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-3)' }}>
                  <FolderGit2 color="var(--primary-color)" />
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{project.title}</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', flex: 1 }}>
                  {project.shortDescription}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                  {project.technologies.split(',').map((tech, i) => (
                    <span key={i} style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                      {tech.trim()}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-3)' }}>
                  <button onClick={() => handleEdit(project)} style={iconBtnStyle} title="Edit"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(project.id)} style={{ ...iconBtnStyle, color: '#ff6b6b' }} title="Delete"><Trash2 size={16} /></button>
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

export default Projects;
