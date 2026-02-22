import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
    Trophy,
    Medal,
    Search,
    ArrowUp,
    ArrowDown,
    User as UserIcon,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const Leaderboard = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all_time');
    const [category, setCategory] = useState('global');

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await api.get('incoscore/leaderboard/', { params: { period, category } });
            setEntries(res.data.results || res.data);
        } catch (err) {
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [period, category]);

    const getMedalColor = (rank) => {
        if (rank === 1) return '#ffd700'; // Gold
        if (rank === 2) return '#c0c0c0'; // Silver
        if (rank === 3) return '#cd7f32'; // Bronze
        return 'transparent';
    };

    return (
        <div className="leaderboard-page">
            <div className="page-header">
                <h1 className="gradient-text">Global InCoScore Rankings</h1>
                <p>The elite network of Ivy League opportunity seekers and contributors.</p>
            </div>

            <div className="filter-row glass-card">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="all_time">All Time</option>
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                    </select>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="global">Global Network</option>
                        <option value="Harvard University">Harvard Only</option>
                        <option value="Yale University">Yale Only</option>
                        <option value="Princeton University">Princeton Only</option>
                    </select>
                </div>
            </div>

            <div className="leaderboard-container glass-card">
                {loading ? (
                    <div className="loading">Calculating rankings...</div>
                ) : (
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Student</th>
                                <th>InCoScore</th>
                                <th>Status</th>
                                <th>Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, idx) => (
                                <tr key={entry.id} className={idx < 3 ? 'top-rank' : ''}>
                                    <td className="rank-cell">
                                        {entry.rank <= 3 ? (
                                            <div className="medal-container">
                                                <Medal size={24} color={getMedalColor(entry.rank)} />
                                                <span>{entry.rank}</span>
                                            </div>
                                        ) : entry.rank}
                                    </td>
                                    <td className="author-cell">
                                        <div className="user-info">
                                            <div className="avatar-mini">{entry.user.username[0].toUpperCase()}</div>
                                            <div>
                                                <div className="username">{entry.user.username}</div>
                                                <div className="univ">{entry.user.university}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="score-cell">
                                        <span className="score">{entry.score.toFixed(1)}</span>
                                    </td>
                                    <td className="status-cell">
                                        <div className="trend up"><ArrowUp size={14} /> 2</div>
                                    </td>
                                    <td className="impact-cell">
                                        <div className="impact-bar">
                                            <div className="fill" style={{ width: `${(entry.score / 100) * 100}%` }}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style jsx>{`
        .leaderboard-page { display: flex; flex-direction: column; gap: 30px; }
        .page-header h1 { font-size: 2.2rem; margin-bottom: 8px; }
        .page-header p { color: var(--text-muted); }
        
        .filter-row { display: flex; padding: 16px 24px; align-items: center; }
        .filter-group { display: flex; gap: 16px; align-items: center; }
        .filter-group select {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid var(--glass-border);
          padding: 8px 16px;
          border-radius: 10px;
          outline: none;
        }
        
        .leaderboard-container { padding: 0 !important; overflow: hidden; }
        .leaderboard-table { width: 100%; border-collapse: collapse; text-align: left; }
        .leaderboard-table th { padding: 20px; border-bottom: 1px solid var(--glass-border); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; }
        .leaderboard-table td { padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        
        .top-rank { background: rgba(0, 210, 255, 0.03); }
        .medal-container { position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
        .medal-container span { position: absolute; font-size: 0.65rem; font-weight: 900; color: black; margin-top: 2px; }
        
        .user-info { display: flex; align-items: center; gap: 12px; }
        .avatar-mini { 
          width: 32px; height: 32px; border-radius: 50%; 
          background: var(--card-bg); border: 1px solid var(--glass-border); 
          display: flex; align-items: center; justify-content: center; 
          font-weight: bold; color: var(--primary-color);
        }
        .username { font-weight: bold; color: white; }
        .univ { font-size: 0.75rem; color: var(--text-muted); }
        
        .score { font-weight: 900; font-size: 1.1rem; color: var(--accent-color); }
        .trend { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; }
        .trend.up { color: #50e3c2; }
        
        .impact-bar { width: 100px; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; }
        .impact-bar .fill { height: 100%; background: linear-gradient(to right, var(--primary-color), var(--accent-color)); }
        
        .loading { text-align: center; padding: 50px; color: var(--primary-color); }
      `}</style>
        </div>
    );
};

export default Leaderboard;
