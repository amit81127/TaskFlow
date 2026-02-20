import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || '/dashboard';

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) {
            setError('Please provide your account credentials.');
            return;
        }
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'The email or password you entered is incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-view">
            <div className="auth-card">
                <header className="auth-header">
                    <div className="auth-icon">T</div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Log in to manage your productivity dashboard</p>
                </header>

                {error && <div className="auth-alert">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-box">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="name@company.com"
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter your security phrase"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                        {loading ? 'Validating Access...' : 'Sign In'}
                    </button>
                </form>

                <footer className="auth-footer">
                    <span>New here?</span>
                    <Link to="/register">Create an account</Link>
                </footer>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .auth-view { min-height: 100vh; background: var(--clr-bg); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
                .auth-card { background: var(--clr-surface); width: 100%; max-width: 440px; padding: 3rem 2.5rem; border-radius: var(--r-xl); border: 1px solid var(--clr-border); box-shadow: var(--shadow-lg); transition: background var(--dur); }
                
                .auth-header { text-align: center; margin-bottom: 2.5rem; }
                .auth-icon { width: 48px; height: 48px; background: var(--clr-primary); color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; margin: 0 auto 1.5rem; }
                .auth-title { font-size: 1.75rem; font-weight: 800; color: var(--clr-text); margin-bottom: 0.5rem; letter-spacing: -0.03em; }
                .auth-subtitle { color: var(--clr-text-muted); font-size: 0.875rem; }
                
                .auth-alert { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--clr-danger); color: var(--clr-danger); padding: 1rem; border-radius: var(--r-md); font-size: 0.875rem; font-weight: 600; margin-bottom: 2rem; text-align: center; }
                
                .auth-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .input-box { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-label { font-size: 0.7rem; font-weight: 800; color: var(--clr-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-left: 2px; }
                .input-field { background: var(--clr-surface-alt); border: 1px solid var(--clr-border); padding: 0.75rem 1rem; border-radius: var(--r-md); font-size: 1rem; color: var(--clr-text); outline: none; transition: border-color var(--dur); }
                .input-field:focus { border-color: var(--clr-primary); }
                
                .btn--full { width: 100%; padding: 0.9rem; }
                
                .auth-footer { margin-top: 2.5rem; text-align: center; font-size: 0.875rem; color: var(--clr-text-muted); border-top: 1px solid var(--clr-border); padding-top: 1.5rem; }
                .auth-footer a { color: var(--clr-primary); font-weight: 800; margin-left: 0.5rem; }
            `}} />
        </div>
    );
};

export default Login;
