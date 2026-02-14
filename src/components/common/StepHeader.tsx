import type { ReactNode } from 'react';
import { StepLabel } from './StepLabel';

interface StepHeaderProps {
    step?: string;
    title: ReactNode;
    description?: ReactNode;
    className?: string; // Containernek (pl. flex-1)
    titleClassName?: string;
    descriptionClassName?: string;
}

export function StepHeader({
    step,
    title,
    description,
    className = "",
    titleClassName = "",
    descriptionClassName = ""
}: StepHeaderProps) {
    // Intelligens stílus összefűzés: csak akkor adjuk hozzá az alapot, ha a hívó nem definiálta felül az adott kategóriát
    const finalTitleClassName = `
        ${!titleClassName.includes('text-') ? 'text-3xl md:text-5xl' : ''}
        ${!titleClassName.includes('font-') ? 'font-extrabold' : ''}
        ${!titleClassName.includes('text-gray') ? 'text-gray-900' : ''}
        ${!titleClassName.includes('leading-') ? 'leading-tight' : ''}
        ${!titleClassName.includes('mb-') ? 'mb-4' : ''}
        ${titleClassName}
    `.replace(/\s+/g, ' ').trim();

    const finalDescClassName = descriptionClassName || "text-gray-600 text-lg leading-relaxed max-w-2xl";

    return (
        <div className={`flex-1 ${className}`}>
            {step && <StepLabel>{step}</StepLabel>}

            <h1 className={finalTitleClassName}>
                {title}
            </h1>

            {description && (
                <p className={finalDescClassName}>
                    {description}
                </p>
            )}
        </div>
    );
}
