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
        <div id={id} className="bg-white rounded-2xl min-[440px]:rounded-3xl p-[15px] min-[440px]:p-8 border border-gray-100 shadow-sm">
            <div id="ranking-section-header" className="flex items-center gap-3 mb-6">
                <div id="ranking-section-icon-box" className="w-10 h-10 rounded-full bg-primary text-zinc-900 flex items-center justify-center shadow-lg shadow-primary/20">
                    {icon}
                </div>
                <h2 id="ranking-section-title" className="text-xl font-bold text-gray-900">{title}</h2>
            </div>

            <div id="ranking-section-items-list" className="space-y-4">
                {isEmpty ? (
                    <p className="text-gray-400 text-sm">{emptyText}</p>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
