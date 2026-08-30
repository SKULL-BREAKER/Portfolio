import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalLink, FolderGit2 } from 'lucide-react';

const ProjectsSection: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
        if (data) {
          setProjects(data.map(d => ({
            ...d, 
            shortDescription: d.short_description, 
            githubUrl: d.github_url, 
            liveUrl: d.live_url
          })));
        }
      } catch (err) {
        console.error('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div>Loading project data...</div>;
  if (projects.length === 0) return null; // Don't show empty sections on public view

  return (
    <section id="projects" style={{ padding: 'var(--space-16) 0' }}>
      <div className="container">
        <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          Products
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--grid-gap)' }}>
          {projects.map((project) => (
            <div key={project.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>{project.title}</h3>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" title="Source Code"><FolderGit2 size={20} /></a>}
                  {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" title="Live System"><ExternalLink size={20} /></a>}
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', flex: 1, marginBottom: 'var(--space-4)' }}>
                {project.shortDescription}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'auto' }}>
                {(project.technologies || '').split(',').map((tech: string, i: number) => (
                  <span key={i} style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--text-tertiary)',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
