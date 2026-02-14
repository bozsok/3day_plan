import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
}

export function Card({ children }: CardProps) {
    return (
        <div id="static-page-card-holder" className="w-full">
            {children}
        </div>
    );
}
