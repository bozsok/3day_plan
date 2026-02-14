import { useState } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { packages, counties } from '../../data/mockData'; // Imported packages and counties
import { useUser } from '../../context/UserContext';
import { api } from '../../api/client';

import { useEffect } from 'react';
import { StepCard } from '../common/StepCard';

interface ProgramTimelineProps {
    regionId: string | undefined;
    packageId: string | undefined; // Added packageId
    dates: Date[] | undefined;
    onBack: () => void;
    onFinish: () => void;
}

export function ProgramTimeline({ regionId, packageId, dates, onBack, onFinish }: ProgramTimelineProps) {
    const { user } = useUser();

    // Redirect if no package selected (e.g. after refresh/hot-reload)
    useEffect(() => {
        if (!packageId) {
            onBack();
        }
    }, [packageId, onBack]);

    const [hasVoted, setHasVoted] = useState(false);

    // Check if user has already voted for this region
    useEffect(() => {
        if (user && regionId) {
            api.votes.list(user.id).then(votes => {
                const alreadyVoted = votes.some(v => v.regionId === regionId);
                setHasVoted(alreadyVoted);
            }).catch(err => console.error("Failed to check votes:", err));
        }
    }, [user, regionId]);
    const [selectedDayIndex, setSelectedDayIndex] = useState(1);
    const [isVoting, setIsVoting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Find the specific package selected
    const selectedPackage = packages.find(p => p.id === packageId);
    // Fallback or county info (regionId prop contains countyId)
    const county = counties.find(c => c.id === regionId);

    // Szavazás kezelése
    const handleVote = async () => {
        if (!user || !regionId || isVoting) return;
        setError(null);

        setIsVoting(true);
        try {
            // 1. Dátumok mentése
            const dateStrings = dates && dates.length > 0 ? dates.map(d => format(d, 'yyyy-MM-dd')) : [];

            if (dateStrings.length > 0) {
                await api.dates.save(user.id, dateStrings, regionId);
            }

            // 2. Szavazás (Blokk létrehozása 3 dátummal)
            if (dateStrings.length !== 3) {
                setError("Hiba: Pontosan 3 napot kell kiválasztani a szavazáshoz!");
                return;
            }

            // Note: Currently voting is per REGION in the backend (mock). 
            // Ideally we should vote for a PACKAGE ID if we want granular votes.
            // For now, adhering to existing API (regionId), assuming 1 vote per region logic mostly.
            // If the user wants to vote for specific package, backend needs update. 
            // Based on prompt, we just show the package here.
            await api.votes.cast(user.id, regionId, dateStrings);

            onFinish();
        } catch (error) {
            console.error('Hiba szavazáskor:', error);
            setError('Hiba történt a művelet során. Próbáld újra!');
        } finally {
            setIsVoting(false);
        }
    };

    const sortedDates = dates ? [...dates].sort((a, b) => a.getTime() - b.getTime()) : [];

    /* ── Nincs program ── */
    if (!selectedPackage) {
        return (
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-14 lg:p-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Csomag betöltése...</h2>
                <p className="text-gray-500 mb-6">
                    Nem található a kiválasztott csomag.
                </p>
                <button
                    className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    onClick={onBack}
                >
                    Vissza a csomagokhoz
                </button>
            </div>
        );
    }

    const currentDayProgram = selectedPackage.days.find(d => d.dayIndex === selectedDayIndex);

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

    // Részegységek definiálása a könnyebb újrahasznosítás/rendezés miatt
    const HeaderSection = () => (
        <div className="relative">
            {/* Vissza gomb - Abszolút pozicionálás, mint a 3. lépésnél */}
            <button
                onClick={onBack}
                className="absolute top-0 left-0 group hover:scale-105 transition-transform z-10"
            >
                <div
                    className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm group-hover:shadow border border-gray-200 group-hover:border-gray-300 transition-all flex items-center justify-center w-10 h-10 min-[440px]:w-12 min-[440px]:h-12"
                >
                    <span className="material-icons-outlined text-gray-600 group-hover:text-gray-900 text-lg">arrow_back</span>
                </div>
            </button>

            {/* Tovább gomb (Csak ha már szavazott) - MOBIL/TABLET ONLY (lg:hidden) */}
            {hasVoted && (
                <button
                    onClick={onFinish}
                    className="absolute top-0 right-0 lg:hidden group hover:scale-105 transition-transform z-10"
                >
                    <div
                        className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm group-hover:shadow border border-gray-200 group-hover:border-gray-300 transition-all flex items-center justify-center w-10 h-10 min-[440px]:w-12 min-[440px]:h-12"
                    >
                        <span className="material-icons-outlined text-gray-600 group-hover:text-gray-900 text-lg">arrow_forward</span>
                    </div>
                </button>
            )}

            {/* Cím és Címke - Középre rendezve */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                        4. Lépés: egyedi program
                    </span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase tracking-wider">
                        {county?.name}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                    {selectedPackage.title}
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                    3 napos programterv
                </p>

                {/* Dátum infó */}
                <div className="flex items-center gap-3 text-gray-600 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <span className="material-icons-outlined text-sm">calendar_today</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-bold">Időpont</span>
                        <span className="font-medium text-sm text-blue-900">{dateRangeLabel}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const CostAndActionsSection = () => (
        <>
            {/* Költség */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6 mt-4 lg:mt-6">
                <span className="text-gray-500 text-sm block mb-1">Várható összköltség</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                        {selectedPackage.estimatedCost}
                    </span>
                    <span className="text-gray-600 font-semibold">Ft</span>
                </div>
            </div>

            {/* Hibajelzés */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* Akció gombok */}
            <div className="space-y-3 mb-6">
                {/* 1. Szavazat (Mindig aktív - Hozzáadás) */}
                <button
                    className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 
                        bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]`}
                    onClick={handleVote}
                    disabled={isVoting}
                >
                    {isVoting && <span className="animate-spin text-xl">↻</span>}
                    Szavazok erre!
                </button>
            </div>

            {/* Tovább gomb (Szavazás nélküli tovább lépés, pl csak megnézni az eredményeket) */}
            <button
                className="group bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 w-full"
                onClick={onFinish}
                disabled={isVoting}
            >
                Eredmények
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            </button>

        </>
    );

    return (
        <StepCard noPadding className="flex flex-col lg:flex-row">

            {/* ═══════════ MOBIL NÉZET: FELSŐ RÉSZ (Cím + Dátum) ═══════════ */}
            <div className="lg:hidden p-[15px] min-[440px]:p-8 border-b border-gray-100 bg-gray-50/50">
                <HeaderSection />
            </div>

            {/* ═══════════ DESKTOP SIDEBAR (Minden egyben) ═══════════ */}
            <div className="hidden lg:block lg:w-80 p-8 border-r border-gray-100 bg-gray-50/50">
                <div className="sticky top-8">
                    <HeaderSection />
                    <CostAndActionsSection />
                </div>
            </div>

            {/* ═══════════ JOBB OLDAL: TARTALOM (Timeline) ═══════════ */}
            <div className="flex-1 flex flex-col min-h-[500px] relative">
                {/* DESKTOP FORWARD BUTTON */}
                {hasVoted && (
                    <button
                        onClick={onFinish}
                        className="hidden lg:flex absolute top-8 right-8 group hover:scale-105 transition-transform z-20"
                    >
                        <div
                            className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm group-hover:shadow border border-gray-200 group-hover:border-gray-300 transition-all flex items-center justify-center w-12 h-12"
                        >
                            <span className="material-icons-outlined text-gray-600 group-hover:text-gray-900 text-lg">arrow_forward</span>
                        </div>
                    </button>
                )}
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
                                        <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">
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

            {/* ═══════════ MOBIL NÉZET: ALSÓ RÉSZ (Költség + Gombok) ═══════════ */}
            <div className="lg:hidden p-[15px] min-[440px]:p-8 border-t border-gray-100 bg-gray-50/50">
                <CostAndActionsSection />
            </div>
        </StepCard>
    );
}
