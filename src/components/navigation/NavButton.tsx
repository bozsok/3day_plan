import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavButtonProps {
    direction: 'back' | 'forward';
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}

export function NavButton({ direction, onClick, className = '', disabled = false }: NavButtonProps) {
    const Icon = direction === 'back' ? ChevronLeft : ChevronRight;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`group hover:scale-105 transition-transform z-10 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            <div
                className="flex items-center justify-center w-10 h-10 min-[440px]:w-12 min-[440px]:h-12 md:w-14 md:h-14 rounded-2xl border border-gray-200 text-gray-400 group-hover:border-gray-900 group-hover:text-gray-900 transition-all bg-white/80 backdrop-blur-sm"
            >
                <Icon size={24} />
            </div>
        </button>
    );
}
