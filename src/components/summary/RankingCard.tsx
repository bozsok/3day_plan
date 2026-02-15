
import { ExternalLink, Calendar as CalendarIcon, MapPin, Star } from 'lucide-react';


interface RankingCardProps {
    title: string;
    count: number;
    users: string[]; // Szavazók listája
    isFirst?: boolean; // Első helyezett (győztes)
    onClick?: () => void;
    variant: 'date' | 'location';
    imageUrl?: string; // Helyszín esetén kép URL
    icon?: React.ReactNode; // Dátum esetén ikon
}

export function RankingCard({
    title,
    count,
    users,
    isFirst = false,
    onClick,
    variant,
    imageUrl,
    icon
}: RankingCardProps) {

    // Alap stílusok
    const baseClasses = "relative flex-shrink-0 flex flex-col items-center justify-between transition-all duration-300 rounded-xl border snap-center select-none overflow-hidden group";

    // MÉRETEZÉS (KB. HARMAD AKKORA)
    const sizeClasses = isFirst
        ? "w-[140px] h-[190px] bg-white border-primary-300 shadow-lg shadow-primary/20 z-10 scale-105"
        : "w-[120px] h-[170px] bg-gray-50/80 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-white";

    // Dátum kártya specifikus stílusok
    const dateCardContent = (
        <div className="flex flex-col items-center justify-center h-full w-full p-2 text-center gap-1.5">
            {/* Ikon vagy Naptár grafika */}
            <div className={`
                flex items-center justify-center rounded-full shadow-inner mb-1
                ${isFirst ? 'w-10 h-10 bg-primary-100 text-primary-600' : 'w-8 h-8 bg-gray-200 text-gray-500'}
            `}>
                {icon || <CalendarIcon size={isFirst ? 18 : 14} />}
            </div>

            {/* Dátum szöveg */}
            <h3 className={`font-bold leading-tight ${isFirst ? 'text-sm text-gray-900' : 'text-xs text-gray-700'}`}>
                {title}
            </h3>

            {/* Elválasztó vonal */}
            <div className={`w-8 h-0.5 rounded-full ${isFirst ? 'bg-primary' : 'bg-gray-300'}`}></div>

            {/* Szavazat szám */}
            <div className="mt-auto flex flex-col items-center">
                <span className={`font-black ${isFirst ? 'text-xl text-primary-600' : 'text-lg text-gray-400'}`}>
                    {count}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">szavazat</span>
            </div>
        </div>
    );

    // Helyszín kártya specifikus stílusok
    const locationCardContent = (
        <>
            {/* Kép konténer */}
            <div className="relative w-full h-[50%] overflow-hidden bg-gray-200">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className={`w-full h-full object-cover transition-transform duration-700 ${isFirst || onClick ? 'group-hover:scale-110' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <MapPin size={24} className="opacity-20" />
                    </div>
                )}

                {/* Overlay gradiens a szöveg olvashatóságáért */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                {/* Rank Badge (pl. #1) */}
                {isFirst && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-sm flex items-center gap-0.5">
                        <Star size={8} fill="currentColor" />
                        <span>#1</span>
                    </div>
                )}
            </div>

            {/* Tartalom */}
            <div className="flex flex-col items-center w-full p-2 h-[50%] bg-white text-center gap-1">
                <h3 className={`font-bold leading-tight line-clamp-2 px-1 ${isFirst ? 'text-xs text-gray-900 mt-1' : 'text-[10px] text-gray-700 mt-0.5'}`}>
                    {title}
                </h3>

                {/* Szavazat szám */}
                <div className="mt-auto flex items-center gap-1 mb-1">
                    <span className={`flex items-center justify-center rounded-full font-bold text-[10px] ${isFirst ? 'bg-primary text-white px-2 py-0.5' : 'bg-gray-100 text-gray-500 px-1.5 py-0.5'}`}>
                        {count} db
                    </span>
                </div>

                {/* Avatarok (Szavazók) - Csak az elsőnél, vagy ha van hely - LIMITÁLVA 1-re a kis méret miatt */}
                {isFirst && users.length > 0 && (
                    <div className="flex -space-x-1 overflow-hidden pb-0.5">
                        {users.slice(0, 2).map((u, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[6px] font-bold text-gray-500 shadow-sm" title={u}>
                                {u.charAt(0)}
                            </div>
                        ))}
                        {users.length > 2 && (
                            <div className="w-4 h-4 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[6px] font-bold text-gray-400 shadow-sm">
                                +
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div
            onClick={onClick}
            className={`${baseClasses} ${sizeClasses} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
        >
            {variant === 'date' ? dateCardContent : locationCardContent}
        </div>
    );
}
