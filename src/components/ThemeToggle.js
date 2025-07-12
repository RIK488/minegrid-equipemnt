import { jsx as _jsx } from "react/jsx-runtime";
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
export default function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();
    return (_jsx("button", { onClick: toggleTheme, className: "relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:scale-105", style: {
            background: theme === 'light'
                ? 'linear-gradient(135deg, #f97316, #ea580c)'
                : 'linear-gradient(135deg, #1f2937, #374151)',
            color: theme === 'light' ? '#ffffff' : '#fbbf24'
        }, title: theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair', children: theme === 'light' ? (_jsx(Moon, { className: "h-5 w-5" })) : (_jsx(Sun, { className: "h-5 w-5" })) }));
}
