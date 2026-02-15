import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { hu } from 'date-fns/locale';
import { NavButton } from '../common/NavButton';
import { StepHeader } from '../common/StepHeader';
import { StepCard } from '../common/StepCard';
import { api } from '../../api/client';
import { useUser } from '../../context/UserContext';
import { counties } from '../../data/mockData';
import { Trophy, Calendar as CalendarIcon, ArrowRight, Settings2, ChevronLeft } from 'lucide-react';
import { VoteManagementModal } from '../modals/VoteManagementModal';
import { RankingSection } from '../summary/RankingSection';
import { RankingItem } from '../summary/RankingItem';
import { DesignerStatus } from '../summary/DesignerStatus';

interface SummaryData {
    topIntervals: { start: string; end: string; count: number; users: string[] }[];
    voteRanking: { regionId: string; count: number; voters: string[] }[];
    userStatuses: { id: number; name: string; isComplete: boolean; datesCount: number; votesCount: number }[];
    userProgress: Record<number, { hasDates: boolean, regionId: string | null, packageId: string | null, lastActive: number }>;
}

interface SummaryProps {
    onContinue?: () => void;
    onRegionSelect?: (regionId: string | undefined) => void;
}

export function Summary({ onContinue, onRegionSelect }: SummaryProps) {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [showVoteModal, setShowVoteModal] = useState(false);
    const [adminMode, setAdminMode] = useState(false);
    const [titleClicks, setTitleClicks] = useState(0);
    const [adminStatus, setAdminStatus] = useState<string | null>(null);

    // TanStack Query: Összegzés adatok lekérése és polling
    const { data, isLoading } = useQuery<SummaryData>({
        queryKey: ['summary'],
        queryFn: api.summary.get,
        refetchInterval: 12000,
        staleTime: 5000,
    });

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
            setAdminStatus(null);
        } catch (e) {
            setAdminStatus('❌ Hiba a törlés során!');
        }
    };

    if (isLoading && !data) {
        return <div className="p-10 text-center text-gray-500">Adatok betöltése...</div>;
    }

    if (!data) return null;

    return (
        <StepCard id="summary-step-card">
            <div id="summary-header-row" className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                <StepHeader
                    step="Élő Eredmények"
                    title={<>Közös <span id="summary-secret-admin-trigger" className="text-primary-dark" onClick={handleTitleClick}>tervezés</span></>}
                    description="Itt láthatod a csapat összesített döntéseit valós időben."
                    titleClassName="select-none cursor-default active:scale-95 transition-transform"
                />

                <div id="summary-nav-controls" className="flex gap-4 shrink-0">
                    <NavButton
                        id="summary-back-btn"
                        variant="outline"
                        icon={<ChevronLeft size={24} />}
                        onClick={() => navigate('/terv/program')}
                        title="Vissza"
                    />
                    <button
                        id="summary-manage-votes-btn"
                        onClick={() => setShowVoteModal(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-sm font-bold transition-all shadow-sm"
                    >
                        <Settings2 size={18} />
                        <span>Szavazataim</span>
                    </button>
                </div>
            </div>

            <div id="summary-ranking-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                {/* 1. Dátum Intervallumok */}
                <RankingSection
                    id="summary-ranking-dates"
                    title="Mikor menjünk?"
                    icon={<CalendarIcon size={20} />}
                    emptyText="Még senki nem választott teljes időszakot."
                    isEmpty={(data.topIntervals || []).length === 0}
                >
                    {(data.topIntervals || []).map((item, idx) => (
                        <RankingItem
                            key={idx}
                            title={`${format(new Date(item.start), 'MMM d.', { locale: hu })} - ${format(new Date(item.end), 'MMM d.', { locale: hu })}`}
                            count={item.count}
                            users={item.users}
                            isFirst={idx === 0}
                        />
                    ))}
                </RankingSection>

                {/* 2. Szavazási Rangsor (Kattintható) */}
                <RankingSection
                    id="summary-ranking-regions"
                    title="Hova menjünk?"
                    icon={<Trophy size={20} />}
                    emptyText="Még nem érkezett szavazat egyetlen régióra sem."
                    isEmpty={data.voteRanking.length === 0}
                >
                    {data.voteRanking.map((item, idx) => (
                        <RankingItem
                            key={item.regionId}
                            title={counties.find(r => r.id === item.regionId)?.name ?? item.regionId}
                            count={item.count}
                            users={item.voters}
                            isFirst={idx === 0}
                            onClick={() => {
                                onRegionSelect?.(item.regionId);
                                navigate('/terv/csomagok');
                            }}
                        />
                    ))}
                </RankingSection>
            </div>

            {/* 3. Felhasználók állapota (Csoportosítva) */}
            <DesignerStatus id="summary-designer-status" users={data.userStatuses} userProgress={data.userProgress} />

            {/* Lebegő akció gomb: Tovább tervezek */}
            {onContinue && (
                <div id="summary-fab-wrapper" className="fixed bottom-8 right-8 z-50 animate-bounce-slow">
                    <button
                        id="summary-continue-btn"
                        onClick={async () => {
                            // Piszkozat törlése a szerveren (Tiszta lap az új tervezéshez)
                            if (user) {
                                try {
                                    await api.progress.clear(user.id);
                                } catch (e) {
                                    console.error('Hiba a piszkozat törlésekor:', e);
                                }
                            }
                            onContinue?.(); // Opcionális hívás
                            navigate('/terv/idopont');
                        }}
                        className="bg-primary hover:bg-primary-dark text-gray-900 font-bold px-4 py-3 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 border-4 border-white whitespace-nowrap"
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
            />

            {/* ADMIN PANEL OVERLAY */}
            {adminMode && (
                <div id="summary-admin-overlay" className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                    <div id="summary-admin-panel" className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-4 border-red-500">
                        <div id="summary-admin-header" className="flex justify-between items-center mb-6">
                            <h2 id="summary-admin-title" className="text-2xl font-bold text-red-600 flex items-center gap-2">
                                🛠️ RENDSZERGAZDA
                            </h2>
                            <button
                                id="summary-admin-close-btn"
                                onClick={() => { setAdminMode(false); setAdminStatus(null); }}
                                className="text-gray-500 hover:text-gray-900 font-bold"
                            >
                                BEZÁRÁS
                            </button>
                        </div>

                        {adminStatus && (
                            <div id="summary-admin-status-msg" className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center font-bold text-gray-800">
                                {adminStatus}
                            </div>
                        )}

                        <div id="summary-admin-actions" className="space-y-4">
                            <button
                                id="summary-admin-reset-btn"
                                onClick={handleAdminReset}
                                className="w-full font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all bg-red-600 hover:bg-red-700 text-white hover:scale-105"
                            >
                                ☢️ ADATBÁZIS TÖRLÉS
                            </button>

                            <div id="summary-admin-user-list" className="border-t border-gray-200 pt-4 mt-4">
                                <h3 className="font-bold text-gray-700 mb-2">Felhasználók törlése:</h3>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {data?.userStatuses.map(u => (
                                        <div key={u.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="font-medium text-gray-800">{u.name} (ID: {u.id})</span>
                                            <button
                                                id={`summary-admin-delete-user-btn-${u.id}`}
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
