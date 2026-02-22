import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    Users,
    Trophy,
    UserCircle,
    LogOut,
    Menu,
    X,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggle }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/opportunities', icon: <Search size={20} />, label: 'Opportunities' },
        { to: '/applications', icon: <Briefcase size={20} />, label: 'Applications' },
        { to: '/community', icon: <Users size={20} />, label: 'Community' },
        { to: '/leaderboard', icon: <Trophy size={20} />, label: 'Leaderboard' },
        { to: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
    ];

    return (
        <aside className={`sidebar glass-card ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2 className="gradient-text">IvyLeague</h2>
                <button className="close-btn" onClick={toggle}><X /></button>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => window.innerWidth < 768 && toggle()}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
            </button>

            <style jsx>{`
        .sidebar {
          position: fixed;
          left: 20px;
          top: 20px;
          bottom: 20px;
          width: var(--sidebar-width);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 0 8px;
        }
        .close-btn { display: none; }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .nav-link:hover, .nav-link.active {
          background: rgba(0, 210, 255, 0.1);
          color: var(--primary-color);
        }
        .logout-btn {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #ff4d4d;
          border-radius: 12px;
        }
        .logout-btn:hover {
          background: rgba(255, 77, 77, 0.1);
        }
        @media (max-width: 768px) {
          .sidebar {
            left: -300px;
            transition: 0.3s;
          }
          .sidebar.open { left: 10px; }
          .close-btn { display: block; }
        }
      `}</style>
        </aside>
    );
};

const Layout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="app-layout">
            <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(!isSidebarOpen)} />

            <main className="main-content">
                <header className="top-nav">
                    <button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu /></button>
                    <div className="user-info">
                        <span>Welcome, <strong>{user?.username}</strong></span>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" className="avatar" />
                        ) : (
                            <div className="avatar-placeholder">{user?.username?.[0]?.toUpperCase()}</div>
                        )}
                    </div>
                </header>

                <div className="page-container">
                    <Outlet />
                </div>
            </main>

            <style jsx>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          margin-left: calc(var(--sidebar-width) + 40px);
          padding: 20px 40px 40px 20px;
        }
        .top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .menu-btn { display: none; }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }
        .avatar, .avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--primary-color);
        }
        .avatar-placeholder {
          background: var(--card-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: var(--primary-color);
        }
        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 20px; }
          .menu-btn { display: block; }
        }
      `}</style>
        </div>
    );
};

export default Layout;
