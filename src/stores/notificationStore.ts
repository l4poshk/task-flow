import { create } from 'zustand';
import type { Toast, NotificationType } from '../types';

interface NotificationState {
    toasts: Toast[];
    addToast: (message: string, type: NotificationType, duration?: number) => void;
    removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useNotificationStore = create<NotificationState>((set) => ({
    toasts: [],

    addToast: (message, type, duration = 4000) => {
        const id = `toast-${++toastCounter}-${Date.now()}`;
        const toast: Toast = { id, message, type, duration };

        set((state) => ({
            toasts: [...state.toasts, toast],
        }));

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, duration);
        }
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));
