import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
    Search,
    Filter,
    RefreshCw,
    MapPin,
    Calendar,
    ExternalLink,
    PlusCircle,
    BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Opportunities = () => {
    const [opps, setOpps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [domain, setDomain] = useState('');
    const [stats, setStats] = useState(null);
    const { user } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (domain) params.domain = domain;

            const [oppsRes, statsRes] = await Promise.all([
                api.get('opportunities/', { params }),
                api.get('opportunities/stats/')
            ]);
            setOpps(oppsRes.data.results || oppsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            toast.error('Failed to load opportunities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [domain]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleApply = async (oppId) => {
        try {
            await api.post('applications/', { opportunity: oppId, status: 'saved' });
            toast.success('Opportunity saved to your applications!');
        } catch (err) {
            toast.error(err.response?.data?.non_field_errors?.[0] || 'Already saved or failed to save.');
        }
    };

    const handleScrape = async () => {
        const url = prompt('Enter Ivy League URL to scrape:');
        if (!url) return;
        try {
            await api.post('opportunities/scrape/', { url, university: 'Auto-detected' });
            toast.success('Scraping job started in the background.');
        } catch (err) {
            toast.error('Only admins can trigger scraping.');
        }
    };

    return (
        <div className="opportunities-page">
            <div className="page-header">
                <div>
                    <h1 className="gradient-text">Ivy League Opportunity Network</h1>
                    <p>Scouring {stats?.total || '...'} verified opportunities from the Ivy League.</p>
                </div>
                {user?.role === 'admin' && (
                    <button className="btn-primary" onClick={handleScrape}>
                        <RefreshCw size={18} /> Trigger Scraper
                    </button>
                )}
            </div>

            <div className="filter-bar glass-card">
                <form onSubmit={handleSearch} className="search-form">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search research, internships, fellowships..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
                <div className="filter-group">
                    <Filter size={20} className="filter-icon" />
                    <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                        <option value="">All Domains</option>
                        <option value="research">Research</option>
                        <option value="fellowship">Fellowship</option>
                        <option value="internship">Internship</option>
                        <option value="scholarship">Scholarship</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Syncing with Ivy League databases...</div>
            ) : (
                <div className="opps-grid">
                    {opps.map(opp => (
                        <div key={opp.id} className="glass-card opp-card">
                            <div className="opp-header">
                                <span className={`domain-badge ${opp.domain}`}>{opp.domain}</span>
                                {opp.is_featured && <span className="featured-badge">Featured</span>}
                            </div>
                            <h3>{opp.title}</h3>
                            <div className="opp-meta">
                                <div className="meta-item"><MapPin size={14} /> {opp.university}</div>
                                <div className="meta-item"><Calendar size={14} /> Deadline: {opp.deadline || 'Rolling'}</div>
                            </div>
                            <p className="opp-desc">{opp.description?.substring(0, 150)}...</p>
                            <div className="opp-footer">
                                <div className="views"><BarChart2 size={14} /> {opp.views_count} views</div>
                                <div className="actions">
                                    <button className="btn-secondary" onClick={() => handleApply(opp.id)}>
                                        <PlusCircle size={18} /> Save
                                    </button>
                                    <a href={opp.url} target="_blank" rel="noreferrer" className="btn-icon-link">
                                        <ExternalLink size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && opps.length === 0 && (
                <div className="empty-state">
                    <p>No opportunities found matching your criteria.</p>
                    <button className="btn-secondary" onClick={() => { setSearchTerm(''); setDomain(''); fetchData(); }}>Clear Filters</button>
                </div>
            )}

            <style jsx>{`
        .opportunities-page { display: flex; flex-direction: column; gap: 30px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .page-header h1 { font-size: 2rem; margin-bottom: 8px; }
        .page-header p { color: var(--text-muted); }
        
        .filter-bar {
          display: flex;
          gap: 20px;
          padding: 16px 24px;
          align-items: center;
        }
        .search-form {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
        }
        .search-form input {
          flex: 1;
          background: none;
          border: none;
          color: white;
          outline: none;
          font-size: 1rem;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .filter-group select {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid var(--glass-border);
          padding: 10px 16px;
          border-radius: 12px;
          outline: none;
        }
        
        .opps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }
        .opp-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 280px;
        }
        .opp-header { display: flex; justify-content: space-between; }
        .domain-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: bold;
          background: rgba(255, 255, 255, 0.1);
        }
        .domain-badge.research { color: var(--primary-color); background: rgba(0, 210, 255, 0.1); }
        .domain-badge.fellowship { color: var(--accent-color); background: rgba(255, 215, 0, 0.1); }
        .domain-badge.internship { color: #50e3c2; background: rgba(80, 227, 194, 0.1); }
        .featured-badge { color: #ff4d4d; border: 1px solid #ff4d4d; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; }
        
        .opp-card h3 { font-size: 1.2rem; line-height: 1.4; color: white; }
        .opp-meta { display: flex; flex-direction: column; gap: 6px; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: 8px; }
        .opp-desc { color: var(--text-muted); font-size: 0.9rem; flex-grow: 1; }
        
        .opp-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--glass-border);
        }
        .views { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        .actions { display: flex; align-items: center; gap: 16px; }
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-color);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .btn-icon-link { color: var(--text-muted); }
        .btn-icon-link:hover { color: var(--primary-color); }
        
        .empty-state { text-align: center; padding: 100px 0; color: var(--text-muted); }
        .empty-state button { margin-top: 16px; }
        .loading { text-align: center; padding: 50px; color: var(--primary-color); font-size: 1.1rem; }
      `}</style>
        </div>
    );
};

export default Opportunities;
