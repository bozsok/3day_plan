import { useState } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { ChevronLeft, Save, Share2 } from 'lucide-react';
import { mockPrograms, regions } from '../../data/mockData';

interface ProgramTimelineProps {
    regionId: string | undefined;
    dates: Date[] | undefined;
    onBack: () => void;
}

export function ProgramTimeline({ regionId, dates, onBack }: ProgramTimelineProps) {
    const [selectedDayIndex, setSelectedDayIndex] = useState(1);

    const programs = mockPrograms.find(p => p.regionId === regionId);
    const region = regions.find(r => r.id === regionId);
    const sortedDates = dates ? [...dates].sort((a, b) => a.getTime() - b.getTime()) : [];

    /* ── Nincs program ── */
    if (!programs) {
        return (
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-14 lg:p-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Programok betöltése...</h2>
                <p className="text-gray-500 mb-6">
                    Nem található program a kiválasztott tájegységhez ({region?.name ?? regionId}).
                </p>
                <button
                    className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    onClick={onBack}
                >
                    Vissza
                </button>
            </div>
        );
    }

    const currentDayProgram = programs.days.find(d => d.dayIndex === selectedDayIndex);

    /* Nap nevek generálása a kiválasztott dátumokból */
    const dayTabs = [1, 2, 3].map(dayIndex => {
        const date = sortedDates[dayIndex - 1];
        const dayName = date
            ? format(date, 'EEEE', { locale: hu })
            : `${dayIndex}. nap`;

        return {
            dayIndex,
            dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            dateLabel: date ? format(date, 'MMM d.', { locale: hu }) : '',
        };
    });

    /* Formázott dátum tartomány a sidebar-ba */
    const dateRangeLabel = sortedDates.length >= 2
        ? `${format(sortedDates[0], 'yyyy. MMMM d.', { locale: hu })} – ${format(sortedDates[sortedDates.length - 1], 'd.', { locale: hu })}`
        : 'Nincs dátum';

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
            {/* ═══════════ BAL SIDEBAR ═══════════ */}
            <div className="lg:w-80 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/50">
                <div className="sticky top-8">
                    {/* Cím */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Utazás Összegzése
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {programs.title}
                        </p>
                    </div>

                    {/* Költség */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                        <span className="text-gray-500 text-sm block mb-1">Várható összköltség</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                                {programs.estimatedCost}
                            </span>
                            <span className="text-gray-600 font-semibold">Ft</span>
                        </div>
                    </div>

                    {/* Akció gombok */}
                    <div className="space-y-3 mb-6">
                        <button className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                            <Save size={18} />
                            Csomag mentése
                        </button>
                        <button className="w-full bg-white border-2 border-primary/20 hover:border-primary/50 text-gray-700 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                            <Share2 size={18} />
                            Megosztás
                        </button>
                    </div>

                    {/* Útiterv adatok */}
                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                            Útiterv Adatok
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-600 text-sm">
                                <span className="material-icons-outlined text-primary text-lg">calendar_today</span>
                                {dateRangeLabel}
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 text-sm">
                                <span className="material-icons-outlined text-primary text-lg">location_on</span>
                                {region?.name ?? 'Ismeretlen régió'}
                            </li>
                        </ul>
                    </div>

                    {/* Vissza gomb */}
                    <button
                        className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg font-medium text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all"
                        onClick={onBack}
                    >
                        <ChevronLeft size={18} />
                        Vissza a térképhez
                    </button>
                </div>
            </div>

            {/* ═══════════ JOBB OLDAL: TARTALOM ═══════════ */}
            <div className="flex-1 flex flex-col">
                {/* Nap fülek */}
                <div className="flex border-b border-gray-100 bg-white">
                    {dayTabs.map(tab => {
                        const isActive = selectedDayIndex === tab.dayIndex;
                        return (
                            <button
                                key={tab.dayIndex}
                                onClick={() => setSelectedDayIndex(tab.dayIndex)}
                                className={`flex-1 py-6 px-4 text-center border-b-4 transition-all ${isActive
                                        ? 'border-primary bg-primary/5 text-gray-900 font-bold'
                                        : 'border-transparent hover:bg-gray-50 text-gray-500 font-semibold'
                                    }`}
                            >
                                <span className={`block text-xs uppercase tracking-widest mb-1 ${isActive ? 'text-primary' : 'text-gray-400'
                                    }`}>
                                    {tab.dayName}
                                </span>
                                {tab.dayIndex}. Nap
                            </button>
                        );
                    })}
                </div>

                {/* Timeline tartalom */}
                <div className="p-8 lg:p-12 bg-white">
                    <div className="relative timeline-line space-y-12">
                        {currentDayProgram?.items.map(item => (
                            <div key={item.id} className="relative z-10 flex gap-8 items-start">
                                {/* Ikon kör */}
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                    <span className="material-icons-outlined text-gray-900 text-lg">
                                        {item.icon}
                                    </span>
                                </div>

                                {/* Tartalom */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                                            {item.time}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {item.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.description}
                                    </p>

                                    {/* Opcionális kép */}
                                    {item.imageUrl && (
                                        <div className="rounded-lg overflow-hidden h-48 relative border border-gray-100 mt-4">
                                            <img
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                src={item.imageUrl}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
