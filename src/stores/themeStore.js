import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useThemeStore = create()(persist((set) => ({
    theme: 'light',
    toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
    })),
    setTheme: (theme) => set({ theme }),
}), {
    name: 'theme-storage',
}));
