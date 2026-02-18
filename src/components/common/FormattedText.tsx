import React from 'react';

interface FormattedTextProps {
    text: string;
    className?: string;
    id?: string;
}

/**
 * FormattedText komponens
 * Támogatja:
 * - Sortörések (pre-wrap)
 * - Félkövér szöveg (**szöveg** vagy __szöveg__)
 * - Egyszerű felsorolás (sor eleji - vagy *)
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = "", id }) => {
    if (!text) return null;

    // Sortörések mentén szétvágjuk a szöveget
    const lines = text.split('\n');

    return (
        <div id={id} className={`whitespace-pre-wrap ${className}`}>
            {lines.map((line, lineIdx) => {
                let content: React.ReactNode = line;

                // 1. Felsorolás feliismerése (sor eleji - vagy *)
                const listMatch = line.match(/^(\s*)([-*])\s+(.+)$/);
                const isListItem = !!listMatch;

                if (listMatch) {
                    const [, , bullet, textContent] = listMatch;
                    content = (
                        <div className="flex gap-2 ml-2">
                            <span className="text-primary font-bold">{bullet === '-' ? '•' : '•'}</span>
                            <span>{processInlineFormatting(textContent)}</span>
                        </div>
                    );
                } else {
                    content = processInlineFormatting(line);
                }

                return (
                    <React.Fragment key={lineIdx}>
                        {content}
                        {lineIdx < lines.length - 1 && !isListItem && <br />}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

/**
 * Inline formázások kezelése (félkövér)
 */
function processInlineFormatting(text: string): React.ReactNode[] {
    // Regex a **bold** vagy __bold__ mintákra
    const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);

    return parts.map((part, index) => {
        if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
            const innerText = part.slice(2, -2);
            return <strong key={index} className="font-black text-gray-900">{innerText}</strong>;
        }
        return part;
    });
}
