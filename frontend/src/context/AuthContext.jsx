import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, loginUser, registerUser, logoutUser } from '../api/auth.api';
import { storeTokens, clearTokens, getAccessToken } from '../utils/token';

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(() => {
        const token = getAccessToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true); // initial session check
    const [error, setError] = useState(null);

    // ── Boot: restore session if token exists ──────────────────────────────────
    useEffect(() => {
        const restoreSession = async () => {
            const token = getAccessToken();
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await getMe();
                setUser(data.data.user);
                setRole(data.data.user.role);
            } catch {
                clearTokens();
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    // ── Listen for logout events from axios interceptor ────────────────────────
    useEffect(() => {
        const handleForceLogout = () => {
            setUser(null);
            setRole(null);
            clearTokens();
        };
        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, []);

    // ─── Login ─────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        setError(null);
        const { data } = await loginUser({ email, password });
        storeTokens(data.data);
        setUser(data.data.user);
        setRole(data.data.user.role);
        return data.data.user;
    }, []);

    // ─── Register ──────────────────────────────────────────────────────────────
    const register = useCallback(async (name, email, password, role = 'user') => {
        setError(null);
        const { data } = await registerUser({ name, email, password, role });
        storeTokens(data.data);
        setUser(data.data.user);
        setRole(data.data.user.role);
        return data.data.user;
    }, []);

    // ─── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } catch {
            // Ignore server errors on logout; clear locally anyway
        } finally {
            clearTokens();
            setUser(null);
            setRole(null);
        }
    }, []);

    const value = {
        user,
        role,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        isAuthenticated: !!user || !!role,
        isAdmin: (user?.role || role) === 'admin',
        isManager: (user?.role || role) === 'manager' || (user?.role || role) === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};

export default AuthContext;
