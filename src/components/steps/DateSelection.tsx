import { useState } from 'react';
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
import { api } from '../../api/client';

import { useQueryClient } from '@tanstack/react-query';

interface DateSelectionProps {
    selected: Date[] | undefined;
    onSelect: (dates: Date[] | undefined) => void;
    onVoteSuccess?: () => void;
    regionId: string | undefined;
    packageId: string | undefined;
}

export function DateSelection({ selected, onSelect, onVoteSuccess, regionId, packageId }: DateSelectionProps) {
    const navigate = useNavigate();
    const { user } = useUser();
    const queryClient = useQueryClient();
    const dates = selected ?? [];
    const [isSaving, setIsSaving] = useState(false);

    const isConsecutive = (d: Date[]) => {
        if (d.length < 3 || d.length > 4) return false;
        const sorted = [...d].sort((a, b) => a.getTime() - b.getTime());
        for (let i = 0; i < sorted.length - 1; i++) {
            if (differenceInCalendarDays(sorted[i + 1], sorted[i]) !== 1) return false;
        }
        return true;
    };

    const isValidSelection = (d: Date[]) => {
        if (!isConsecutive(d)) return false;
        const sorted = [...d].sort((a, b) => a.getTime() - b.getTime());
        const startDay = sorted[0].getDay();

        if (d.length === 3) {
            // 3 nap esetén csak Péntek-Vasárnap (Pénteki kezdéssel: 5)
            return startDay === 5;
        } else if (d.length === 4) {
            // 4 nap esetén: Csütörtök-Vasárnap (4) VAGY Péntek-Hétfő (5)
            return startDay === 4 || startDay === 5;
        }
        return false;
    };

    const hasValidDates = isValidSelection(dates);

    const handleNext = async () => {
        if (!hasValidDates || !user || !regionId || !packageId || isSaving) return;

        try {
            setIsSaving(true);
            const dateStrings = dates.map(d => format(d, 'yyyy-MM-dd'));

            // Mentjük az időpontokat és leadjuk a szavazatot
            await api.dates.save(user.id, dateStrings, regionId);
            await api.votes.cast(user.id, regionId, dateStrings, packageId);

            // Töröljük a piszkozatot
            await api.progress.clear(user.id);

            // Kliens oldali takarítás
            onVoteSuccess?.();

            // Query frissítés
            queryClient.invalidateQueries({ queryKey: ['summary'] });

            navigate('/terv/osszegzes');
        } catch (error) {
            console.error('Hiba a szavazat leadásakor:', error);
            setError('Hiba történt a szavazat mentésekor. Próbáld újra!');
        } finally {
            setIsSaving(false);
        }
    };

    const [error, setError] = useState<string | null>(null);

    const handleCalendarSelect = async (newDates: Date[]) => {
        onSelect(newDates);

        // Live progress frissítése: Ha érvényes -> zöld, ha nem -> szürke
        if (user) {
            const isValid = isValidSelection(newDates);
            // Csak akkor küldjük, ha változik a validitás, vagy ha van kiválasztás
            try {
                const dateStrings = newDates.map(d => format(d, 'yyyy-MM-dd'));
                await api.progress.update(user.id, { hasDates: isValid, dates: dateStrings });
            } catch (e) {
                // Silent fail
            }
        }
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
                    step="4. Lépés: Szavazás"
                    title={<>Véglegesítsd a <br /><span className="text-primary-dark">szavazatod</span></>}
                    description="Kérlek válassz egy időpontot, amivel véglegesíted a választott csomagot és helyszínt."
                />

                <div id="date-selection-nav-container" className="flex gap-4 items-center mt-4">
                    <NavButton
                        id="date-selection-back-btn"
                        variant="outline"
                        icon={<ChevronLeft size={24} />}
                        onClick={() => navigate('/terv/program')}
                        title="Vissza"
                    />
                    <button
                        id="date-selection-next-btn"
                        className="group bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg px-8 h-14 rounded-2xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        onClick={handleNext}
                        disabled={!hasValidDates || isSaving}
                    >
                        {isSaving ? 'Szavazat elküldése...' : 'Szavazat véglegesítése'}
                        {!isSaving && <ArrowRight id="date-selection-next-icon" size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold w-full text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* Jobb oldal */}
            <div id="date-selection-content-right" className="md:w-5/12 bg-gray-50 p-[15px] min-[440px]:p-8 md:p-12 flex items-center justify-center border-l border-gray-100">
                <div id="calendar-wrapper-box" className="w-full max-w-xs">
                    <CustomCalendar
                        selected={dates}
                        onSelect={handleCalendarSelect}
                    />

                    {/* Info box */}
                    <div id="calendar-info-box" className="mt-8 pt-6 border-t border-gray-200">
                        <InfoPill
                            variant={hasValidDates ? 'primary' : 'none'}
                            icon={<Calendar size={20} />}
                            label="Kijelölt időszak"
                            value={formattedRange}
                        />

                        {/* Figyelmeztetés ha nem szabályos intervallum */}
                        {isConsecutive(dates) && dates.length > 0 && !hasValidDates && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2 text-left">
                                <span className="text-lg">⚠️</span>
                                Érvénytelen napok! Csak P-V, Cs-V vagy P-H intervallum választható.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StepCard>
    );
}
