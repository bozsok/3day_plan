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
    isEmpty = false
}: RankingSectionProps) {
    return (
        <div className="bg-gray-50 rounded-2xl min-[440px]:rounded-3xl p-[15px] min-[440px]:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
                    {icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>

            <div className="space-y-4">
                {isEmpty ? (
                    <p className="text-gray-400 text-sm">{emptyText}</p>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
