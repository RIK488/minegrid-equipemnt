import React, { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Appliquer le thème au niveau du document
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
    
    // Ajouter une classe au body pour le thème
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  return <>{children}</>;
} 