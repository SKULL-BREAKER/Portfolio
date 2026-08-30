import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

interface ProfileData {
  headline: string;
  about: string;
  careerObjective: string;
  status: string;
  isPublic: boolean;
  profileImage?: string;
  resumeFile?: string;
  resumeOriginal?: string;
  themeSettings: {
    bgPrimary: string;
    bgSecondary: string;
    primaryColor: string;
    textPrimary: string;
  };
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    headline: '',
    about: '',
    careerObjective: '',
    status: 'Available for opportunities',
    isPublic: true,
    profileImage: '',
    themeSettings: {
      bgPrimary: '#1a0508',
      bgSecondary: '#2d0a11',
      primaryColor: '#e2e8f0',
      textPrimary: '#ffffff'
    }
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resumeUploadFile, setResumeUploadFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { updateTheme } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setProfile({
          headline: data.headline || '',
          about: data.about || '',
          careerObjective: data.career_objective || '',
          status: data.status || 'Available for opportunities',
          isPublic: data.is_public === true,
          profileImage: data.profile_image || '',
          resumeFile: data.resume_file || '',
          resumeOriginal: data.resume_original || '',
          themeSettings: data.theme_settings 
            ? (typeof data.theme_settings === 'string' ? JSON.parse(data.theme_settings) : data.theme_settings)
            : { bgPrimary: '#1a0508', bgSecondary: '#2d0a11', primaryColor: '#e2e8f0', textPrimary: '#ffffff' }
        });
      }
    } catch (error) {
      console.error('Error fetching profile', error);
      setMessage('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProfile(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith('theme_')) {
      const themeKey = name.replace('theme_', '');
      const newThemeSettings = { ...profile.themeSettings, [themeKey]: value };
      setProfile(prev => ({ ...prev, themeSettings: newThemeSettings }));
      updateTheme(newThemeSettings);
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let profileImageUrl = profile.profileImage;
      let resumeFileUrl = profile.resumeFile;
      let resumeOriginalName = profile.resumeOriginal;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${user.id}/profile_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio_files').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        profileImageUrl = supabase.storage.from('portfolio_files').getPublicUrl(filePath).data.publicUrl;
      }
      
      if (resumeUploadFile) {
        const fileExt = resumeUploadFile.name.split('.').pop();
        const filePath = `${user.id}/resume_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio_files').upload(filePath, resumeUploadFile);
        if (uploadError) throw uploadError;
        resumeFileUrl = supabase.storage.from('portfolio_files').getPublicUrl(filePath).data.publicUrl;
        resumeOriginalName = resumeUploadFile.name;
      }

      const payload = {
        headline: profile.headline,
        about: profile.about,
        career_objective: profile.careerObjective,
        status: profile.status,
        is_public: profile.isPublic,
        theme_settings: profile.themeSettings,
        profile_image: profileImageUrl,
        resume_file: resumeFileUrl,
        resume_original: resumeOriginalName
      };

      const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      if (imageFile || resumeUploadFile) {
         fetchProfile();
         setImageFile(null);
         setResumeUploadFile(null);
      }
    } catch (error) {
      console.error('Error updating profile', error);
      setMessage('An error occurred while saving.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div>Loading profile data...</div>;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>
        Manage Profile
      </h2>
      
      <div className="premium-card" style={{ maxWidth: '800px' }}>
        {message && (
          <div style={{ 
            padding: 'var(--space-3)', 
            backgroundColor: message.includes('success') ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)', 
            color: message.includes('success') ? '#2ecc71' : '#e74c3c',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-6)'
          }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Profile Photo</label>
            {profile.profileImage && (
              <img 
                src={profile.profileImage} 
                alt="Profile" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)', marginBottom: 'var(--space-2)' }} 
              />
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImageFile(e.target.files[0]);
                }
              }}
              style={{ 
                padding: 'var(--space-2)', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Resume Document (PDF)</label>
            {profile.resumeOriginal && (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                Current: <a href={profile.resumeFile} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{profile.resumeOriginal}</a>
              </div>
            )}
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setResumeUploadFile(e.target.files[0]);
                }
              }}
              style={{ 
                padding: 'var(--space-2)', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Headline</label>
            <input 
              type="text" 
              name="headline"
              value={profile.headline}
              onChange={handleChange}
              style={{ 
                padding: 'var(--space-3)', 
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)'
              }}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Status</label>
            <input 
              type="text" 
              name="status"
              value={profile.status}
              onChange={handleChange}
              style={{ 
                padding: 'var(--space-3)', 
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)'
              }}
              placeholder="e.g. Available for opportunities"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>About Me</label>
            <textarea 
              name="about"
              value={profile.about}
              onChange={handleChange}
              rows={5}
              style={{ 
                padding: 'var(--space-3)', 
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                resize: 'vertical'
              }}
              placeholder="Write a short bio about yourself..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Career Objective</label>
            <textarea 
              name="careerObjective"
              value={profile.careerObjective}
              onChange={handleChange}
              rows={3}
              style={{ 
                padding: 'var(--space-3)', 
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                resize: 'vertical'
              }}
              placeholder="What are your career goals?"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <input 
              type="checkbox" 
              name="isPublic"
              id="isPublic"
              checked={profile.isPublic}
              onChange={handleChange}
            />
            <label htmlFor="isPublic" style={{ color: 'var(--text-secondary)' }}>Make Profile Public</label>
          </div>

          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', marginTop: 'var(--space-6)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-2)' }}>
            Theme & Appearance
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Primary Background</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input 
                  type="color" 
                  name="theme_bgPrimary"
                  value={profile.themeSettings.bgPrimary}
                  onChange={handleChange}
                  style={{ width: '50px', height: '40px', padding: '0', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{profile.themeSettings.bgPrimary}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Secondary Background</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input 
                  type="color" 
                  name="theme_bgSecondary"
                  value={profile.themeSettings.bgSecondary}
                  onChange={handleChange}
                  style={{ width: '50px', height: '40px', padding: '0', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{profile.themeSettings.bgSecondary}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Primary Accent (Buttons/Links)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input 
                  type="color" 
                  name="theme_primaryColor"
                  value={profile.themeSettings.primaryColor}
                  onChange={handleChange}
                  style={{ width: '50px', height: '40px', padding: '0', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{profile.themeSettings.primaryColor}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Primary Text</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input 
                  type="color" 
                  name="theme_textPrimary"
                  value={profile.themeSettings.textPrimary}
                  onChange={handleChange}
                  style={{ width: '50px', height: '40px', padding: '0', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{profile.themeSettings.textPrimary}</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={saving}
            style={{ marginTop: 'var(--space-4)', alignSelf: 'flex-start' }}
          >
            {saving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
