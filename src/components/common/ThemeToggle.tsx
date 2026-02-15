import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
    const { theme, setTheme, isDark } = useTheme();

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`
                flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                border border-content-main/10 bg-surface/50 backdrop-blur-md text-content-muted
                hover:text-content-main hover:border-content-main/20 hover:bg-surface/80 shadow-sm
            `}
            title={isDark ? 'Váltás világos módra' : 'Váltás sötét módra'}
        >
            <div className="relative w-5 h-5 overflow-hidden">
                <Sun
                    size={20}
                    className={`absolute inset-0 transition-transform duration-500 ${isDark ? 'translate-y-8 rotate-90' : 'translate-y-0 rotate-0'}`}
                />
                <Moon
                    size={20}
                    className={`absolute inset-0 transition-transform duration-500 ${isDark ? 'translate-y-0 rotate-0' : '-translate-y-8 -rotate-90'}`}
                />
            </div>
        </button>
    );
}
