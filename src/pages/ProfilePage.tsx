import { useState } from 'react';
import { Camera, Save, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { updateUserProfile } from '../services/authService';
import { useNotificationStore } from '../stores/notificationStore';

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const addToast = useNotificationStore((s) => s.addToast);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [loading, setLoading] = useState(false);

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
                        <label htmlFor="profile-photo">Avatar URL</label>
                        <input
                            id="profile-photo"
                            type="url"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <span className="btn-loading"><div className="spinner spinner-xs" /> Saving...</span>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
