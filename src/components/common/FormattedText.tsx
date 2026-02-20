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
        <div id={id} className={`whitespace-pre-wrap break-words ${className}`}>
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
 * Inline formázások kezelése (félkövér és linkek)
 */
function processInlineFormatting(text: string): React.ReactNode[] {
    // 1. Első lépés: Szétvágjuk a szöveget URL-ek mentén
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const partsWithUrls = text.split(urlRegex);

    const result: React.ReactNode[] = [];

    partsWithUrls.forEach((part, i) => {
        if (part.match(urlRegex)) {
            // Ez egy URL
            result.push(
                <a
                    key={`url-${i}`}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium break-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        } else {
            // Ez sima szöveg, amiben még lehetnek félkövér részek
            const boldRegex = /(\*\*.*?\*\*|__.*?__)/g;
            const boldParts = part.split(boldRegex);

            boldParts.forEach((boldPart, j) => {
                if ((boldPart.startsWith('**') && boldPart.endsWith('**')) || (boldPart.startsWith('__') && boldPart.endsWith('__'))) {
                    const innerText = boldPart.slice(2, -2);
                    result.push(<strong key={`bold-${i}-${j}`} className="font-black text-gray-900">{innerText}</strong>);
                } else if (boldPart) {
                    result.push(boldPart);
                }
            });
        }
    });

    return result;
}
