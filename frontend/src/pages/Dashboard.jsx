import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
    Zap,
    Target,
    Award,
    TrendingUp,
    Bell,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recs, setRecs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, recsRes] = await Promise.all([
                    api.get('incoscore/dashboard/'),
                    api.get('recommendations/')
                ]);
                setStats(statsRes.data);
                setRecs(recsRes.data.slice(0, 3));
            } catch (err) {
                console.error(err);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading">Initializing Dashboard...</div>;

    return (
        <div className="dashboard-page">
            <div className="welcome-section">
                <h1 className="gradient-text">Student Insight Dashboard</h1>
                <p>Your performance metrics and personalized recommendations are updated in real-time.</p>
            </div>

            <div className="stats-grid">
                <div className="glass-card incoscore-card">
                    <div className="card-header">
                        <Zap className="primary-icon" />
                        <div className="title-group">
                            <h3>InCoScore</h3>
                            <p>Overall Intelligence & Contribution Score</p>
                        </div>
                    </div>
                    <div className="score-display">
                        <span className="main-score">{stats?.incoscore?.toFixed(1) || '0.0'}</span>
                        <div className="rank-info">
                            <span>#{stats?.rank || '-'} Global Rank</span>
                            <span className="percentile">{stats?.percentile}% Percentile</span>
                        </div>
                    </div>
                    <div className="breakdown">
                        {Object.entries(stats?.breakdown || {}).map(([key, value]) => (
                            <div key={key} className="breakdown-item">
                                <span className="label">{key.replace('_', ' ')}</span>
                                <div className="progress-bar">
                                    <div className="fill" style={{ width: `${(value / 25) * 100}%` }}></div>
                                </div>
                                <span className="value">{value.toFixed(1)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="right-stats">
                    <div className="glass-card stat-mini">
                        <TrendingUp size={24} color="#00d2ff" />
                        <div>
                            <p className="label">Activity Growth</p>
                            <h4>+12% vs last week</h4>
                        </div>
                    </div>
                    <div className="glass-card stat-mini">
                        <Target size={24} color="#ffd700" />
                        <div>
                            <p className="label">Target Schools Match</p>
                            <h4>85.4% Relevance</h4>
                        </div>
                    </div>
                    <div className="glass-card stat-mini">
                        <Award size={24} color="#ff4d4d" />
                        <div>
                            <p className="label">Next Milestone</p>
                            <h4>Reach #50 Global Rank</h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sections-layer">
                <div className="glass-card recommendations-list">
                    <div className="section-header">
                        <h3>Recommended Opportunities</h3>
                        <Link to="/opportunities" className="view-all">View All <ChevronRight size={16} /></Link>
                    </div>
                    <div className="recs-container">
                        {recs.length > 0 ? recs.map(rec => (
                            <div key={rec.id} className="rec-item">
                                <div className="rec-info">
                                    <h4>{rec.opportunity.title}</h4>
                                    <p>{rec.opportunity.university} • {rec.opportunity.domain}</p>
                                    <p className="reason">{rec.reason}</p>
                                </div>
                                <Link to={`/opportunities`} className="btn-icon">
                                    <ExternalLink size={18} />
                                </Link>
                            </div>
                        )) : (
                            <p className="empty">No recommendations yet. Complete your profile to get started!</p>
                        )}
                    </div>
                </div>

                <div className="glass-card events-mini">
                    <h3>Community Pulse</h3>
                    <div className="pulse-item">
                        <div className="pulse-dot"></div>
                        <p><strong>New Post:</strong> "How I got into Harvard REU" in #Research</p>
                    </div>
                    <div className="pulse-item">
                        <div className="pulse-dot"></div>
                        <p><strong>Global Alert:</strong> MIT Fellowship deadline in 2 days.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .dashboard-page { display: flex; flex-direction: column; gap: 30px; }
        .welcome-section h1 { font-size: 2.2rem; margin-bottom: 8px; }
        .welcome-section p { color: var(--text-muted); }
        
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
        }
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: 1fr; } }
        
        .incoscore-card {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .card-header { display: flex; gap: 16px; align-items: center; }
        .primary-icon { width: 32px; height: 32px; color: var(--accent-color); }
        .title-group h3 { font-size: 1.4rem; }
        .title-group p { font-size: 0.85rem; color: var(--text-muted); }
        
        .score-display {
          display: flex;
          align-items: center;
          gap: 40px;
          padding: 20px 0;
        }
        .main-score {
          font-size: 4rem;
          font-weight: 900;
          color: white;
          text-shadow: 0 0 20px rgba(0, 210, 255, 0.4);
        }
        .rank-info { display: flex; flex-direction: column; gap: 4px; }
        .percentile { font-weight: bold; color: var(--primary-color); }
        
        .breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--glass-border);
        }
        .breakdown-item { display: flex; flex-direction: column; gap: 8px; }
        .breakdown-item .label { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-bar .fill {
          height: 100%;
          background: var(--primary-color);
          box-shadow: 0 0 10px var(--primary-color);
        }
        .breakdown-item .value { font-weight: bold; font-size: 0.9rem; align-self: flex-end; }
        
        .right-stats { display: flex; flex-direction: column; gap: 20px; }
        .stat-mini {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }
        .stat-mini .label { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px; }
        
        .sections-layer {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 20px;
        }
        @media (max-width: 900px) { .sections-layer { grid-template-columns: 1fr; } }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .view-all { color: var(--primary-color); font-size: 0.9rem; display: flex; align-items: center; gap: 4px; }
        
        .recs-container { display: flex; flex-direction: column; gap: 16px; }
        .rec-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
        }
        .rec-info h4 { font-size: 1rem; margin-bottom: 4px; }
        .rec-info p { font-size: 0.8rem; color: var(--text-muted); }
        .rec-info .reason { color: var(--accent-color); margin-top: 4px; }
        .btn-icon { color: var(--text-muted); }
        .btn-icon:hover { color: var(--primary-color); }
        
        .events-mini h3 { margin-bottom: 24px; }
        .pulse-item {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 0.9rem;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-color);
          margin-top: 6px;
          box-shadow: 0 0 8px var(--primary-color);
          flex-shrink: 0;
        }
        
        .loading { font-size: 1.2rem; color: var(--primary-color); text-align: center; margin-top: 100px; }
      `}</style>
        </div>
    );
};

export default Dashboard;
