import { NavButton } from './NavButton';

interface StepHeaderProps {
    stepLabel: string;
    title: string | React.ReactNode;
    subtitle?: string;
    onBack?: () => void;
    onForward?: () => void;
    showForward?: boolean;
    headerContent?: React.ReactNode; // Extra content below title (e.g. date info)
    className?: string;
}

export function StepHeader({
    stepLabel,
    title,
    subtitle,
    onBack,
    onForward,
    showForward,
    headerContent,
    className = ""
}: StepHeaderProps) {
    return (
        <div className={`relative ${className}`}>
            {/* Back Button */}
            {onBack && (
                <NavButton
                    direction="back"
                    onClick={onBack}
                    className="absolute top-0 left-0"
                />
            )}

            {/* Forward Button (Mobile/Tablet) */}
            {showForward && onForward && (
                <NavButton
                    direction="forward"
                    onClick={onForward}
                    className="absolute top-0 right-0 lg:hidden"
                />
            )}

            {/* Title & Label */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 lg:mb-[30px]">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase whitespace-nowrap">
                        {stepLabel}
                    </span>
                </div>

                {typeof title === 'string' ? (
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                        {title}
                    </h2>
                ) : (
                    title
                )}

                {subtitle && (
                    <p className="text-gray-500 text-sm mb-4">
                        {subtitle}
                    </p>
                )}

                {headerContent}
            </div>
        </div>
    );
}
