import type { ReactNode } from 'react';

interface InfoPillProps {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    variant?: 'primary' | 'blue' | 'gray' | 'none';
    className?: string;
}

export function InfoPill({
    icon,
    label,
    value,
    variant = 'primary',
    className = ""
}: InfoPillProps) {
    const variants = {
        primary: "bg-primary/10 border-primary/20 text-primary-dark",
        blue: "bg-blue-50/50 border-blue-100 text-blue-900",
        gray: "bg-gray-50 border-gray-100 text-gray-900",
        none: "bg-transparent border-transparent text-primary-dark"
    };

    const iconBg = {
        primary: "bg-primary/20",
        blue: "bg-blue-50",
        gray: "bg-white",
        none: "bg-primary/20"
    };

    return (
        <div id="info-pill-root" className={`flex items-center gap-3 p-3 rounded-2xl border ${variants[variant]} ${className}`}>
            <div id="info-pill-icon-box" className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg[variant]}`}>
                {icon}
            </div>
            <div id="info-pill-content" className="min-w-0 text-left">
                <p id="info-pill-label" className="text-[10px] text-gray-400 uppercase tracking-tight font-bold">{label}</p>
                <div id="info-pill-value" className="font-medium text-sm truncate leading-tight">
                    {value}
                </div>
            </div>
        </div>
    );
}
