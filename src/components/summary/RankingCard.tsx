
import { Calendar as CalendarIcon, MapPin, Star, Heart, Flag, Palmtree, Sun, Mountain, Trees, Waves, Wine, Utensils, Footprints, Landmark, Castle, Ship } from 'lucide-react';

interface RankingCardProps {
    id?: string;
    title: string;
    description?: string;
    count: number;
    users: string[];
    isFirst?: boolean;
    onClick?: () => void;
    variant: 'date' | 'location';
    imageUrl?: string;
    tags?: { icon: string; label: string }[];
}

// Segédfüggvény a Material icon nevek Lucide-re fordításához
const getLucideIcon = (iconName: string, size: number = 12) => {
    const iconProps = { size, className: "shrink-0" };
    switch (iconName) {
        case 'flag': return <Flag {...iconProps} />;
        case 'spa': return <Palmtree {...iconProps} />;
        case 'wb_sunny': return <Sun {...iconProps} />;
        case 'hiking': return <Mountain {...iconProps} />;
        case 'trees':
        case 'nature': return <Trees {...iconProps} />;
        case 'waves': return <Waves {...iconProps} />;
        case 'wine_bar': return <Wine {...iconProps} />;
        case 'restaurant': return <Utensils {...iconProps} />;
        case 'directions_walk':
        case 'trail': return <Footprints {...iconProps} />;
        case 'museum':
        case 'account_balance': return <Landmark {...iconProps} />;
        case 'castle': return <Castle {...iconProps} />;
        case 'directions_boat': return <Ship {...iconProps} />;
        default: return <Star {...iconProps} />;
    }
};

export function RankingCard({
    id,
    title,
    description,
    count,
    users,
    isFirst = false,
    onClick,
    variant,
    imageUrl,
    tags
}: RankingCardProps) {
    // ... (maradék kód változatlan az adatok feldolgozásáig)

    // Kártya alap méretezése (Szélesebb kártyák a részletesebb tartalomhoz)
    const baseClasses = "relative flex-shrink-0 flex flex-col transition-all duration-300 rounded-2xl border border-gray-200 snap-center select-none overflow-hidden group bg-white hover:shadow-lg";

    const sizeClasses = variant === 'date'
        ? "w-[140px] h-[170px] border-gray-100 bg-gray-50/50"
        : "w-[240px] border-gray-100";

    // 1. DÁTUM KÁRTYA TARTALOM (Mikor menjünk? - Átvéve a Location Card stílusát)
    const dateCardContent = (
        <div id={id ? `${id}-content` : undefined} className="flex flex-col p-3 h-full items-center text-center min-w-0 relative">
            {isFirst && (
                <div id={id ? `${id}-winner-badge` : undefined} className="absolute top-2 left-2 bg-yellow-400 text-yellow-950 px-2 h-5 rounded-full text-[9px] font-black shadow-lg flex items-center gap-1 uppercase tracking-widest z-10 leading-none">
                    <Star size={9} fill="currentColor" />
                    Győztes
                </div>
            )}

            {/* Szavazatszám + Szív ikon (jobb felső sarok) */}
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-black text-gray-400">
                {count}
                <Heart size={12} className="text-red-500 fill-current" />
            </div>

            {/* Naptár ikon a felső harmadban */}
            <div className="mt-4 mb-2 text-gray-200">
                <CalendarIcon size={28} strokeWidth={1.5} />
            </div>

            {/* Középső rész: IDŐPONT és Dátum */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <span className="text-[9px] font-black text-gray-200 uppercase tracking-[0.2em] mb-1">
                    IDŐPONT
                </span>
                <h3 id={id ? `${id}-title` : undefined} className="text-[13px] font-black text-gray-800 leading-tight whitespace-nowrap">
                    {title}
                </h3>
            </div>

            {/* Footer: Balra Avatarok, Jobbra Időtartam */}
            <div id={id ? `${id}-date-footer` : undefined} className="mt-auto pb-1 pt-2 w-full flex justify-between items-end border-t border-gray-50">
                {/* Balra: Avatarok */}
                <div className="flex -space-x-2 overflow-hidden pl-1">
                    {users.slice(0, 3).map((u, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-50 border border-white flex items-center justify-center text-[9px] font-bold text-gray-500 shadow-sm" title={u}>
                            {u.charAt(0)}
                        </div>
                    ))}
                    {users.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-50 border border-white flex items-center justify-center text-[9px] font-bold text-gray-300">
                            +{users.length - 3}
                        </div>
                    )}
                </div>

                {/* Jobbra: 3 NAP */}
                <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest pr-1 pb-1">
                    3 NAP
                </div>
            </div>
        </div>
    );

    // 2. HELYSZÍN KÁRTYA TARTALOM (Hova menjünk? - Átvéve a Package Selection stílusát)
    const locationCardContent = (
        <>
            {/* Kép egység */}
            <div id={id ? `${id}-image-wrapper` : undefined} className="relative w-full h-36 overflow-hidden bg-gray-100 shrink-0">
                {imageUrl ? (
                    <img
                        id={id ? `${id}-img` : undefined}
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div id={id ? `${id}-placeholder` : undefined} className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                        <MapPin size={32} className="opacity-20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />

                {isFirst && (
                    <div id={id ? `${id}-winner-badge` : undefined} className="absolute top-3 left-3 bg-yellow-400 text-yellow-950 px-2 h-5 rounded-full text-[9px] font-black shadow-lg flex items-center gap-1 uppercase tracking-widest leading-none">
                        <Star size={9} fill="currentColor" />
                        Győztes
                    </div>
                )}
            </div>

            {/* Szöveges tartalom */}
            <div id={id ? `${id}-body` : undefined} className="flex flex-col p-4 flex-1 min-w-0">
                <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 id={id ? `${id}-title` : undefined} className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">
                        {title}
                    </h3>
                    <span id={id ? `${id}-count-badge` : undefined} className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0 border border-primary/5">
                        {count} szavazat
                    </span>
                </div>

                {description && (
                    <p id={id ? `${id}-desc` : undefined} className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 italic">
                        {description}
                    </p>
                )}

                {/* Footer szekció */}
                <div id={id ? `${id}-footer` : undefined} className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex gap-2 overflow-hidden">
                        {tags ? (
                            tags.slice(0, 2).map((tag, i) => (
                                <div key={i} id={id ? `${id}-tag-${i}` : undefined} className="flex items-center gap-1 text-gray-400">
                                    <span className="text-primary flex items-center">
                                        {getLucideIcon(tag.icon, 12)}
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider hidden lg:inline">
                                        {tag.label}
                                    </span>
                                </div>
                            ))
                        ) : (
                            // Szavazó avatarok ha nincs tag
                            <div id={id ? `${id}-avatars` : undefined} className="flex -space-x-1.5 overflow-hidden">
                                {users.slice(0, 3).map((u, i) => (
                                    <div key={i} className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500 shadow-sm" title={u}>
                                        {u.charAt(0)}
                                    </div>
                                ))}
                                {users.length > 3 && (
                                    <div className="w-5 h-5 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-400">
                                        +{users.length - 3}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div id={id ? `${id}-details-link` : undefined} className="flex items-center gap-1 text-[10px] font-bold text-gray-400 group-hover:text-primary transition-colors">
                        Részletek <Star size={10} className="fill-current" />
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div
            id={id}
            onClick={onClick}
            className={`${baseClasses} ${sizeClasses} ${onClick ? 'cursor-pointer' : ''}`}
        >
            {variant === 'date' ? dateCardContent : locationCardContent}
        </div>
    );
}
