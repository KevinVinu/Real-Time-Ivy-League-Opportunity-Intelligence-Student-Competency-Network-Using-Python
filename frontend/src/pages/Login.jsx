import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <h1 className="gradient-text">Ivy League Opportunity Network</h1>
                    <p>Sign in to access exclusive opportunities and track your InCoScore.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label><Mail size={18} /> Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. student@harvard.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={18} /> Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'} <LogIn size={18} style={{ marginLeft: '8px' }} />
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register" className="gradient-text">Register here</Link></p>
                </div>
            </div>

            <style jsx>{`
        .auth-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 450px;
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

export default Login;
