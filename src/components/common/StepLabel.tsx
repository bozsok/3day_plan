interface StepLabelProps {
    children: React.ReactNode;
    className?: string;
}

export function StepLabel({ children, className = "" }: StepLabelProps) {
    return (
        <div id="step-label-wrapper" className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 w-fit ${className}`}>
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                {children}
            </span>
        </div>
    );
}
