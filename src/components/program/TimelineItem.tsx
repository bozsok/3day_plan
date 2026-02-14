interface TimelineItemProps {
    time: string;
    content: string;
    icon: string;
    isLast?: boolean;
}

export function TimelineItem({ time, content, icon, isLast = false }: TimelineItemProps) {
    return (
        <div className="flex gap-4 min-[440px]:gap-6 group">
            <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 min-[440px]:w-12 min-[440px]:h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <span className="material-icons-outlined text-xl min-[440px]:text-2xl">{icon}</span>
                </div>
                {!isLast && <div className="w-0.5 h-full bg-gray-100 my-2" />}
            </div>
            <div className="pb-8 min-[440px]:pb-10 pt-1">
                <span className="text-xs font-bold text-primary-dark uppercase tracking-widest mb-1 block">
                    {time}
                </span>
                <p className="text-gray-700 text-sm min-[440px]:text-base leading-relaxed font-medium">
                    {content}
                </p>
            </div>
        </div>
    );
}
