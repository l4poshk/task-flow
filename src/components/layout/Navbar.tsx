import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Sun, Moon, LayoutDashboard, User, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../stores/uiStore';
import { motion } from 'framer-motion';
import { useNotificationStore } from '../../stores/notificationStore';
import { logout } from '../../services/authService';

export default function Navbar() {
    const { user } = useAuth();
    const theme = useUIStore((s) => s.theme);
    const toggleTheme = useUIStore((s) => s.toggleTheme);
    const toggleSidebar = useUIStore((s) => s.toggleSidebar);
    const easterEggStage = useUIStore((s) => s.easterEggStage);
    const addToast = useNotificationStore((s) => s.addToast);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            addToast('Logged out successfully', 'info');
            navigate('/login');
        } catch {
            addToast('Failed to log out', 'error');
        }
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button className="icon-btn" onClick={toggleSidebar} title="Toggle sidebar">
                    <Menu size={20} />
                </button>
                <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
                    <span className="brand-text" style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.04em', display: 'flex', alignItems: 'center' }}>
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
                    </span>
                </Link>
            </div>

            <div className="navbar-center" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                </Link>
                {easterEggStage >= 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="easter-egg-progress-nav"
                        title="Find them all."
                    >
                        {[1, 2, 3, 4, 5].map(step => (
                            <div
                                key={step}
                                className={`egg-step ${step <= (easterEggStage - 1) ? 'filled' : ''}`}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            <div className="navbar-right">
                <button
                    className="icon-btn theme-toggle"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {user && (
                    <div className="user-menu">
                        <Link to="/profile" className="user-info" title="Edit Profile">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="user-avatar" />
                            ) : (
                                <div className="user-avatar-placeholder">
                                    <User size={16} />
                                </div>
                            )}
                            <span className="user-name">{user.displayName || user.email}</span>
                        </Link>

                        <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
