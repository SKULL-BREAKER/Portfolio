import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExperienceSection from '../../components/ExperienceSection';
import EducationSection from '../../components/EducationSection';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/profile');
        if (res.data.success) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {profile && profile.about && (
        <section className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)' }}>About Me</h2>
          <div className="premium-card" style={{ padding: 'var(--space-6)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.8, margin: 0 }}>
              {profile.about}
            </p>
          </div>
        </section>
      )}
      <ExperienceSection />
      <EducationSection />
    </div>
  );
};

export default ProfileView;
