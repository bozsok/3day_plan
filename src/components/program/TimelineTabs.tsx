interface DayTab {
    dayIndex: number;
    dayName: string;
    dateLabel: string;
}

interface TimelineTabsProps {
    activeDay: number;
    onTabChange: (day: number) => void;
    tabs: DayTab[];
}

export function TimelineTabs({ activeDay, onTabChange, tabs }: TimelineTabsProps) {
    return (
        <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10">
            {tabs.map((tab) => (
                <button
                    key={tab.dayIndex}
                    onClick={() => onTabChange(tab.dayIndex)}
                    className={`flex-1 py-4 min-[440px]:py-6 px-2 text-center transition-all relative ${activeDay === tab.dayIndex
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                        }`}
                >
                    <span className={`block text-xs uppercase tracking-widest mb-1 font-bold ${activeDay === tab.dayIndex ? 'text-primary' : 'text-gray-400'
                        }`}>
                        {tab.dayName}
                    </span>
                    <span className="text-sm min-[440px]:text-base font-black flex items-center justify-center gap-1">
                        {tab.dayIndex}. Nap
                        {tab.dateLabel && (
                            <span className="hidden min-[440px]:inline text-[10px] opacity-60 font-medium">({tab.dateLabel})</span>
                        )}
                    </span>
                    {activeDay === tab.dayIndex && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(255,183,0,0.3)]" />
                    )}
                </button>
            ))}
        </div>
    );
}
