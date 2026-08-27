import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GraduationCap } from 'lucide-react';

const EducationSection: React.FC = () => {
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const res = await axios.get('/api/education');
        if (res.data.success) {
          // Sort by start date descending
          const sorted = res.data.data.sort((a: any, b: any) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          setEducation(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch education');
      } finally {
        setLoading(false);
      }
    };
    fetchEducation();
  }, []);

  if (loading) return <div>Loading education...</div>;
  if (education.length === 0) return null;

  return (
    <section id="education" style={{ padding: 'var(--space-16) 0' }}>
      <div className="container">
        <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-12)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          Education
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {education.map((edu) => (
            <div key={edu.id} className="premium-card" style={{ display: 'flex', gap: 'var(--space-6)' }}>
              
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <GraduationCap size={20} color="var(--primary-color)" />
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 'var(--text-xl)', margin: '0 0 var(--space-1) 0' }}>{edu.degree}</h3>
                <h4 style={{ fontSize: 'var(--text-md)', color: 'var(--primary-color)', margin: '0 0 var(--space-2) 0', fontWeight: 500 }}>
                  {edu.institution} {edu.department && `• ${edu.department}`}
                </h4>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(edu.startDate).getFullYear()}   {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                  </span>
                  {edu.grade && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      Grade: {edu.grade}
                    </span>
                  )}
                </div>
                
                {edu.description && (
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {edu.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
