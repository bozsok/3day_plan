import { Check } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div id="step-indicator-nav" className="flex justify-center items-center p-2 gap-2 bg-white/80 backdrop-blur-sm w-fit mx-auto rounded-full border border-gray-100">
            {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <div key={stepNumber} id={`step-item-container-${stepNumber}`} className="flex items-center gap-2">
                        <div
                            id={`step-circle-${stepNumber}`}
                            className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-sm transition-all duration-300 ${isActive
                                ? 'bg-primary text-white shadow-sm'
                                : isCompleted
                                    ? 'border-2 border-primary bg-white text-primary'
                                    : 'border-2 border-gray-100 text-gray-400 bg-white'
                                }`}
                        >
                            <span id={`step-indicator-value-${stepNumber}`}>
                                {isCompleted ? <Check size={18} strokeWidth={3} /> : stepNumber}
                            </span>
                        </div>
                        {stepNumber < totalSteps && (
                            <div
                                id={`step-connector-line-${stepNumber}`}
                                className={`w-10 h-0.5 transition-colors duration-300 ${isCompleted ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
