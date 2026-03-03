import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, User, Trash2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { updateUserProfile, deleteAccount, logout } from '../services/authService';
import { useNotificationStore } from '../stores/notificationStore';

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const addToast = useNotificationStore((s) => s.addToast);
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim()) {
            addToast('Display name is required', 'warning');
            return;
        }

        setLoading(true);
        try {
            await updateUserProfile(displayName.trim(), photoURL.trim());
            addToast('Profile updated!', 'success');
        } catch {
            addToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure? This will permanently delete your account and profile data. This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await deleteAccount();
            addToast('Account deleted successfully', 'success');
            navigate('/login');
        } catch (err: any) {
            if (err.code === 'auth/requires-recent-login') {
                addToast('For security, please log in again before deleting your account.', 'error');
                await logout();
                navigate('/login');
            } else {
                addToast(err.message || 'Failed to delete account', 'error');
            }
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1>Profile Settings</h1>
                <p>Manage your account details</p>
            </div>

            <div className="profile-card">
                <div className="profile-avatar-section">
                    {photoURL ? (
                        <img src={photoURL} alt="Avatar" className="profile-avatar-lg" />
                    ) : (
                        <div className="profile-avatar-placeholder-lg">
                            <User size={40} />
                        </div>
                    )}
                    <div className="avatar-hint">
                        <Camera size={14} />
                        <span>Paste an image URL below</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="form profile-form">
                    <div className="form-group">
                        <label htmlFor="profile-name">Display Name</label>
                        <input
                            id="profile-name"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your display name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="profile-email">Email</label>
                        <input
                            id="profile-email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="input-disabled"
                        />
                        <span className="form-hint">Email cannot be changed</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="profile-id">User ID (UID)</label>
                        <div className="copy-input-group">
                            <input
                                id="profile-id"
                                type="text"
                                value={user?.uid || ''}
                                readOnly
                                className="input-disabled"
                            />
                            <button
                                type="button"
                                className="copy-btn"
                                onClick={() => {
                                    if (user?.uid) {
                                        navigator.clipboard.writeText(user.uid);
                                        addToast('User ID copied to clipboard!', 'success');
                                    }
                                }}
                                title="Copy User ID"
                            >
                                <Save size={14} />
                            </button>
                        </div>
                        <span className="form-hint">Share this ID to be invited to projects</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="profile-photo">Avatar URL</label>
                        <input
                            id="profile-photo"
                            type="url"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>

                    <div className="profile-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading || deleting}>
                            {loading ? (
                                <span className="btn-loading"><div className="spinner spinner-xs" /> Saving...</span>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDeleteAccount}
                            disabled={loading || deleting}
                        >
                            {deleting ? (
                                <span className="btn-loading"><div className="spinner spinner-xs" /> Deleting...</span>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Delete Account
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
