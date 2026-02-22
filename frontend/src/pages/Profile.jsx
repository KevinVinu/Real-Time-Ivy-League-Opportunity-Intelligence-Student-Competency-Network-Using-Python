import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
    User,
    Mail,
    School,
    BookOpen,
    Award,
    Link as LinkIcon,
    FileText,
    Save,
    CheckCircle,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('auth/student-profile/');
                setProfile(res.data);
            } catch (err) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.patch('auth/student-profile/', profile);
            setProfile(res.data);

            // Also update user basic info if needed
            toast.success('Profile updated successfully!');

            // Recalculate InCoScore
            await api.post('incoscore/recalculate/');
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleArrayChange = (name, value) => {
        const items = value.split(',').map(i => i.trim());
        setProfile({ ...profile, [name]: items });
    };

    if (loading) return <div className="loading">Accessing student profile...</div>;

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1 className="gradient-text">Personal Student Profile</h1>
                <p>Keep your profile updated to increase your InCoScore and get better recommendations.</p>
            </div>

            <div className="profile-grid">
                <div className="main-form-section">
                    <form className="glass-card profile-form" onSubmit={handleProfileUpdate}>
                        <div className="form-section">
                            <h3><BookOpen size={20} className="section-icon" /> Academic Information</h3>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>Major / Field of Study</label>
                                    <input
                                        name="major"
                                        value={profile.major || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>GPA (Scale 4.0)</label>
                                    <input
                                        name="gpa"
                                        type="number"
                                        step="0.01"
                                        max="4.0"
                                        value={profile.gpa || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 3.95"
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Graduation Year</label>
                                <input
                                    name="graduation_year"
                                    type="number"
                                    value={profile.graduation_year || ''}
                                    onChange={handleInputChange}
                                    placeholder="2025"
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3><Award size={20} className="section-icon" /> Skills & Interests</h3>
                            <div className="input-group">
                                <label>Skills (comma separated)</label>
                                <input
                                    value={profile.skills?.join(', ') || ''}
                                    onChange={(e) => handleArrayChange('skills', e.target.value)}
                                    placeholder="Python, Machine Learning, Data Structures..."
                                />
                            </div>
                            <div className="input-group">
                                <label>Interests (comma separated)</label>
                                <input
                                    value={profile.interests?.join(', ') || ''}
                                    onChange={(e) => handleArrayChange('interests', e.target.value)}
                                    placeholder="Robotics, Artificial Intelligence, Quantum Computing..."
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3><LinkIcon size={20} className="section-icon" /> Professional Links</h3>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>LinkedIn URL</label>
                                    <input
                                        name="linkedin_url"
                                        value={profile.linkedin_url || ''}
                                        onChange={handleInputChange}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div className="input-group">
                                    <label>GitHub URL</label>
                                    <input
                                        name="github_url"
                                        value={profile.github_url || ''}
                                        onChange={handleInputChange}
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary save-btn" disabled={saving}>
                            {saving ? <RefreshCw className="spin" size={20} /> : <Save size={20} />}
                            <span>Save Profile Changes</span>
                        </button>
                    </form>
                </div>

                <div className="profile-sidebar">
                    <div className="glass-card info-card">
                        <div className="completeness">
                            <div className="circular-progress">
                                <span className="percent">{profile.profile_completeness}%</span>
                                <p>Completeness</p>
                            </div>
                        </div>
                        <div className="info-list">
                            <div className="info-item">
                                <CheckCircle size={16} color={profile.gpa ? '#50e3c2' : '#a0a0a0'} />
                                <span>Academic Record</span>
                            </div>
                            <div className="info-item">
                                <CheckCircle size={16} color={profile.skills.length > 0 ? '#50e3c2' : '#a0a0a0'} />
                                <span>Skills Tagged</span>
                            </div>
                            <div className="info-item">
                                <CheckCircle size={16} color={profile.linkedin_url ? '#50e3c2' : '#a0a0a0'} />
                                <span>Social Links</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card resume-card">
                        <h3><FileText size={20} /> Resume / CV</h3>
                        <p className="hint">Uploading your resume allows the context engine to improve your matches.</p>
                        <button className="btn-secondary">Upload PDF</button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .profile-page { display: flex; flex-direction: column; gap: 30px; }
        .page-header h1 { font-size: 2.2rem; margin-bottom: 8px; }
        .page-header p { color: var(--text-muted); }
        
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 30px;
        }
        @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr; } }
        
        .profile-form { display: flex; flex-direction: column; gap: 32px; padding: 30px !important; }
        .form-section { display: flex; flex-direction: column; gap: 20px; }
        .form-section h3 { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; color: white; margin-bottom: 4px; }
        .section-icon { color: var(--primary-color); }
        
        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 600px) { .input-row { grid-template-columns: 1fr; } }
        
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { font-size: 0.85rem; color: var(--text-muted); }
        .input-group input { 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid var(--glass-border); 
          padding: 12px; 
          border-radius: 8px; 
          color: white; 
          outline: none;
        }
        .input-group input:focus { border-color: var(--primary-color); }
        
        .save-btn { align-self: flex-start; display: flex; align-items: center; gap: 12px; margin-top: 10px; }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .profile-sidebar { display: flex; flex-direction: column; gap: 24px; }
        .info-card { padding: 30px !important; text-align: center; }
        .circular-progress { 
          width: 120px; 
          height: 120px; 
          border-radius: 50%; 
          border: 8px solid rgba(255, 255, 255, 0.05);
          border-top-color: var(--primary-color);
          margin: 0 auto 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .percent { font-size: 1.8rem; font-weight: 900; color: white; }
        .circular-progress p { font-size: 0.7rem; color: var(--text-muted); }
        
        .info-list { display: flex; flex-direction: column; gap: 12px; text-align: left; }
        .info-item { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: var(--text-muted); }
        
        .resume-card { display: flex; flex-direction: column; gap: 16px; }
        .resume-card h3 { display: flex; align-items: center; gap: 10px; font-size: 1rem; }
        .hint { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
        
        .loading { text-align: center; padding: 100px; color: var(--primary-color); }
      `}</style>
        </div>
    );
};

export default Profile;
