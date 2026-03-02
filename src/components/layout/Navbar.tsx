import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Sun, Moon, LayoutDashboard, User, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { logout } from '../../services/authService';

export default function Navbar() {
    const user = useAuthStore((s) => s.user);
    const { theme, toggleTheme, toggleSidebar } = useUIStore();
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
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon">
                        <LayoutDashboard size={22} />
                    </div>
                    <span className="brand-text">TaskFlow</span>
                </Link>
            </div>

            <div className="navbar-center">
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                </Link>
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
