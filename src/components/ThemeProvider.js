import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
export default function ThemeProvider({ children }) {
    const { theme } = useThemeStore();
    useEffect(() => {
        // Appliquer le thème au niveau du document
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = `theme-${theme}`;
        // Ajouter une classe au body pour le thème
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
    }, [theme]);
    return _jsx(_Fragment, { children: children });
}
