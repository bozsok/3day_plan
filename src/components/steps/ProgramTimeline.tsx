import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { Share2, ThumbsUp, Calendar } from 'lucide-react';
import { mockPrograms, regions } from '../../data/mockData';
import { useUser } from '../../context/UserContext';
import { api } from '../../api/client';

interface ProgramTimelineProps {
    regionId: string | undefined;
    dates: Date[] | undefined;
    onBack: () => void;
    onFinish: () => void;
}

export function ProgramTimeline({ regionId, dates, onBack, onFinish }: ProgramTimelineProps) {
    const { user } = useUser();
    const [selectedDayIndex, setSelectedDayIndex] = useState(1);
    const [userVoteBlockId, setUserVoteBlockId] = useState<number | null>(null);
    const [isVoting, setIsVoting] = useState(false);

    // Szavazat státusz ellenőrzése
    useEffect(() => {
        if (!user || !regionId || !dates) return;

        // Formázzuk a jelenlegi dátumokat összehasonlításhoz
        const currentDateStrings = dates.map(d => format(d, 'yyyy-MM-dd')).sort();
        const currentJson = JSON.stringify(currentDateStrings);

        api.votes.list(user.id).then(votes => {
            // Keressük, van-e OLYAN szavazat, ami erre a régióra ÉS ezekre a dátumokra szól
            const vote = votes.find(v => {
                if (v.regionId !== regionId) return false;
                // A votes.dates már string[] az API kliensből
                const voteDates = [...v.dates].sort();
                return JSON.stringify(voteDates) === currentJson;
            });
            setUserVoteBlockId(vote ? vote.id : null);
        });
    }, [user, regionId, dates]);

    const handleRevoke = async () => {
        if (!user || !regionId || isVoting || userVoteBlockId === null) return;

        setIsVoting(true);
        try {
            await api.votes.revoke(user.id, userVoteBlockId);
            setUserVoteBlockId(null);
        } catch (error) {
            console.error('Hiba visszavonáskor:', error);
            alert('Hiba történt.');
        } finally {
            setIsVoting(false);
        }
    };

    const handleVote = async () => {
        if (!user || !regionId || isVoting) return;

        setIsVoting(true);
        try {
            // 1. Dátumok mentése (APPEND - hozzáadja az újakat)
            // Megjegyzés: A votes.cast is megkapja a dátumokat, de a date_selections-t is illik frissíteni/bővíteni.
            // A SPEC szerint a votes.cast validálja, hogy léteznek-e a date_selections-ben?
            // "a 3 dátum már szerepeljen a date_selections között... ha nem -> hibát ad"
            // Szóval ELŐBB el kell menteni a date_selections-be.

            const dateStrings = dates && dates.length > 0 ? dates.map(d => format(d, 'yyyy-MM-dd')) : [];

            if (dateStrings.length > 0) {
                await api.dates.save(user.id, dateStrings, regionId);
            }

            // 2. Szavazás (Blokk létrehozása 3 dátummal)
            if (dateStrings.length !== 3) {
                alert("Hiba: Pontosan 3 napot kell kiválasztani a szavazáshoz!");
                return;
            }

            const res = await api.votes.cast(user.id, regionId, dateStrings);
            // @ts-ignore
            if (res.success && res.block) {
                // @ts-ignore
                setUserVoteBlockId(res.block.id);
            }

            // Opcionális: Visszajelzés
            // alert('Szavazat és időpontok rögzítve!');
        } catch (error) {
            console.error('Hiba szavazáskor:', error);
            alert('Hiba történt a művelet során.');
        } finally {
            setIsVoting(false);
        }
    };

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
                        {/* 1. Szavazat (Mindig aktív - Hozzáadás/Frissítés) */}
                        <button
                            className={`w-full font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 
                                ${userVoteBlockId !== null ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-primary hover:bg-primary-dark'} 
                                text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                            onClick={handleVote}
                            disabled={isVoting}
                        >
                            {isVoting ? (
                                <span className="animate-spin text-xl">↻</span>
                            ) : (
                                <ThumbsUp size={18} className={userVoteBlockId !== null ? 'fill-white' : ''} />
                            )}
                            Szavazok erre!
                        </button>

                        {/* 2. Visszavonás (Csak ha van szavazat) */}
                        {userVoteBlockId !== null && (
                            <button
                                className="w-full font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 disabled:opacity-50"
                                onClick={handleRevoke}
                                disabled={isVoting}
                            >
                                <span className="material-icons-outlined text-sm">delete</span>
                                Visszavonás
                            </button>
                        )}
                    </div>

                    {/* Tovább gomb (Mindig látszik, auto-vote ha kell) */}
                    <button
                        className="group bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 w-full shadow-xl animate-bounce-slow"
                        onClick={onFinish}
                        disabled={isVoting}
                    >
                        {isVoting ? 'Szavazás rögzítése...' : 'Eredmények'}
                        {!isVoting && <Share2 size={18} className="rotate-180" />}
                    </button>

                    {/* Dátum infó */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Calendar size={16} />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block uppercase tracking-wider">Időpont</span>
                                <span className="font-medium text-sm">{dateRangeLabel}</span>
                            </div>
                        </div>
                    </div>
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
        </div>
    );
}
