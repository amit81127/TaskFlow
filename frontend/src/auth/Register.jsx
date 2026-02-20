import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState('user');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.password) {
            setError('All fields are mandatory to create your workstation.');
            return;
        }
        setLoading(true);
        try {
            await register(form.name.trim(), form.email, form.password, role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'We could not create your account at this time.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-view">
            <div className="auth-card auth-card--large">
                <header className="auth-header">
                    <div className="auth-icon">T</div>
                    <h1 className="auth-title">Create Workspace</h1>
                    <p className="auth-subtitle">Join the elite network of productive professionals</p>
                </header>

                {error && <div className="auth-alert">{error}</div>}

                <div className="role-selector">
                    <button
                        type="button"
                        className={`role-choice ${role === 'user' ? 'is-active' : ''}`}
                        onClick={() => setRole('user')}
                    >
                        Standard User
                    </button>
                    <button
                        type="button"
                        className={`role-choice ${role === 'admin' ? 'is-active' : ''}`}
                        onClick={() => setRole('admin')}
                    >
                        Team Lead
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-box">
                        <label className="input-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g. Jean-Luc Picard"
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="name@federation.org"
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label className="input-label">Security Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Minimum 8 characters"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                        {loading ? 'Initializing Interface...' : 'Provision Account'}
                    </button>
                </form>

                <footer className="auth-footer">
                    <span>Already a member?</span>
                    <Link to="/login">Sign in to existing workspace</Link>
                </footer>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .auth-view { min-height: 100vh; background: var(--clr-bg); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
                .auth-card { background: var(--clr-surface); width: 100%; max-width: 440px; padding: 3rem 2.5rem; border-radius: var(--r-xl); border: 1px solid var(--clr-border); box-shadow: var(--shadow-lg); transition: background var(--dur); }
                .auth-card--large { max-width: 480px; }
                
                .auth-header { text-align: center; margin-bottom: 2rem; }
                .auth-icon { width: 48px; height: 48px; background: var(--clr-primary); color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; margin: 0 auto 1.5rem; }
                .auth-title { font-size: 1.75rem; font-weight: 800; color: var(--clr-text); margin-bottom: 0.5rem; letter-spacing: -0.03em; }
                .auth-subtitle { color: var(--clr-text-muted); font-size: 0.875rem; }
                
                .auth-alert { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--clr-danger); color: var(--clr-danger); padding: 1rem; border-radius: var(--r-md); font-size: 0.875rem; font-weight: 600; margin-bottom: 2rem; text-align: center; }
                
                .role-selector { display: grid; grid-template-columns: 1fr 1fr; background: var(--clr-surface-alt); padding: 4px; border-radius: 10px; margin-bottom: 2rem; }
                .role-choice { padding: 0.75rem; border-radius: 8px; font-size: 0.875rem; font-weight: 700; color: var(--clr-text-muted); transition: all 0.2s; }
                .role-choice.is-active { background: var(--clr-surface); color: var(--clr-primary); box-shadow: var(--shadow); }
                
                .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
                .input-box { display: flex; flex-direction: column; gap: 0.4rem; }
                .input-label { font-size: 0.7rem; font-weight: 800; color: var(--clr-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-left: 2px; }
                .input-field { background: var(--clr-surface-alt); border: 1px solid var(--clr-border); padding: 0.75rem 1rem; border-radius: var(--r-md); font-size: 1rem; color: var(--clr-text); outline: none; transition: border-color var(--dur); }
                .input-field:focus { border-color: var(--clr-primary); }
                
                .btn--full { width: 100%; padding: 0.9rem; margin-top: 0.5rem; }
                
                .auth-footer { margin-top: 2.5rem; text-align: center; font-size: 0.875rem; color: var(--clr-text-muted); border-top: 1px solid var(--clr-border); padding-top: 1.5rem; }
                .auth-footer a { color: var(--clr-primary); font-weight: 800; margin-left: 0.5rem; }
            `}} />
        </div>
    );
};

export default Register;
