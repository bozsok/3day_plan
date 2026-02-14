import { differenceInCalendarDays, format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { NavButton } from '../common/NavButton';
import { StepHeader } from '../common/StepHeader';
import { InfoPill } from '../common/InfoPill';
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
        <StepCard id="date-selection-step-card" noPadding className="flex flex-col md:flex-row items-stretch">
            {/* Bal oldal */}
            <div id="date-selection-content-left" className="flex-1 p-[15px] min-[440px]:p-8 md:p-12 flex flex-col justify-center items-start text-left">
                <StepHeader
                    step="1. Lépés: Időpont"
                    title={<>Válaszd ki az <br /><span className="text-primary-dark">időpontot</span></>}
                    description="Jelöld ki azt a 3 napos hétvégét (péntek-vasárnap), amikor utazni szeretnél."
                />

                <div id="date-selection-nav-container" className="flex gap-4 items-center">
                    <NavButton
                        id="date-selection-back-btn"
                        variant="outline"
                        icon={<ChevronLeft size={24} />}
                        onClick={() => navigate('/')}
                        title="Vissza"
                    />
                    <button
                        id="date-selection-next-btn"
                        className="group bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        onClick={handleNext}
                        disabled={!hasThreeConsecutiveDays}
                    >
                        Tovább
                        <ArrowRight id="date-selection-next-icon" size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Jobb oldal */}
            <div id="date-selection-content-right" className="md:w-5/12 bg-gray-50 p-[15px] min-[440px]:p-8 md:p-10 flex items-center justify-center border-l border-gray-100">
                <div id="calendar-wrapper-box" className="w-full max-w-xs">
                    <CustomCalendar
                        selected={dates}
                        onSelect={handleCalendarSelect}
                    />

                    {/* Info box */}
                    <div id="calendar-info-box" className="mt-8 pt-6 border-t border-gray-200">
                        <InfoPill
                            variant={hasThreeConsecutiveDays ? 'primary' : 'none'}
                            icon={<Calendar size={20} />}
                            label="Kijelölt időszak"
                            value={formattedRange}
                        />

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
