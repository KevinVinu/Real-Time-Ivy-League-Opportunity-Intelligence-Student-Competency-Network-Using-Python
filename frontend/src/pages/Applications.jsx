import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
    Briefcase,
    Clock,
    CheckCircle,
    AlertCircle,
    Edit3,
    Trash2,
    List,
    Layout
} from 'lucide-react';
import toast from 'react-hot-toast';

const Applications = () => {
    const [apps, setApps] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchData = async () => {
        try {
            const [appsRes, statsRes] = await Promise.all([
                api.get('applications/'),
                api.get('applications/stats/')
            ]);
            setApps(appsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`applications/${id}/`, { status: newStatus });
            toast.success(`Application status updated to ${newStatus}`);
            fetchData();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this application track?')) return;
        try {
            await api.delete(`applications/${id}/`);
            toast.success('Track removed');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const filteredApps = statusFilter
        ? apps.filter(app => app.status === statusFilter)
        : apps;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'submitted': return <CheckCircle size={18} color="#50e3c2" />;
            case 'in_progress': return <Clock size={18} color="#ffd700" />;
            case 'accepted': return <CheckCircle size={18} color="#00ff00" />;
            case 'rejected': return <AlertCircle size={18} color="#ff4d4d" />;
            default: return <Clock size={18} color="#a0a0a0" />;
        }
    };

    if (loading) return <div className="loading">Fetching application status...</div>;

    return (
        <div className="applications-page">
            <div className="page-header">
                <div>
                    <h1 className="gradient-text">Application Tracker</h1>
                    <p>You have {stats?.total || 0} tracks in progress. Use the AutoFill engine to speed up your submissions.</p>
                </div>
                <div className="view-toggle glass-card">
                    <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><Layout size={20} /></button>
                    <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={20} /></button>
                </div>
            </div>

            <div className="status-overview">
                {Object.entries(stats?.by_status || {}).map(([status, count]) => (
                    <div
                        key={status}
                        className={`status-chip glass-card ${statusFilter === status ? 'active' : ''}`}
                        onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                    >
                        <span className="count">{count}</span>
                        <span className="label">{status.replace('_', ' ')}</span>
                    </div>
                ))}
            </div>

            {filteredApps.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={48} className="empty-icon" />
                    <p>No applications tracked yet. Start browsing opportunities!</p>
                </div>
            ) : (
                <div className={`apps-container ${viewMode}`}>
                    {filteredApps.map(app => (
                        <div key={app.id} className="glass-card app-card">
                            <div className="app-main">
                                <div className="status-indicator">
                                    {getStatusIcon(app.status)}
                                    <span className="status-text">{app.status.replace('_', ' ')}</span>
                                </div>
                                <h3>{app.opportunity_detail.title}</h3>
                                <p className="university">{app.opportunity_detail.university}</p>
                                <div className="notes">
                                    <Edit3 size={14} />
                                    <span>{app.notes || 'Add notes...'}</span>
                                </div>
                            </div>

                            <div className="app-actions">
                                <select
                                    value={app.status}
                                    onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                                    className="status-select"
                                >
                                    <option value="saved">Saved</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <button className="delete-btn" onClick={() => handleDelete(app.id)}><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .applications-page { display: flex; flex-direction: column; gap: 30px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .page-header h1 { font-size: 2rem; }
        .page-header p { color: var(--text-muted); margin-top: 8px; }
        
        .view-toggle { display: flex; padding: 4px; border-radius: 10px; }
        .view-toggle button { padding: 8px; border-radius: 8px; transition: 0.3s; }
        .view-toggle button.active { background: rgba(0, 210, 255, 0.2); color: var(--primary-color); }
        
        .status-overview { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; }
        .status-chip {
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          min-width: fit-content;
          transition: 0.3s;
        }
        .status-chip.active { border-color: var(--primary-color); background: rgba(0, 210, 255, 0.1); }
        .status-chip .count { font-weight: 900; color: var(--primary-color); font-size: 1.2rem; }
        .status-chip .label { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
        
        .apps-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .apps-container.list { display: flex; flex-direction: column; gap: 16px; }
        
        .app-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px;
        }
        .status-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .status-text { font-size: 0.75rem; text-transform: uppercase; font-weight: bold; color: var(--text-muted); }
        .app-card h3 { font-size: 1.1rem; margin-bottom: 4px; color: white; }
        .university { font-size: 0.85rem; color: var(--primary-color); margin-bottom: 16px; }
        .notes { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.85rem; font-style: italic; }
        
        .app-actions {
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--glass-border);
        }
        .status-select {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid var(--glass-border);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
        }
        .delete-btn { color: #ff4d4d; opacity: 0.6; transition: 0.3s; }
        .delete-btn:hover { opacity: 1; }
        
        .empty-state { text-align: center; padding: 100px 0; color: var(--text-muted); }
        .empty-icon { opacity: 0.2; margin-bottom: 20px; }
        .loading { text-align: center; padding: 100px; color: var(--primary-color); font-size: 1.1rem; }
      `}</style>
        </div>
    );
};

export default Applications;
