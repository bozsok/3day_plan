import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export type StatusModalType = 'success' | 'error' | 'warning' | 'info';

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: StatusModalType;
    actionLabel?: string;
}

export const StatusModal: React.FC<StatusModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    actionLabel = 'Rendben'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={32} className="text-emerald-600" />;
            case 'error':
                return <XCircle size={32} className="text-red-600" />;
            case 'warning':
                return <AlertCircle size={32} className="text-amber-600" />;
            default:
                return <Info size={32} className="text-blue-600" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-100';
            case 'error':
                return 'bg-red-100';
            case 'warning':
                return 'bg-amber-100';
            default:
                return 'bg-blue-100';
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200';
            case 'error':
                return 'bg-red-500 hover:bg-red-600 shadow-red-200';
            case 'warning':
                return 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';
            default:
                return 'bg-primary hover:bg-primary-dark shadow-primary/20';
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getBgColor()}`}>
                        {getIcon()}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-3 px-4 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${getButtonColor()}`}
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
