import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            {/* Brand */}
            <Link to="/" className="navbar__brand" aria-label="TaskFlow home">
                <span className="navbar__logo">⚡</span>
                <span className="navbar__name">TaskFlow</span>
            </Link>

            {/* Nav Links */}
            <ul className="navbar__links" role="list">
                {isAuthenticated && (
                    <>
                        <li>
                            <Link
                                to="/dashboard"
                                className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/tasks"
                                className={`navbar__link ${isActive('/tasks') ? 'navbar__link--active' : ''}`}
                            >
                                Tasks
                            </Link>
                        </li>
                        {isAdmin && (
                            <>
                                <li>
                                    <Link
                                        to="/tasks/all"
                                        className={`navbar__link ${isActive('/tasks/all') ? 'navbar__link--active' : ''}`}
                                    >
                                        All Tasks
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admin/progress"
                                        className={`navbar__link ${isActive('/admin/progress') ? 'navbar__link--active' : ''}`}
                                    >
                                        Analytics
                                    </Link>
                                </li>
                            </>
                        )}
                    </>
                )}
            </ul>

            {/* Auth & Mode Actions */}
            <div className="navbar__actions">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {isAuthenticated ? (
                    <div className="navbar__user-group">
                        <div className="navbar__user">
                            <div className="navbar__avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="navbar__user-name">{user?.name}</span>
                        </div>
                        <button onClick={handleLogout} className="btn btn--primary btn--nav">
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="navbar__auth-group">
                        <Link to="/login" className="btn btn--ghost btn--nav">Login</Link>
                        <Link to="/register" className="btn btn--primary btn--nav">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
