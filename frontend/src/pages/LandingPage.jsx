import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [scroll, setScroll] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setScroll(scrolled);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="landing">
            {/* ─── Background Decorations ────────────────────────── */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: `${scroll}%`,
                height: '4px',
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                zIndex: 1000,
                transition: 'width 0.1s ease-out'
            }} />

            {/* ─── 1. Hero Section ────────────────────────────────── */}
            <section className="landing__hero animate-in">
                <div className="landing__content">
                    <span className="badge badge--primary">v2.0 Now Available ⚡</span>
                    <h1 className="landing__title">
                        Command Your Workflow <br />
                        <span className="text-gradient">With Intelligence.</span>
                    </h1>
                    <p className="landing__subtitle">
                        The elite task management platform for high-performance teams.
                        Stay ahead with predictive analytics and seamless collaboration.
                    </p>
                    <div className="landing__actions">
                        <Link to="/register" className="btn btn--primary btn--lg">
                            Get Started — Free
                        </Link>
                        <Link to="/login" className="btn btn--outline btn--lg">
                            Live Demo
                        </Link>
                    </div>
                </div>

                <div className="landing__visual">
                    <div className="glass landing__card">
                        <div className="card-header">
                            <div className="dot red"></div>
                            <div className="dot yellow"></div>
                            <div className="dot green"></div>
                        </div>
                        <div className="card-body">
                            <div className="skeleton title"></div>
                            <div className="skeleton line"></div>
                            <div className="skeleton line"></div>
                            <div className="skeleton line short"></div>
                            <div className="skeleton pulse"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── 2. Stats Section ───────────────────────────────── */}
            <section className="landing__stats">
                <div className="stats-grid">
                    <div className="stat-item">
                        <h3>10k+</h3>
                        <p>Active Users</p>
                    </div>
                    <div className="stat-item">
                        <h3>99.9%</h3>
                        <p>System Uptime</p>
                    </div>
                    <div className="stat-item">
                        <h3>4.9/5</h3>
                        <p>User Rating</p>
                    </div>
                    <div className="stat-item">
                        <h3>$2M+</h3>
                        <p>Productivity Gained</p>
                    </div>
                </div>
            </section>

            {/* ─── 3. Features Section ────────────────────────────── */}
            <section className="landing__features">
                <div className="section-header">
                    <span className="section-tag">Capabilities</span>
                    <h2>Engineered for Excellence</h2>
                </div>
                <div className="feature-grid">
                    <div className="feature-card glass">
                        <div className="feature-icon">🚀</div>
                        <h3>Lightning Speed</h3>
                        <p>Built on Vite and optimized Node servers for sub-100ms response times.</p>
                    </div>
                    <div className="feature-card glass">
                        <div className="feature-icon">🛡️</div>
                        <h3>Ironclad Security</h3>
                        <p>Military-grade JWT rotation and role-based access control protecting your data.</p>
                    </div>
                    <div className="feature-card glass">
                        <div className="feature-icon">📈</div>
                        <h3>Deep Analytics</h3>
                        <p>Visualise team performance with real-time workforce telemetry and reporting.</p>
                    </div>
                </div>
            </section>

            {/* ─── 4. How It Works ────────────────────────────────── */}
            <section className="landing__steps">
                <div className="section-header">
                    <span className="section-tag">Process</span>
                    <h2>Simple. Powerful. Efficient.</h2>
                </div>
                <div className="steps-grid">
                    <div className="step-card">
                        <span className="step-number">01</span>
                        <h3>Deploy</h3>
                        <p>Sign up in seconds and set up your workspace with one click.</p>
                    </div>
                    <div className="step-card">
                        <span className="step-number">02</span>
                        <h3>Delegate</h3>
                        <p>Assign tasks, set priorities, and track progress across your entire team.</p>
                    </div>
                    <div className="step-card">
                        <span className="step-number">03</span>
                        <h3>Deliver</h3>
                        <p>Review completed work and hit your milestones with confidence.</p>
                    </div>
                </div>
            </section>

            {/* ─── 5. Testimonials ────────────────────────────────── */}
            <section className="landing__testimonials">
                <div className="pricing-card glass" style={{ maxWidth: '100%', border: 'none' }}>
                    <p style={{ fontSize: 'var(--fs-xl)', fontStyle: 'italic', color: 'var(--clr-text)' }}>
                        "TaskFlow transformed how our engineering team operates. The analytics are a game-changer."
                    </p>
                    <div style={{ marginTop: '20px', fontWeight: '800' }}>
                        — Sarah Chen, CTO at TechStream
                    </div>
                </div>
            </section>

            {/* ─── 6. Final Conversion (Section 6) ────────────────── */}
            <section id="section-6" className="landing__pricing">
                <div className="section-header">
                    <span className="section-tag">Get Started</span>
                    <h2>The Future of Work is Here</h2>
                </div>
                <div className="pricing-card glass">
                    <span className="badge badge--primary">Limited Time Offer</span>
                    <div className="price">$0<span style={{ fontSize: 'var(--fs-base)', opacity: 0.6 }}>/lifetime</span></div>
                    <ul className="pricing-features">
                        <li>Unlimited Team Members</li>
                        <li>Advanced Workforce Analytics</li>
                        <li>Custom Workflow Automation</li>
                        <li>Priority Support</li>
                    </ul>
                    <Link to="/register" className="btn btn--primary btn--lg" style={{ width: '100%' }}>
                        Claim Your Workspace
                    </Link>
                </div>
            </section>

            {/* ─── Footer Section ─────────────────────────────────── */}
            <footer className="footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h2>TaskFlow.</h2>
                        <p>The premium workspace for high-performance teams. Engineered for precision, built for scale.</p>
                        <div className="social-links" style={{ marginTop: '20px' }}>
                            <a href="#">𝕏</a>
                            <a href="#">GitHub</a>
                            <a href="#">LinkedIn</a>
                        </div>
                    </div>
                    <div className="footer-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#">Features</a></li>
                            <li><a href="#">Analytics</a></li>
                            <li><a href="#">Security</a></li>
                            <li><a href="#">Roadmap</a></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">API Reference</a></li>
                            <li><a href="#">Support</a></li>
                            <li><a href="#">Community</a></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 TaskFlow Inc. Powered by Google Agentic Coding Team.</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span>Status: 🟢 Operational</span>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to Top ↑</button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
