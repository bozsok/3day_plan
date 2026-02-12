import { useState } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { mockPrograms } from '../../data/mockData';

interface ProgramTimelineProps {
    regionId: string | undefined;
    dates: Date[] | undefined;
    onBack: () => void;
}

export function ProgramTimeline({ regionId, dates, onBack }: ProgramTimelineProps) {
    const [selectedDayIndex, setSelectedDayIndex] = useState(1);

    const programs = mockPrograms.find(p => p.regionId === regionId);
    const sortedDates = dates ? [...dates].sort((a, b) => a.getTime() - b.getTime()) : [];

    if (!programs) {
        return (
            <div className="max-w-4xl mx-auto pb-16 text-center">
                <h2 className="text-2xl text-primary mb-6 text-center">Programok betöltése...</h2>
                <p>Nem található program a kiválasztott tájegységhez ({regionId}).</p>
                <button
                    className="mt-4 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    onClick={onBack}
                >
                    Vissza
                </button>
            </div>
        );
    }

    const currentDayProgram = programs.days.find(d => d.dayIndex === selectedDayIndex);

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-14 lg:p-16">
            <h2 className="text-2xl text-primary mb-6 text-center font-bold">{programs.title}</h2>

            <div className="flex justify-center gap-4 mb-8">
                {[1, 2, 3].map((dayIndex) => {
                    const date = sortedDates[dayIndex - 1];
                    const label = date
                        ? format(date, 'EEEE', { locale: hu })
                        : `${dayIndex}. Nap`;
                    const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);

                    return (
                        <button
                            key={dayIndex}
                            className={`px-4 py-2 border rounded-lg font-medium transition-all ${selectedDayIndex === dayIndex
                                ? 'bg-primary text-white border-primary'
                                : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'
                                }`}
                            onClick={() => setSelectedDayIndex(dayIndex)}
                        >
                            {formattedLabel}
                        </button>
                    );
                })}
            </div>

            <div className="timeline-line flex flex-col gap-6">
                {currentDayProgram?.items.map((item) => (
                    <div key={item.id} className="timeline-card bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <div className="text-sm font-semibold text-primary mb-1">{item.time}</div>
                        <div className="text-lg font-semibold mb-2">{item.title}</div>
                        <div className="text-gray-500 text-base">{item.description}</div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <button
                    className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    onClick={onBack}
                >
                    Vissza a térképhez
                </button>
            </div>
        </div>
    );
}
