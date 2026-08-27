import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase } from 'lucide-react';

const ExperienceSection: React.FC = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await axios.get('/api/experience');
        if (res.data.success) {
          // Sort by start date descending
          const sorted = res.data.data.sort((a: any, b: any) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          setExperiences(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch experience');
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  if (loading) return <div>Loading experience...</div>;
  if (experiences.length === 0) return null;

  return (
    <section id="experience" style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-12)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          Professional Experience
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {experiences.map((exp, index) => (
            <div key={exp.id} style={{ display: 'flex', gap: 'var(--space-6)', position: 'relative' }}>
              
              {/* Timeline Connector */}
              {index !== experiences.length - 1 && (
                <div style={{ 
                  position: 'absolute', 
                  left: '23px', 
                  top: '50px', 
                  bottom: '-48px', 
                  width: '2px', 
                  backgroundColor: 'var(--border-color)' 
                }} />
              )}
              
              {/* Icon */}
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 2
              }}>
                <Briefcase size={20} color="var(--primary-color)" />
              </div>
              
              {/* Content */}
              <div style={{ flex: 1, paddingTop: '4px' }}>
                <h3 style={{ fontSize: 'var(--text-xl)', margin: '0 0 var(--space-1) 0' }}>{exp.position}</h3>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <a href={exp.companyUrl || '#'} target="_blank" rel="noreferrer" style={{ 
                    color: 'var(--primary-color)', 
                    fontWeight: 500,
                    textDecoration: exp.companyUrl ? 'underline' : 'none'
                  }}>
                    {exp.company}
                  </a>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}   {' '}
                    {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '')}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
