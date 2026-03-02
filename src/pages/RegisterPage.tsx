import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Github, Eye, EyeOff } from 'lucide-react';
import { registerWithEmail, loginWithGoogle, loginWithGithub } from '../services/authService';
import { useNotificationStore } from '../stores/notificationStore';

export default function RegisterPage() {
    const navigate = useNavigate();
    const addToast = useNotificationStore((s) => s.addToast);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }
        if (password.length < 6) {
            addToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);
        try {
            await registerWithEmail(email, password, displayName || email.split('@')[0]);
            addToast('Account created successfully!', 'success');
            navigate('/');
        } catch (err: any) {
            let msg = 'Registration failed';

            // Check for specific Firebase error codes
            if (err.code === 'auth/email-already-in-use' || (typeof err.message === 'string' && err.message.includes('email-already-in-use'))) {
                msg = 'This email is already registered. Please sign in or use a different email.';
            } else if (err instanceof Error) {
                msg = err.message;
            }

            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            addToast('Welcome!', 'success');
            navigate('/');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Google login failed';
            addToast(msg, 'error');
        }
    };

    const handleGithubLogin = async () => {
        try {
            await loginWithGithub();
            addToast('Welcome!', 'success');
            navigate('/');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'GitHub login failed';
            addToast(msg, 'error');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1 style={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: '2.5rem', margin: '0 0 12px 0', display: 'flex', justifyContent: 'center' }}>
                        <span style={{
                            color: '#06b6d4',
                            WebkitTextFillColor: '#06b6d4',
                            background: 'none'
                        }}>Ilhan</span>
                        <span style={{
                            background: 'var(--accent-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>Flow</span>
                    </h1>
                    <p style={{ marginTop: 0 }}>Join the ultimate task tracker</p>
                </div>

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="reg-name">
                            <User size={16} />
                            Display Name
                        </label>
                        <input
                            id="reg-name"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your name"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-email">
                            <Mail size={16} />
                            Email
                        </label>
                        <input
                            id="reg-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-password">
                            <Lock size={16} />
                            Password
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-confirm">
                            <Lock size={16} />
                            Confirm Password
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="reg-confirm"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? (
                            <span className="btn-loading"><div className="spinner spinner-xs" /> Creating...</span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or continue with</span>
                </div>

                <div className="social-buttons">
                    <button className="btn btn-social btn-google" onClick={handleGoogleLogin}>
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                    <button className="btn btn-social btn-github" onClick={handleGithubLogin}>
                        <Github size={18} />
                        GitHub
                    </button>
                </div>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
