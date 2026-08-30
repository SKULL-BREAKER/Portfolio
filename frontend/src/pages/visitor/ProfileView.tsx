import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Navigate } from 'react-router-dom';
import ExperienceSection from '../../components/ExperienceSection';
import EducationSection from '../../components/EducationSection';

const ProfileView: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
        if (data) {
          setProfile(data);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, [username]);

  if (notFound) return <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}><h2>Profile not found</h2></div>;
  if (!profile) return <div className="container" style={{ padding: '8rem 0' }}>Loading profile...</div>;

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {profile.about && (
        <section className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)' }}>About Me</h2>
          <div className="premium-card" style={{ padding: 'var(--space-6)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
              {profile.about}
            </p>
          </div>
        </section>
      )}
      <ExperienceSection profileId={profile.id} />
      <EducationSection profileId={profile.id} />
    </div>
  );
};

export default ProfileView;
