import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Magyar hónapok és napok ── */
const MONTH_NAMES = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December',
];
const DAY_HEADERS = ['Hé', 'Ke', 'Sze', 'Csü', 'Pé', 'Szo', 'Va'];

/* ── Interfészek ── */
interface CustomCalendarProps {
    selected: Date[];
    onSelect: (dates: Date[]) => void;
}

/* ── Segédfüggvények ── */
function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

function isSelected(day: Date, selected: Date[]) {
    return selected.some(s => isSameDay(s, day));
}

function areDaysConsecutive(dates: Date[]) {
    if (dates.length < 2) return true;
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    for (let i = 1; i < sorted.length; i++) {
        const diff = (sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        if (Math.round(diff) !== 1) return false;
    }
    return true;
}

/* ── Komponens ── */
export function CustomCalendar({ selected, onSelect }: CustomCalendarProps) {
    const [viewDate, setViewDate] = useState(() => {
        if (selected.length > 0) {
            return startOfMonth(selected[0]);
        }
        return startOfMonth(new Date());
    });

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    /* Naptár napok generálása: előző hónap maradék + aktuális + következő hónap elejde */
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        // Hétfő = 0, Vasárnap = 6 (ISO)
        let startWeekday = firstDay.getDay() - 1;
        if (startWeekday < 0) startWeekday = 6;

        const totalDays = daysInMonth(year, month);
        const prevMonthDays = daysInMonth(year, month - 1);

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Előző hónap maradék napjai
        for (let i = startWeekday - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false,
            });
        }

        // Aktuális hónap napjai
        for (let d = 1; d <= totalDays; d++) {
            days.push({
                date: new Date(year, month, d),
                isCurrentMonth: true,
            });
        }

        // Következő hónap napjai (kiegészítés 6 sorra = 42 cellára)
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            days.push({
                date: new Date(year, month + 1, d),
                isCurrentMonth: false,
            });
        }

        return days;
    }, [year, month]);

    /* Nap kattintás kezelés: max 3 egymást követő nap */
    const handleDayClick = (day: Date) => {
        if (isSelected(day, selected)) {
            // Ha már ki van jelölve, töröljük
            onSelect(selected.filter(s => !isSameDay(s, day)));
            return;
        }

        if (selected.length >= 3) {
            // 3 nap már ki van jelölve — újrakezdés ezzel a nappal
            onSelect([day]);
            return;
        }

        const next = [...selected, day].sort((a, b) => a.getTime() - b.getTime());
        if (areDaysConsecutive(next)) {
            onSelect(next);
        } else {
            // Nem egymást követő — újrakezdés
            onSelect([day]);
        }
    };

    /* Kijelölt pozíció meghatározása (rounded corners) */
    const getSelectionPosition = (day: Date): 'first' | 'middle' | 'last' | 'single' | null => {
        if (!isSelected(day, selected)) return null;
        if (selected.length === 1) return 'single';

        const sorted = [...selected].sort((a, b) => a.getTime() - b.getTime());
        if (isSameDay(day, sorted[0])) return 'first';
        if (isSameDay(day, sorted[sorted.length - 1])) return 'last';
        return 'middle';
    };

    const today = new Date();

    return (
        <div id="calendar-root" className="w-full">
            {/* Hónap fejléc — forrás: sor 75-84 */}
            <div id="calendar-nav-header" className="flex items-center justify-between mb-6">
                <h2 id="calendar-view-month" className="text-lg font-bold text-gray-900">
                    {year}. {MONTH_NAMES[month]}
                </h2>
                <div id="calendar-nav-buttons" className="flex gap-2">
                    <button
                        id="calendar-prev-month-btn"
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={prevMonth}
                    >
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <button
                        id="calendar-next-month-btn"
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={nextMonth}
                    >
                        <ChevronRight size={20} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Napfejlécések — forrás: calendar-grid mb-2, text-center text-[10px] ... */}
            <div id="calendar-day-headers-grid" className="grid grid-cols-7 gap-1 mb-2">
                {DAY_HEADERS.map((d, i) => (
                    <div
                        key={d}
                        className={`text-center text-[10px] font-bold uppercase ${i >= 4 ? 'text-primary-dark' : 'text-gray-400'
                            }`}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Naptár rács — forrás: calendar-grid (grid repeat(7, 1fr)) */}
            <div id="calendar-days-grid" className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                    const pos = getSelectionPosition(date);
                    const isToday = isSameDay(date, today) && isCurrentMonth;

                    /* Kerekítés a kijelölés pozíciója alapján — forrás: rounded-r-none / rounded-none / rounded-l-none */
                    let roundedClass = 'rounded-lg';
                    if (pos === 'first') roundedClass = 'rounded-l-lg rounded-r-none';
                    else if (pos === 'middle') roundedClass = 'rounded-none';
                    else if (pos === 'last') roundedClass = 'rounded-r-lg rounded-l-none';

                    return (
                        <button
                            key={idx}
                            id={`calendar-day-btn-${idx}`}
                            onClick={() => handleDayClick(date)}
                            className={`
                                aspect-square flex items-center justify-center text-sm cursor-pointer transition-all
                                ${roundedClass}
                                ${pos
                                    ? 'bg-primary text-background-dark font-bold shadow-sm'
                                    : isCurrentMonth
                                        ? 'text-gray-900 font-medium hover:bg-gray-100'
                                        : 'text-gray-300'
                                }
                                ${isToday && !pos ? 'ring-2 ring-primary-dark ring-inset' : ''}
                            `}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
