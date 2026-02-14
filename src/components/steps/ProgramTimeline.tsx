import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
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
        <div className="flex flex-col relative w-full">
            {/* Lépés címke (Zöld kapszula) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 w-fit md:mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                    4. Lépés: Programok
                </span>
            </div>

            {/* Megye neve */}
            <div className="flex items-center justify-start md:justify-center lg:justify-start gap-2 mb-2">
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase tracking-wider">
                    {county?.name}
                </span>
            </div>

            {/* Helyszín/csomag neve */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight text-left md:text-center lg:text-left">
                {selectedPackage.title}
            </h1>

            {/* Programterv felirat */}
            <p className="text-gray-500 text-sm mb-6 text-left md:text-center lg:text-left">3 napos programterv</p>

            {/* Navigációs gombok - Mobil (< 440px) - A felirat alatt */}
            <div className="flex min-[441px]:hidden gap-4 mb-6">
                <button
                    className="w-14 flex items-center justify-center h-14 rounded-2xl border border-gray-200 text-gray-400 active:scale-95 transition-all bg-white"
                    onClick={() => navigate('/terv/csomagok')}
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => navigate('/terv/osszegzes')}
                    disabled={!hasAnyVote}
                    className={`w-14 flex items-center justify-center h-14 rounded-2xl transition-all shadow-lg active:scale-95 ${hasAnyVote
                        ? 'bg-primary text-gray-900 hover:bg-primary-dark shadow-primary/30'
                        : 'bg-gray-100 text-gray-300 shadow-none opacity-50'
                        }`}
                >
                    <ArrowRight size={24} />
                </button>
            </div>

            {/* Időpont elem */}
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
    );

    const SidebarActions = (
        <div className="flex flex-col">
            {/* Várható összköltség elem */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6 mt-4 lg:mt-0">
                <span className="text-gray-500 text-sm block mb-1">Várható összköltség</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{selectedPackage.estimatedCost}</span>
                    <span className="text-gray-600 font-semibold">Ft</span>
                </div>
            </div>

            {/* Hibaüzenet */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-bold text-center">
                    {error}
                </div>
            )}

            {/* Akció gombok */}
            <div className="space-y-3 mb-4">
                <button
                    onClick={handleVote}
                    disabled={voteMutation.isPending}
                    className="w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                    {voteMutation.isPending ? 'MENTÉS...' : 'Szavazok erre!'}
                </button>

                <button
                    onClick={() => navigate('/terv/osszegzes')}
                    className="group bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 w-full"
                >
                    Eredmények
                    <span className="text-xl group-hover:translate-x-1 transition-transform inline-flex items-center">
                        <ArrowRight size={20} />
                    </span>
                </button>
            </div>

            <p className="mt-2 text-[11px] text-gray-400 text-center leading-relaxed px-4">
                A szavazatoddal rögzíted a választott megyét és időpontot is.
            </p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl min-[440px]:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 relative flex flex-col lg:flex-row">
            {/* GLOBÁLIS NAVIGÁCIÓS GOMBOK (Desktop és Tablet > 440px) */}
            <div className="hidden min-[441px]:flex gap-4 absolute top-8 right-8 md:top-12 md:right-12 z-30">
                {/* Vissza gomb */}
                <button
                    className="group hover:scale-105 transition-transform"
                    onClick={() => navigate('/terv/csomagok')}
                    title="Vissza"
                >
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl border border-gray-200 text-gray-400 group-hover:border-gray-900 group-hover:text-gray-900 transition-all bg-white">
                        <ChevronLeft size={24} />
                    </div>
                </button>

                {/* Tovább gomb (Zöld) */}
                <button
                    onClick={() => navigate('/terv/osszegzes')}
                    disabled={!hasAnyVote}
                    className={`group transition-all ${hasAnyVote ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}`}
                    title="Tovább az összegzéshez"
                >
                    <div className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-lg ${hasAnyVote
                        ? 'bg-primary text-gray-900 hover:bg-primary-dark shadow-primary/30'
                        : 'bg-gray-100 text-gray-300 shadow-none opacity-50'
                        }`}>
                        <ArrowRight size={24} />
                    </div>
                </button>
            </div>
            {/* 1. BAL OLDAL (SIDEBAR) */}
            <div className="hidden lg:flex lg:w-80 p-8 md:p-12 border-r border-gray-100 bg-gray-50/50 flex flex-col justify-start items-start gap-8">
                {SidebarInfo}
                {SidebarActions}
            </div>

            {/* 2. JOBB OLDAL (CONTENT) */}
            <div className="flex-1 flex flex-col relative">
                {/* MOBIL FEJLÉC (csak lg alatt) */}
                <div className="lg:hidden p-[15px] min-[440px]:p-8 md:p-12 border-b border-gray-100 bg-gray-50/50">
                    {SidebarInfo}
                </div>

                {/* NAP FÜLEK */}
                <div className="flex border-b border-gray-100 bg-white lg:pr-40">
                    {[1, 2, 3].map((dayIndex) => {
                        const isActive = activeDay === dayIndex;
                        const dayName = (dayNames[dayIndex - 1] || `${dayIndex}. nap`).toUpperCase();
                        return (
                            <button
                                key={dayIndex}
                                onClick={() => setActiveDay(dayIndex)}
                                className={`flex-1 py-6 px-4 text-center border-b-4 transition-all ${isActive
                                    ? 'border-primary bg-primary/5 text-gray-900 font-bold'
                                    : 'border-transparent text-gray-400'
                                    }`}
                            >
                                <span className={`block text-xs uppercase tracking-widest mb-1 ${isActive ? 'text-primary font-bold' : 'text-gray-400'
                                    }`}>
                                    {dayName}
                                </span>
                                <span className="text-base font-black">
                                    {dayIndex}. Nap
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* TIMELINE TARTALOM */}
                <div className="flex-1 p-[15px] min-[440px]:p-8 md:p-12 lg:p-12 overflow-y-auto bg-white">
                    <div className="max-w-2xl mx-auto lg:mx-0">
                        {selectedPackage.days.find(d => d.dayIndex === activeDay)?.items.map((item, idx, arr) => (
                            <div key={item.id} className="flex gap-6 md:gap-10 group">
                                <div className="flex flex-col items-center shrink-0">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                                        <span className="material-icons-outlined text-3xl md:text-4xl">{item.icon}</span>
                                    </div>
                                    {idx !== arr.length - 1 && (
                                        <div className="w-0.5 h-full bg-gray-100/50 my-3" />
                                    )}
                                </div>
                                <div className="pb-10 md:pb-14 pt-2 md:pt-3">
                                    <span className="text-[10px] md:text-[11px] font-black text-primary-dark uppercase tracking-[0.3em] mb-2 md:mb-3 block">
                                        {item.time}
                                    </span>
                                    <p className="text-gray-900 text-lg md:text-2xl font-black leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MOBIL LÁBLÉC (csak lg alatt) */}
                <div className="lg:hidden p-[15px] min-[440px]:p-8 md:p-12 border-t border-gray-100 bg-white">
                    {SidebarActions}
                </div>
            </div>
        </div>
    );
}
