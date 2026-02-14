import { ExternalLink } from 'lucide-react';

interface RankingItemProps {
    title: string;
    count: number;
    users: string[];
    isFirst?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
    type?: 'date' | 'region';
}

export function RankingItem({
    title,
    count,
    users,
    isFirst,
    onClick,
    icon,
    type = 'region'
}: RankingItemProps) {
    const isRegion = type === 'region';

    // Stílus variánsok
    const containerClasses = `relative p-4 rounded-xl border transition-all ${onClick ? 'cursor-pointer group' : ''
        } ${isFirst
            ? `bg-white shadow-md transform ${onClick ? 'hover:scale-105' : ''} ${isRegion ? 'border-yellow-200' : 'border-blue-200'}`
            : `bg-transparent border-gray-200 ${onClick ? 'hover:bg-white hover:border-gray-300 hover:shadow-sm' : ''}`
        }`;

    const badgeClasses = `px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap inline-flex items-center justify-center h-6 ${isRegion ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
        }`;

    return (
        <div className={containerClasses} onClick={onClick}>
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900 flex items-center gap-2">
                    {isFirst && isRegion && '👑 '}
                    {icon}
                    {title}
                    {isRegion && onClick && (
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                    )}
                </span>
                <span className={badgeClasses}>
                    {count} szavazat
                </span>
            </div>

            <div className="flex flex-wrap gap-1">
                {users.map((u, idx) => (
                    <span key={`${u}-${idx}`} className="text-[10px] px-2 py-1 bg-gray-200 text-gray-600 rounded-md">
                        {u}
                    </span>
                ))}
            </div>
        </div>
    );
}
