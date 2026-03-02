import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

export default function ToastContainer() {
    const { toasts, removeToast } = useNotificationStore();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => {
                const Icon = iconMap[toast.type];
                return (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <Icon size={18} className="toast-icon" />
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
