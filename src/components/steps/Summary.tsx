import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { hu } from 'date-fns/locale';
import { StepCard } from '../common/StepCard';
import { api } from '../../api/client';
import { useUser } from '../../context/UserContext';
import { counties } from '../../data/mockData';
import { Trophy, Calendar as CalendarIcon, Users, ArrowRight, ExternalLink, Settings2, ChevronLeft } from 'lucide-react';
import { VoteManagementModal } from '../modals/VoteManagementModal';

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
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [data, setData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showVoteModal, setShowVoteModal] = useState(false);
    const [adminMode, setAdminMode] = useState(false);
    const [titleClicks, setTitleClicks] = useState(0);
    const [adminStatus, setAdminStatus] = useState<string | null>(null);



    const handleTitleClick = () => {
        const newCount = titleClicks + 1;
        setTitleClicks(newCount);
        if (newCount >= 5) {
            setAdminMode(true);
            setTitleClicks(0);
            setAdminStatus(null);
        }
    };

    const handleAdminReset = async () => {


        try {
            setAdminStatus('🔄 Reset folyamatban...');
            await api.admin.reset();
            logout();
            setAdminStatus('✅ Sikeres reset! Újratöltés...');
            setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
            setAdminStatus('❌ Hiba a reset során!');

        }
    };

    const handleAdminDeleteUser = async (id: number) => {


        try {
            await api.admin.deleteUser(id);
            setAdminStatus(`✅ Felhasználó (ID: ${id}) törölve!`);

            if (user && user.id === id) {
                logout();
            }


            fetchSummary();
            // Clear status after 3 seconds
            setTimeout(() => setAdminStatus(null), 3000);
        } catch (e) {
            setAdminStatus('❌ Hiba a törlés során!');
        }
    };

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

    useEffect(() => {
        fetchSummary();
        // Reduced polling frequency to prevent server congestion
        const interval = setInterval(fetchSummary, 12000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return <div className="p-10 text-center text-gray-500">Adatok betöltése...</div>;
    }

    if (!data) return null;

    return (
        <StepCard>
            {/* Vissza gomb - Abszolút pozicionálás */}
            <button
                onClick={() => navigate('/terv/program')}
                className="absolute top-4 left-4 min-[440px]:top-8 md:top-12 min-[440px]:left-8 md:left-12 group hover:scale-105 transition-transform z-10"
            >
                <div
                    className="flex items-center justify-center w-10 h-10 min-[440px]:w-12 min-[440px]:h-12 md:w-14 md:h-14 rounded-2xl border border-gray-200 text-gray-400 group-hover:border-gray-900 group-hover:text-gray-900 transition-all"
                >
                    <ChevronLeft size={24} />
                </div>
            </button>

            <div className="text-center mb-12 relative">
                {/* Header Action Button */}
                <button
                    onClick={() => setShowVoteModal(true)}
                    className="absolute top-0 right-0 md:top-2 md:right-2 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm font-bold transition-all shadow-sm"
                >
                    <Settings2 size={16} />
                    <span className="hidden md:inline">Szavazataim</span>
                </button>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                        Élő Eredmények
                    </span>
                </div>
                <h1
                    onClick={handleTitleClick}
                    className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 select-none cursor-default active:scale-95 transition-transform"
                >
                    Közös <span className="text-primary-dark">tervezés</span>
                </h1>
                <p className="text-gray-600 text-lg">
                    Itt láthatod a csapat összesített döntéseit valós időben.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

                {/* 1. Dátum Intervallumok */}
                <div className="bg-gray-50 rounded-2xl min-[440px]:rounded-3xl p-[15px] min-[440px]:p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <CalendarIcon size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Mikor menjünk?</h2>
                    </div>

                    <div className="space-y-4">
                        {(data.topIntervals || []).map((item, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border ${idx === 0 ? 'bg-white border-blue-200 shadow-md' : 'bg-transparent border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-gray-900">
                                        {format(new Date(item.start), 'MMM d.', { locale: hu })} - {format(new Date(item.end), 'MMM d.', { locale: hu })}
                                    </span>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap inline-flex items-center justify-center h-6">
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
                <div className="bg-gray-50 rounded-2xl min-[440px]:rounded-3xl p-[15px] min-[440px]:p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                            <Trophy size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Hova menjünk?</h2>
                    </div>

                    <div className="space-y-4">
                        {data.voteRanking.map((item, idx) => {
                            const regionName = counties.find(r => r.id === item.regionId)?.name ?? item.regionId;
                            return (
                                <div
                                    key={item.regionId}
                                    onClick={() => {
                                        onRegionSelect?.(item.regionId);
                                        navigate('/terv/csomagok');
                                    }}
                                    className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${idx === 0 ? 'bg-white border-yellow-200 shadow-md transform hover:scale-105' : 'bg-transparent border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-900 flex items-center gap-2">
                                            {idx === 0 && '👑'} {regionName}
                                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                        </span>
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap inline-flex items-center justify-center h-6">
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
                    <div className="bg-gray-900 text-white rounded-2xl min-[440px]:rounded-3xl p-[15px] min-[440px]:p-8">
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
                    <div className="bg-white border border-gray-200 rounded-2xl min-[440px]:rounded-3xl p-[15px] min-[440px]:p-8">
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
                        onClick={() => {
                            onContinue();
                            navigate('/terv/idopont');
                        }}
                        className="bg-primary hover:bg-primary-dark text-gray-900 font-bold px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 border-4 border-white"
                    >
                        <CalendarIcon size={24} />
                        Tovább tervezek
                        <ArrowRight size={20} />
                    </button>
                </div>
            )}

            <VoteManagementModal
                isOpen={showVoteModal}
                onClose={() => setShowVoteModal(false)}
                onVoteDeleted={fetchSummary}
            />

            {/* ADMIN PANEL OVERLAY */}
            {adminMode && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-4 border-red-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                                🛠️ RENDSZERGAZDA
                            </h2>
                            <button
                                onClick={() => { setAdminMode(false); setAdminStatus(null); }}
                                className="text-gray-500 hover:text-gray-900 font-bold"
                            >
                                BEZÁRÁS
                            </button>
                        </div>

                        {adminStatus && (
                            <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center font-bold text-gray-800">
                                {adminStatus}
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={handleAdminReset}
                                className="w-full font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all bg-red-600 hover:bg-red-700 text-white hover:scale-105"
                            >
                                ☢️ ADATBÁZIS TÖRLÉS
                            </button>

                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h3 className="font-bold text-gray-700 mb-2">Felhasználók törlése:</h3>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {data?.userStatuses.map(u => (
                                        <div key={u.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="font-medium text-gray-800">{u.name} (ID: {u.id})</span>
                                            <button
                                                onClick={() => handleAdminDeleteUser(u.id)}
                                                className="px-3 py-1 rounded text-xs font-bold transition-colors bg-white text-red-500 hover:bg-red-50 border border-red-200"
                                            >
                                                🗑️ Törlés
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StepCard>
    );
}
