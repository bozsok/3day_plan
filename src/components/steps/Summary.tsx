import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { api } from '../../api/client';
import { regions } from '../../data/mockData';
import { Trophy, Calendar as CalendarIcon, Users, ArrowRight, ExternalLink } from 'lucide-react';

interface SummaryData {
    topIntervals: { start: string; end: string; count: number; users: string[] }[];
    voteRanking: { regionId: string; count: number; voters: string[] }[];
    userStatuses: { id: number; name: string; isComplete: boolean; datesCount: number; votesCount: number }[];
}

interface SummaryProps {
    onContinue?: () => void;
    onRegionSelect?: (regionId: string) => void;
}

export function Summary({ onContinue, onRegionSelect }: SummaryProps) {
    const [data, setData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.summary.get();
                // @ts-ignore
                setData(res);
            } catch (error) {
                console.error('Hiba az összegzés betöltésekor:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
        const interval = setInterval(fetchSummary, 12000); // 12 mp-ként frissít (Ritkítás a szerver kímélése érdekében)
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return <div className="p-10 text-center text-gray-500">Adatok betöltése...</div>;
    }

    if (!data) return null;

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-14 lg:p-16 relative">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                        Élő Eredmények
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                    Közös <span className="text-primary-dark">Tervezés</span>
                </h1>
                <p className="text-gray-600 text-lg">
                    Itt láthatod a csapat összesített döntéseit valós időben.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

                {/* 1. Dátum Intervallumok */}
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <CalendarIcon size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Mikor menjünk?</h2>
                    </div>

                    <div className="space-y-4">
                        {(data.topIntervals || []).map((item, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border ${idx === 0 ? 'bg-white border-blue-200 shadow-md transform scale-105' : 'bg-transparent border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-gray-900">
                                        {format(new Date(item.start), 'MMM d.', { locale: hu })} - {format(new Date(item.end), 'MMM d.', { locale: hu })}
                                    </span>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                        {item.count} szavazat
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {item.users.map((u, idx) => (
                                        <span key={`${u}-${idx}`} className="text-[10px] px-2 py-1 bg-gray-200 text-gray-600 rounded-md">
                                            {u}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {(data.topIntervals || []).length === 0 && <p className="text-gray-400 text-sm">Még senki nem választott teljes időszakot.</p>}
                    </div>
                </div>

                {/* 2. Szavazási Rangsor (Kattintható) */}
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                            <Trophy size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Hova menjünk?</h2>
                    </div>

                    <div className="space-y-4">
                        {data.voteRanking.map((item, idx) => {
                            const regionName = regions.find(r => r.id === item.regionId)?.name ?? item.regionId;
                            return (
                                <div
                                    key={item.regionId}
                                    onClick={() => onRegionSelect?.(item.regionId)}
                                    className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${idx === 0 ? 'bg-white border-yellow-200 shadow-md transform hover:scale-105' : 'bg-transparent border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-900 flex items-center gap-2">
                                            {idx === 0 && '👑'} {regionName}
                                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                        </span>
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                                            {item.count} szavazat
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {item.voters.map((u, idx) => (
                                            <span key={`${u}-${idx}`} className="text-[10px] px-2 py-1 bg-gray-200 text-gray-600 rounded-md">
                                                {u}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {data.voteRanking.length === 0 && <p className="text-gray-400 text-sm">Még nem érkezett szavazat egyetlen régióra sem.</p>}
                    </div>
                </div>
            </div>

            {/* 3. Felhasználók állapota (Csoportosítva) */}
            <div className="mt-12 space-y-8">
                {/* 3.1 Aktív Szavazók */}
                {data.userStatuses.some(u => u.datesCount > 0 || u.votesCount > 0) && (
                    <div className="bg-gray-900 text-white rounded-3xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gray-800 text-green-400 flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Aktív Tervezők</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {data.userStatuses.filter(u => u.datesCount > 0 || u.votesCount > 0).map(u => (
                                <div key={u.id} className={`p-4 rounded-xl border ${u.isComplete ? 'bg-green-500/20 border-green-500/50' : 'bg-gray-800 border-gray-700'}`}>
                                    <p className="font-bold truncate mb-1">{u.name}</p>
                                    <div className="text-xs space-y-1 opacity-80">
                                        <p>🗓️ {u.datesCount > 0 ? '✅' : '❌'}</p>
                                        <p>🗳️ {u.votesCount > 0 ? '✅' : '❌'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3.2 Még nem szavaztak */}
                {data.userStatuses.some(u => u.datesCount === 0 && u.votesCount === 0) && (
                    <div className="bg-white border border-gray-200 rounded-3xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-400">Még várjuk a szavazatukat...</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {data.userStatuses.filter(u => u.datesCount === 0 && u.votesCount === 0).map(u => (
                                <div key={u.id} className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-sm font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                    {u.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Lebegő akció gomb: Tovább tervezek */}
            {onContinue && (
                <div className="fixed bottom-8 right-8 z-50 animate-bounce-slow">
                    <button
                        onClick={onContinue}
                        className="bg-primary hover:bg-primary-dark text-gray-900 font-bold px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 border-4 border-white"
                    >
                        <CalendarIcon size={24} />
                        Tovább tervezek
                        <ArrowRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
