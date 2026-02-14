import type { ReactNode } from 'react';

interface NavButtonProps {
    variant?: 'outline' | 'primary';
    icon: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    title?: string;
    className?: string; // További pozícionáláshoz (pl. absolute)
}

export function NavButton({
    variant = 'outline',
    icon,
    onClick,
    disabled = false,
    title,
    className = ""
}: NavButtonProps) {
    const baseStyles = "flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 active:scale-95";

    const variants = {
        outline: "border border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 bg-white hover:scale-105",
        primary: `${disabled
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50 shadow-none'
            : 'bg-primary text-gray-900 hover:bg-primary-dark hover:scale-105 shadow-lg shadow-primary/30 cursor-pointer'}`
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {icon}
        </button>
    );
}
