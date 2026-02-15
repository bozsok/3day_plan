import { ExternalLink } from 'lucide-react';

interface RankingItemProps {
    title: string;
    count: number;
    users: string[];
    isFirst?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
}

export function RankingItem({
    title,
    count,
    users,
    isFirst,
    onClick,
    icon
}: RankingItemProps) {
    // Stílus variánsok
    const containerClasses = `relative p-4 rounded-xl border transition-all ${onClick ? 'cursor-pointer group' : ''
        } ${isFirst
            ? `bg-primary/5 border-primary/20 shadow-sm ${onClick ? 'hover:scale-[1.02] hover:shadow-md' : ''}`
            : `bg-transparent border-gray-100 ${onClick ? 'hover:bg-gray-50 hover:border-gray-200' : ''}`
        }`;

    const badgeClasses = `px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap inline-flex items-center justify-center h-6 bg-primary/10 text-primary-dark`;

    return (
        <div id="ranking-item-root" className={containerClasses} onClick={onClick}>
            <div id="ranking-item-header" className="flex justify-between items-center mb-3">
                <span id="ranking-item-title" className="font-bold text-gray-900 flex items-center gap-2">
                    {icon}
                    {title}
                    {onClick && (
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    )}
                </span>
                <span id="ranking-item-vote-badge" className={badgeClasses}>
                    {count} szavazat
                </span>
            </div>

            <div id="ranking-item-users-list" className="flex flex-wrap gap-1.5">
                {users.map((u, idx) => (
                    <span key={`${u}-${idx}`} id={`ranking-item-user-tag-${idx}`} className="text-[10px] px-2.5 py-1 bg-white border border-gray-100 text-gray-600 rounded-full shadow-sm">
                        {u}
                    </span>
                ))}
            </div>
        </div>
    );
}
