import type { ReactNode } from 'react';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="bg-background-light min-h-screen flex items-start justify-center p-4 md:p-8 pt-4 md:pt-8">
            <main className="w-full max-w-5xl relative">
                {children}
            </main>
        </div>
    );
}
