import { useEffect, useState } from 'react';
import { getAdminProgress } from '../api/admin.api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const AdminProgress = () => {
    const { isAdmin } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProgress = async () => {
            if (!isAdmin) {
                setLoading(false);
                return;
            }
            try {
                const res = await getAdminProgress();
                // Extract the progress array from the nested structure
                const progressData = res.data.data?.progress || [];
                setData(progressData);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch progress data');
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="page analytics-page">
                <header className="page__header">
                    <h1 className="page__title">Access Denied</h1>
                    <p className="page__subtitle">You do not have permission to view administrator analytics.</p>
                </header>
            </div>
        );
    }

    return (
        <div className="page analytics-page">
            <header className="page__header analytics-header">
                <div className="analytics-header__text">
                    <h1 className="page__title">Workforce Analytics</h1>
                    <p className="page__subtitle">Monitor completion rates and productivity metrics</p>
                </div>
                <div className="analytics-summary-pill">
                    <strong>{data.length}</strong> Users Active
                </div>
            </header>

            <div className="analytics-content">
                {loading ? (
                    <div className="loader-container">
                        <Loader />
                        <p>Syncing data streams...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert--error">
                        {error}
                    </div>
                ) : data.length === 0 ? (
                    <div className="analytics-empty">
                        <p>No telemetry data available for the current period.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>User Profile</th>
                                    <th>Status</th>
                                    <th>Workload</th>
                                    <th>Performance</th>
                                    <th>Action Plan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(data) && data.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="u-profile">
                                                <div className="u-avatar">
                                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="u-info">
                                                    <span className="u-name">{user.name || 'Anonymous User'}</span>
                                                    <span className="u-meta">{user.email || 'No email provided'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`tag tag--${user.role || 'user'}`}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="u-workload">
                                                <strong>{user.completedTasks || 0}</strong>
                                                <span>/ {user.totalTasks || 0}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="u-progress">
                                                <div className="u-progress-meta">
                                                    <span className={`u-status-dot s--${(user.progress || 0) >= 80 ? 'active' : (user.progress || 0) > 0 ? 'warning' : 'idle'}`}></span>
                                                    <span>{user.progress || 0}%</span>
                                                </div>
                                                <div className="u-progress-track">
                                                    <div
                                                        className="u-progress-fill"
                                                        style={{ width: `${user.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="u-label">
                                                {(user.progress || 0) >= 80 ? 'Maintain' : (user.progress || 0) > 0 ? 'Expedite' : 'Begin'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .analytics-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--clr-border); padding-bottom: 2rem; margin-bottom: 2.5rem; }
                .analytics-summary-pill { background: var(--clr-surface-alt); padding: 0.5rem 1rem; border-radius: var(--r-md); font-size: 0.875rem; color: var(--clr-text-muted); border: 1px solid var(--clr-border); }
                .analytics-summary-pill strong { color: var(--clr-primary); }
                
                .table-container { background: var(--clr-surface); border: 1px solid var(--clr-border); border-radius: var(--r-lg); overflow-x: auto; box-shadow: var(--shadow); }
                .analytics-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
                .analytics-table th { background: var(--clr-surface-alt); padding: 1rem 1.5rem; color: var(--clr-text-muted); font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; border-bottom: 1px solid var(--clr-border); }
                .analytics-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--clr-border); vertical-align: middle; }
                .analytics-table tr:hover { background: var(--clr-surface-alt); }
                
                .u-profile { display: flex; align-items: center; gap: 0.75rem; }
                .u-avatar { width: 36px; height: 36px; background: var(--clr-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.875rem; flex-shrink: 0; }
                .u-info { display: flex; flex-direction: column; }
                .u-name { font-weight: 700; color: var(--clr-text); }
                .u-meta { font-size: 0.75rem; color: var(--clr-text-muted); }
                
                .tag { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
                .tag--admin { background: rgba(239, 68, 68, 0.1); color: var(--clr-danger); }
                .tag--user { background: rgba(16, 185, 129, 0.1); color: var(--clr-success); }
                
                .u-workload { display: flex; align-items: baseline; gap: 0.25rem; font-variant-numeric: tabular-nums; }
                .u-workload strong { color: var(--clr-text); }
                .u-workload span { color: var(--clr-text-dim); font-size: 0.75rem; }
                
                .u-progress { display: flex; flex-direction: column; gap: 0.4rem; min-width: 140px; }
                .u-progress-meta { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.75rem; color: var(--clr-text); }
                .u-status-dot { width: 6px; height: 6px; border-radius: 50%; }
                .s--active { background: var(--clr-success); box-shadow: 0 0 8px var(--clr-success); }
                .s--warning { background: var(--clr-warning); }
                .s--idle { background: var(--clr-text-dim); }
                .u-progress-track { height: 6px; background: var(--clr-surface-alt); border-radius: 99px; overflow: hidden; }
                .u-progress-fill { height: 100%; background: var(--clr-primary); border-radius: 99px; }
                
                .u-label { font-size: 0.75rem; font-weight: 600; color: var(--clr-text-muted); }

                @media (max-width: 768px) {
                    .analytics-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .analytics-summary-pill { order: -1; }
                }
            `}} />
        </div>
    );
};

export default AdminProgress;
