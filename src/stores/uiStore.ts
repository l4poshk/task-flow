import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIState {
    theme: Theme;
    sidebarOpen: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    easterEggStage: number;
    setEasterEggStage: (stage: number) => void;
    sidebarWidth: number;
    setSidebarWidth: (width: number) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'dark',
            sidebarOpen: true,
            easterEggStage: 0,

            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'dark' ? 'light' : 'dark',
                })),

            setTheme: (theme) => set({ theme }),

            toggleSidebar: () =>
                set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            setEasterEggStage: (stage) => set({ easterEggStage: stage }),

            sidebarWidth: 260,
            setSidebarWidth: (width) => set({ sidebarWidth: width }),
        }),
        {
            name: 'ilhanflow-state',
        }
    )
);
