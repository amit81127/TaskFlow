import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTaskStats } from '../api/task.api';
import Loader from '../components/Loader';

const STAT_CONFIG = [
    { key: 'todo', label: 'To Do', icon: '📋' },
    { key: 'in-progress', label: 'In Progress', icon: '⚡' },
    { key: 'review', label: 'In Review', icon: '🔍' },
    { key: 'done', label: 'Done', icon: '✅' },
];

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await getTaskStats();
                setStats(data.data.stats);
            } catch {
                setError('Could not load statistics.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const greeting = () => {
        const hr = new Date().getHours();
        if (hr < 12) return 'Good morning';
        if (hr < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="page dashboard-minimal">
            <header className="page__header dashboard-header">
                <div className="dashboard-header__welcome">
                    <h1 className="page__title">
                        {greeting()}, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="page__subtitle">
                        Here is what is happening with your tasks today.
                        {isAdmin && <span className="admin-status-pill">System Admin</span>}
                    </p>
                </div>
                <Link to="/tasks" className="btn btn--primary">
                    + New Task
                </Link>
            </header>

            <section className="dashboard-section">
                {loading ? (
                    <div className="loader-container"><Loader /></div>
                ) : error ? (
                    <div className="alert alert--error">{error}</div>
                ) : (
                    <div className="dashboard__stats">
                        <div className="stat-card">
                            <span className="stat-card__label">Active Tasks</span>
                            <span className="stat-card__value">{stats?.total ?? 0}</span>
                        </div>
                        {STAT_CONFIG.map(({ key, label }) => (
                            <div key={key} className="stat-card">
                                <span className="stat-card__label">{label}</span>
                                <span className="stat-card__value">{stats?.[key] ?? 0}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className="dashboard-grid">
                <section className="dashboard-section">
                    <h2 className="section-title">Common Actions</h2>
                    <div className="action-list">
                        <Link to="/tasks" className="action-item">
                            <div className="action-item__icon">📝</div>
                            <div className="action-item__text">
                                <h3>Manage Tasks</h3>
                                <p>Organize, track, and complete your items</p>
                            </div>
                        </Link>
                        {isAdmin && (
                            <Link to="/admin/progress" className="action-item action-item--admin">
                                <div className="action-item__icon">📊</div>
                                <div className="action-item__text">
                                    <h3>Team Performance</h3>
                                    <p>Deep dive into workforce analytics</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">User Session</h2>
                    <div className="account-brief">
                        <div className="account-brief__avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="account-brief__meta">
                            <span className="account-brief__name">{user?.name}</span>
                            <span className="account-brief__email">{user?.email}</span>
                            <span className={`tag tag--${user?.role}`}>{user?.role}</span>
                        </div>
                    </div>
                </section>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--clr-border); padding-bottom: 2rem; margin-bottom: 2.5rem; }
                .admin-status-pill { margin-left: 0.75rem; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; background: rgba(59, 130, 246, 0.1); color: var(--clr-primary); padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid var(--clr-primary); }
                
                .dashboard__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
                .stat-card { padding: 1.5rem; background: var(--clr-surface); border: 1px solid var(--clr-border); border-radius: var(--r-lg); display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow); }
                .stat-card__label { font-size: 0.7rem; font-weight: 700; color: var(--clr-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-card__value { font-size: 2rem; font-weight: 800; color: var(--clr-text); }
                
                .dashboard-grid { display: grid; grid-template-columns: 1fr 340px; gap: 3rem; }
                .action-list { display: flex; flex-direction: column; gap: 1rem; }
                .action-item { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem; background: var(--clr-surface); border: 1px solid var(--clr-border); border-radius: var(--r-lg); transition: all 0.2s; }
                .action-item:hover { border-color: var(--clr-primary); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
                .action-item__icon { font-size: 1.5rem; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--clr-surface-alt); border-radius: 10px; }
                .action-item__text h3 { font-size: 1rem; font-weight: 700; color: var(--clr-text); margin-bottom: 0.125rem; }
                .action-item__text p { font-size: 0.875rem; color: var(--clr-text-muted); }
                
                .account-brief { padding: 2rem; background: var(--clr-surface); border: 1px solid var(--clr-border); border-radius: var(--r-lg); display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: var(--shadow); }
                .account-brief__avatar { width: 64px; height: 64px; background: var(--clr-primary); color: #fff; font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-bottom: 1rem; }
                .account-brief__name { display: block; font-size: 1.125rem; font-weight: 800; color: var(--clr-text); }
                .account-brief__email { display: block; font-size: 0.875rem; color: var(--clr-text-muted); margin-bottom: 1rem; }
                
                .tag { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
                .tag--admin { background: rgba(239, 68, 68, 0.1); color: var(--clr-danger); }
                .tag--user { background: rgba(16, 185, 129, 0.1); color: var(--clr-success); }
                
                @media (max-width: 991px) { .dashboard-grid { grid-template-columns: 1fr; gap: 2.5rem; } .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; } }
            `}} />
        </div>
    );
};

export default Dashboard;
