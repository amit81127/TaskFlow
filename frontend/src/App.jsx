import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import AdminProgress from './pages/AdminProgress';
import Loader from './components/Loader';

// ── 404 — declared BEFORE App so it is in scope when used in JSX ─────────────
const NotFound = () => (
  <div className="page not-found">
    <span className="not-found__code">404</span>
    <h1 className="not-found__title">Page not found</h1>
    <p className="not-found__sub">The page you&apos;re looking for doesn&apos;t exist.</p>
    <a href="/dashboard" className="btn btn--primary">Go to Dashboard</a>
  </div>
);

const App = () => {
  const { loading, isAuthenticated } = useAuth();

  // Wait for session restore before rendering routes
  if (loading) return <Loader fullScreen message="Loading TaskFlow…" />;

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute>
              <Tasks adminView={false} />
            </ProtectedRoute>
          } />

          {/* Admin-only: all tasks */}
          <Route path="/tasks/all" element={
            <ProtectedRoute roles={['admin']}>
              <Tasks adminView={true} />
            </ProtectedRoute>
          } />

          {/* Admin-only: users progress */}
          <Route path="/admin/progress" element={
            <ProtectedRoute roles={['admin']}>
              <AdminProgress />
            </ProtectedRoute>
          } />

          {/* Root: send authenticated users to dashboard, guests to login */}
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
