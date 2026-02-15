import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import type { ReactNode } from 'react';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation();
    const isHero = location.pathname === '/';

    return (
        <div id="app-main-layout-root" className="bg-background-app min-h-screen flex items-start justify-center p-4 md:p-8 pt-4 md:pt-8 transition-colors duration-300">
            <div className={`fixed bottom-4 right-4 z-50 md:bottom-8 md:right-8 ${!isHero ? 'hidden md:block' : ''}`}>
                <ThemeToggle />
            </div>
            <main id="main-layout-container" className="w-full max-w-5xl relative">
                {children}
            </main>
        </div>
    );
}
