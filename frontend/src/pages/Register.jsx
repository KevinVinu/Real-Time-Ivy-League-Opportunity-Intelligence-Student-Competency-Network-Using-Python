import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, School } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password2: '',
        university: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password2) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await register(formData);
            toast.success('Registration successful! Welcome to the network.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <h1 className="gradient-text">Join the Opportunity Network</h1>
                    <p>Start monitoring Ivy League opportunities and boost your InCoScore today.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-row">
                        <div className="input-group">
                            <label><User size={18} /> Username</label>
                            <input
                                name="username"
                                type="text"
                                placeholder="kevin_ivy"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label><Mail size={18} /> Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="student@harvard.edu"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label><School size={18} /> University / College</label>
                        <input
                            name="university"
                            type="text"
                            placeholder="e.g. Harvard University"
                            value={formData.university}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label><Lock size={18} /> Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label><Lock size={18} /> Confirm</label>
                            <input
                                name="password2"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password2}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'} <UserPlus size={18} style={{ marginLeft: '8px' }} />
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="gradient-text">Sign in</Link></p>
                </div>
            </div>

            <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 600px;
          text-align: center;
        }
        .auth-header h1 {
          font-size: 1.8rem;
          margin-bottom: 12px;
        }
        .auth-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 30px;
        }
        .auth-form {
          text-align: left;
        }
        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 500px) {
          .input-row { grid-template-columns: 1fr; gap: 0; }
        }
        .input-group {
          margin-bottom: 20px;
        }
        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          margin-bottom: 8px;
          color: var(--text-muted);
        }
        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          outline: none;
        }
        .input-group input:focus {
          border-color: var(--primary-color);
        }
        .auth-form button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
        }
        .auth-footer {
          margin-top: 24px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
};

export default Register;
