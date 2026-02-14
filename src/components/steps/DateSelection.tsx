import { differenceInCalendarDays, format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Calendar } from 'lucide-react';
import { CustomCalendar } from '../common/CustomCalendar';
import { useUser } from '../../context/UserContext';
import { StepCard } from '../common/StepCard';

interface DateSelectionProps {
    selected: Date[] | undefined;
    onSelect: (dates: Date[] | undefined) => void;
}

export function DateSelection({ selected, onSelect }: DateSelectionProps) {
    const navigate = useNavigate();
    const { user } = useUser();
    const dates = selected ?? [];

    const isConsecutive = (d: Date[]) => {
        if (d.length !== 3) return false;
        const sorted = [...d].sort((a, b) => a.getTime() - b.getTime());
        return (
            differenceInCalendarDays(sorted[1], sorted[0]) === 1 &&
            differenceInCalendarDays(sorted[2], sorted[1]) === 1
        );
    };

    const hasThreeConsecutiveDays = isConsecutive(dates) && dates.length > 0 && dates[0].getDay() === 5;

    const handleNext = () => {
        if (!hasThreeConsecutiveDays || !user) return;
        navigate('/terv/helyszin');
    };

    const handleCalendarSelect = (newDates: Date[]) => {
        onSelect(newDates);
    };

    const formattedRange = dates.length > 0
        ? (() => {
            const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
            const first = sorted[0];
            const last = sorted[sorted.length - 1];
            if (dates.length === 1) return format(first, 'MMMM d.', { locale: hu });
            return `${format(first, 'MMMM d.', { locale: hu })} - ${format(last, 'd.', { locale: hu })} (${dates.length} nap)`;
        })()
        : 'Válassz dátumot';

    return (
        <StepCard noPadding className="flex flex-col md:flex-row items-stretch">
            {/* Bal oldal */}
            <div className="flex-1 p-[15px] min-[440px]:p-8 md:p-12 flex flex-col justify-center items-start text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                        1. Lépés: Időpont
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                    Válaszd ki az <br />
                    <span className="text-primary-dark">időpontot</span>
                </h1>

                <p className="text-gray-600 text-lg mb-10 leading-relaxed max-w-md">
                    Jelöld ki azt a 3 napos hétvégét (péntek-vasárnap), amikor utazni szeretnél.
                </p>

                <div className="flex gap-4 items-center">
                    <button
                        className="p-4 rounded-2xl border border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all"
                        onClick={() => navigate('/')}
                        title="Vissza"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        className="group bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        onClick={handleNext}
                        disabled={!hasThreeConsecutiveDays}
                    >
                        Tovább
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Jobb oldal */}
            <div className="md:w-5/12 bg-gray-50 p-[15px] min-[440px]:p-8 md:p-10 flex items-center justify-center border-l border-gray-100">
                <div className="w-full max-w-xs">
                    <CustomCalendar
                        selected={dates}
                        onSelect={handleCalendarSelect}
                    />

                    {/* Info box */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary-dark">
                                <Calendar size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-gray-900 text-xs font-bold uppercase tracking-tight">Kijelölt időszak</p>
                                <p className="text-gray-500 text-[10px]">{formattedRange}</p>
                            </div>
                        </div>

                        {/* Figyelmeztetés ha nem Péntek-Vasárnap */}
                        {isConsecutive(dates) && dates.length > 0 && dates[0].getDay() !== 5 && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2 text-left">
                                <span className="text-lg">⚠️</span>
                                Csak Péntek-Vasárnap hétvége választható!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StepCard>
    );
}
