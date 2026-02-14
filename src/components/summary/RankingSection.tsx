interface RankingSectionProps {
    title: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    emptyText: string;
    children: React.ReactNode;
    isEmpty?: boolean;
}

export function RankingSection({
    title,
    icon,
    iconBg,
    iconColor,
    emptyText,
    children,
    isEmpty = false,
    id
}: RankingSectionProps & { id?: string }) {
    return (
        <div id={id} className="bg-gray-50 rounded-2xl min-[440px]:rounded-3xl p-[15px] min-[440px]:p-8 border border-gray-100">
            <div id="ranking-section-header" className="flex items-center gap-3 mb-6">
                <div id="ranking-section-icon-box" className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
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
