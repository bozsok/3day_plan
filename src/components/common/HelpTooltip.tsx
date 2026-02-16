import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface HelpTooltipProps {
    text: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ text }) => {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useLayoutEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();

            // Ha még nincs renderelve vagy 0 a mérete (pl. rejtett szülő), ne pozicionáljuk rossz helyre
            if (rect.width === 0 && rect.height === 0) return;

            setPosition({
                top: rect.top - 10,
                left: rect.left + rect.width / 2
            });
        }
    }, [isVisible]);

    return (
        <div
            ref={triggerRef}
            className="inline-flex items-center ml-2 align-middle relative"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center cursor-help transition-transform hover:scale-110 shadow-sm">
                <span className="text-white text-xs font-bold">?</span>
            </div>

            {isVisible && createPortal(
                <div
                    className="fixed z-[99999] w-56 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl text-center leading-relaxed pointer-events-none transition-opacity duration-200"
                    style={{
                        top: position.top,
                        left: position.left,
                        transform: 'translate(-50%, -100%)',
                        opacity: position.top === 0 && position.left === 0 ? 0 : 1
                    }}
                >
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>,
                document.body
            )}
        </div>
    );
};
