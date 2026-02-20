import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

/**
 * ProtectedRoute
 *
 * - Shows a loader while the auth session is being restored
 * - Redirects unauthenticated users to /login (preserving the intended URL)
 * - Optionally restricts by role: <ProtectedRoute roles={['admin']} />
 */
const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loader fullScreen message="Verifying session..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
