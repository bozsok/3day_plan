interface RankingSectionProps {
    title: string;
    icon: React.ReactNode;
    emptyText: string;
    children: React.ReactNode;
    isEmpty?: boolean;
}

export function RankingSection({
    title,
    icon,
    emptyText,
    children,
    isEmpty = false,
    id
}: RankingSectionProps & { id?: string }) {
    return (
        <div id={id} className="bg-transparent">
            <div id="ranking-section-header" className="flex items-center gap-3">
                <div id="ranking-section-icon-box" className="w-10 h-10 rounded-full bg-primary text-zinc-900 flex items-center justify-center shadow-lg shadow-primary/20">
                    {icon}
                </div>
                <h2 id="ranking-section-title" className="text-xl font-bold text-gray-900">{title}</h2>
            </div>

            <div id="ranking-section-items-scroller" className="flex overflow-x-auto py-8 -mx-6 px-6 gap-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {isEmpty ? (
                    <p className="text-gray-400 text-sm italic w-full text-center py-8">{emptyText}</p>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
