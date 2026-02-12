import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    isActive: boolean;
    isBack: boolean;
}

export function Card({ children, isActive }: CardProps) {
    if (!isActive) return null;
    return <>{children}</>;
}
