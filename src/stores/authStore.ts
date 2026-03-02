import { create } from 'zustand';
import { type User } from 'firebase/auth';
import { subscribeToAuth } from '../services/authService';

interface AuthState {
    user: User | null;
    loading: boolean;
    initialized: boolean;
    setUser: (user: User | null) => void;
    initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    initialized: false,

    setUser: (user) => set({ user, loading: false }),

    initialize: () => {
        const unsubscribe = subscribeToAuth((user) => {
            set({ user, loading: false, initialized: true });
        });
        return unsubscribe;
    },
}));
