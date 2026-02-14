import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { NavButton } from '../common/NavButton';
import { StepHeader } from '../common/StepHeader';
import { InfoPill } from '../common/InfoPill';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { hu } from 'date-fns/locale';
import { packages, counties } from '../../data/mockData';
import { useUser } from '../../context/UserContext';
import { api, type VoteBlock } from '../../api/client';
import { ChevronLeft, ArrowRight } from 'lucide-react';

interface ProgramTimelineProps {
    regionId: string | undefined;
    packageId: string | undefined;
    dates: Date[] | undefined;
}

export function ProgramTimeline({ regionId, packageId, dates }: ProgramTimelineProps) {
    const navigate = useNavigate();
    const { user } = useUser();
    const queryClient = useQueryClient();

    const [activeDay, setActiveDay] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Redirect if no package selected
    useEffect(() => {
        if (!packageId) {
            navigate('/terv/csomagok');
        }
    }, [packageId, navigate]);

    const selectedPackage = packages.find(p => p.id === packageId);
    const county = counties.find(c => c.id === regionId);

    // User votes to show forward button
    const { data: userVotes = [] } = useQuery<VoteBlock[]>({
        queryKey: ['userVotes', user?.id],
        queryFn: () => user ? api.votes.list(user.id) : Promise.resolve([]),
        enabled: !!user,
    });

    const hasAnyVote = userVotes.length > 0;

    const voteMutation = useMutation({
        mutationFn: async () => {
            if (!user || !regionId) return;
            const dateStrings = dates && dates.length > 0 ? dates.map(d => format(d, 'yyyy-MM-dd')) : [];

            if (dateStrings.length !== 3) {
                throw new Error("Hiba: Pontosan 3 napot kell kiválasztani a szavazáshoz!");
            }

            await api.dates.save(user.id, dateStrings, regionId);
            return await api.votes.cast(user.id, regionId, dateStrings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            navigate('/terv/osszegzes');
        },
        onError: (error: Error) => {
            setError(error.message || 'Hiba történt a művelet során. Próbáld újra!');
        }
    });

    // Vissza irányítás ha nincs dátum (pl. frissítésnél ha elveszne a perzisztencia)
    useEffect(() => {
        if (!dates || dates.length === 0) {
            navigate('/terv/idopont');
        }
    }, [dates, navigate]);

    const handleVote = () => {
        if (!user || !regionId || voteMutation.isPending) return;
        setError(null);
        voteMutation.mutate();
    };

    if (!selectedPackage) return null;

    const sortedDates = dates ? [...dates].sort((a, b) => a.getTime() - b.getTime()) : [];

    const dayNames = sortedDates.map(d => format(d, 'EEEE', { locale: hu }));
    const dateRangeLabel = sortedDates.length >= 2
        ? `${format(sortedDates[0], 'yyyy. MMMM d.', { locale: hu })} – ${format(sortedDates[sortedDates.length - 1], 'd.', { locale: hu })}`
        : 'Nincs dátum';

    const SidebarInfo = (
        <div id="program-timeline-sidebar-info" className="flex flex-col relative w-full">
            {/* Fejléc */}
            <StepHeader
                step="4. Lépés: Programok"
                title={<>
                    <div id="program-timeline-county-badge-wrapper" className="flex items-center justify-start md:justify-center lg:justify-start gap-2 mb-2">
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase tracking-wider">
                            {county?.name}
                        </span>
                    </div>
                    {selectedPackage.title}
                </>}
                description="3 napos programterv"
                titleClassName="text-2xl font-bold text-gray-900 mb-2 text-left md:text-center lg:text-left"
                descriptionClassName="text-gray-500 text-sm text-left md:text-center lg:text-left mb-6"
            />

            {/* Navigációs gombok - Mobil (< 440px) - A felirat alatt */}
            <div id="program-timeline-mobile-nav" className="flex min-[441px]:hidden gap-4 mb-6">
                <NavButton
                    variant="outline"
                    icon={<ChevronLeft size={24} />}
                    onClick={() => navigate('/terv/csomagok')}
                    title="Vissza"
                />
                <NavButton
                    variant="primary"
                    icon={<ArrowRight size={24} />}
                    onClick={() => navigate('/terv/osszegzes')}
                    disabled={!hasAnyVote}
                    title="Tovább"
                />
            </div>

            {/* Időpont elem */}
            <InfoPill
                variant="blue"
                icon={<span className="material-icons-outlined text-sm">calendar_today</span>}
                label="Időpont"
                value={dateRangeLabel}
                className="mt-2"
            />
        </div>
    );

    const SidebarActions = (
        <div id="program-timeline-sidebar-actions" className="flex flex-col">
            {/* Várható összköltség elem */}
            <div id="program-timeline-cost-box" className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6 mt-4 lg:mt-0">
                <span id="program-timeline-cost-label" className="text-gray-500 text-sm block mb-1">Várható összköltség</span>
                <div id="program-timeline-cost-amount-wrapper" className="flex items-baseline gap-2">
                    <span id="program-timeline-cost-value" className="text-3xl font-bold text-gray-900">{selectedPackage.estimatedCost}</span>
                    <span id="program-timeline-cost-currency" className="text-gray-600 font-semibold">Ft</span>
                </div>
            </div>

            {/* Hibaüzenet */}
            {error && (
                <div id="program-timeline-error-box" className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-bold text-center">
                    {error}
                </div>
            )}

            {/* Akció gombok */}
            <div id="program-timeline-actions-wrapper" className="space-y-3 mb-4">
                <button
                    id="program-timeline-vote-btn"
                    onClick={handleVote}
                    disabled={voteMutation.isPending}
                    className="w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                    {voteMutation.isPending ? 'MENTÉS...' : 'Szavazok erre!'}
                </button>

                <button
                    id="program-timeline-results-btn"
                    onClick={() => navigate('/terv/osszegzes')}
                    className="group bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 w-full"
                >
                    Eredmények
                    <span className="text-xl group-hover:translate-x-1 transition-transform inline-flex items-center">
                        <ArrowRight size={20} />
                    </span>
                </button>
            </div>

            <p id="program-timeline-vote-disclaimer" className="mt-2 text-[11px] text-gray-400 text-center leading-relaxed px-4">
                A szavazatoddal rögzíted a választott megyét és időpontot is.
            </p>
        </div>
    );

    return (
        <div id="program-timeline-root" className="bg-white rounded-2xl min-[440px]:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 relative flex flex-col lg:flex-row">
            {/* GLOBÁLIS NAVIGÁCIÓS GOMBOK (Desktop és Tablet > 440px) */}
            <div id="program-timeline-global-nav" className="hidden min-[441px]:flex gap-4 absolute top-8 right-8 md:top-12 md:right-12 z-30">
                <NavButton
                    id="program-timeline-back-btn"
                    variant="outline"
                    icon={<ChevronLeft size={24} />}
                    onClick={() => navigate('/terv/csomagok')}
                    title="Vissza"
                />

                <NavButton
                    id="program-timeline-next-btn"
                    variant="primary"
                    icon={<ArrowRight size={24} />}
                    onClick={() => navigate('/terv/osszegzes')}
                    disabled={!hasAnyVote}
                    title="Tovább az összegzéshez"
                />
            </div>
            {/* 1. BAL OLDAL (SIDEBAR) */}
            <div id="program-timeline-sidebar" className="hidden lg:flex lg:w-80 p-8 md:p-12 border-r border-gray-100 bg-gray-50/50 flex flex-col justify-start items-start gap-8">
                {SidebarInfo}
                {SidebarActions}
            </div>

            {/* 2. JOBB OLDAL (CONTENT) */}
            <div id="program-timeline-content" className="flex-1 flex flex-col relative">
                {/* MOBIL FEJLÉC (csak lg alatt) */}
                <div id="program-timeline-mobile-header" className="lg:hidden p-[15px] min-[440px]:p-8 md:p-12 border-b border-gray-100 bg-gray-50/50">
                    {SidebarInfo}
                </div>

                {/* NAP FÜLEK */}
                <div id="program-timeline-tabs-row" className="flex border-b border-gray-100 bg-white lg:pr-40">
                    {[1, 2, 3].map((dayIndex) => {
                        const isActive = activeDay === dayIndex;
                        const idx = dayIndex;
                        const dayName = (dayNames[dayIndex - 1] || `${dayIndex}. nap`).toUpperCase();
                        return (
                            <button
                                key={dayIndex}
                                id={`program-day-tab-btn-${idx}`}
                                onClick={() => setActiveDay(dayIndex)}
                                className={`flex-1 py-6 px-4 text-center border-b-4 transition-all ${isActive
                                    ? 'border-primary bg-primary/5 text-gray-900 font-bold'
                                    : 'border-transparent text-gray-400'
                                    }`}
                            >
                                <span id={`program-day-tab-name-${idx}`} className={`block text-xs uppercase tracking-widest mb-1 ${isActive ? 'text-primary font-bold' : 'text-gray-400'
                                    }`}>
                                    {dayName}
                                </span>
                                <span id={`program-day-tab-number-${idx}`} className="text-base font-black">
                                    {dayIndex}. Nap
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* TIMELINE TARTALOM */}
                <div id="program-timeline-items-scroll" className="flex-1 p-[15px] min-[440px]:p-8 md:p-12 lg:p-12 overflow-y-auto bg-white">
                    <div id="program-timeline-items-wrapper" className="max-w-2xl mx-auto lg:mx-0">
                        {selectedPackage.days.find(d => d.dayIndex === activeDay)?.items.map((item, idx, arr) => (
                            <div key={item.id} id={`program-timeline-item-${item.id}`} className="flex gap-6 md:gap-10 group">
                                <div className="flex flex-col items-center shrink-0">
                                    <div id="program-timeline-item-icon-box" className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                                        <span className="material-icons-outlined text-3xl md:text-4xl">{item.icon}</span>
                                    </div>
                                    {idx !== arr.length - 1 && (
                                        <div id="program-timeline-item-connector" className="w-0.5 h-full bg-gray-100/50 my-3" />
                                    )}
                                </div>
                                <div id="program-timeline-item-content" className="pb-10 md:pb-14 pt-2 md:pt-3">
                                    <span id="program-timeline-item-time" className="text-[10px] md:text-[11px] font-black text-primary-dark uppercase tracking-[0.3em] mb-2 md:mb-3 block">
                                        {item.time}
                                    </span>
                                    <p id="program-timeline-item-description" className="text-gray-900 text-lg md:text-2xl font-black leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MOBIL LÁBLÉC (csak lg alatt) */}
                <div id="program-timeline-mobile-footer" className="lg:hidden p-[15px] min-[440px]:p-8 md:p-12 border-t border-gray-100 bg-white">
                    {SidebarActions}
                </div>
            </div>
        </div>
    );
}
