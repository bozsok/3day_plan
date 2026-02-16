import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { hu } from 'date-fns/locale';
import { NavButton } from '../common/NavButton';
import { StepHeader } from '../common/StepHeader';
import { StepCard } from '../common/StepCard';
import { usePackages } from '../../hooks/usePackages';
import { api } from '../../api/client';
import { useUser } from '../../context/UserContext';
import { counties, packages as packagesMock } from '../../data/mockData';
import { Trophy, Calendar as CalendarIcon, ArrowRight, ChevronLeft } from 'lucide-react';
import { VoteManagementModal } from '../modals/VoteManagementModal';
import { RankingSection } from '../summary/RankingSection';
import { RankingCard } from '../summary/RankingCard';
import { DesignerStatus } from '../summary/DesignerStatus';
import { SummaryAdminModal } from '../modals/SummaryAdminModal';

interface SummaryData {
    topIntervals: { start: string; end: string; count: number; users: string[] }[];
    voteRanking: { regionId: string; count: number; voters: string[] }[];
    userStatuses: { id: number; name: string }[];
    userProgress: Record<number, { hasDates: boolean, regionId: string | null, packageId: string | null, lastActive: number }>;
    detailedVotes: { id: number; userId: number; userName: string; dates: string[]; regionId?: string; packageId?: string; timestamp: number }[];
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

    const { packages: apiPackages } = usePackages();

    // Adatok összefésülése a Summary-hoz is, hogy a nevek (UUID helyett) megjelenjenek
    const allPackages = [...apiPackages, ...packagesMock].filter((p, index, self) =>
        index === self.findIndex((t) => (
            t.id === p.id
        ))
    );

    // TanStack Query: Összegzés adatok lekérése és polling
    const { data, isLoading, refetch } = useQuery<SummaryData>({
        queryKey: ['summary'],
        queryFn: api.summary.get,
        refetchInterval: 2000,
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
            refetch(); // Azonnali frissítés
            setTimeout(() => setAdminStatus(null), 3000);
        } catch (e) {
            setAdminStatus('❌ Hiba a törlés során!');
        }
    };

    if (isLoading && !data) {
        return <div className="p-10 text-center text-gray-500">Adatok betöltése...</div>;
    }

    if (!data) return null;

    return (
        <>
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

                        {onContinue && (
                            <button
                                id="summary-continue-header-btn"
                                onClick={async () => {
                                    if (user) {
                                        try {
                                            await api.progress.clear(user.id);
                                        } catch (e) {
                                            console.error('Hiba a piszkozat törlésekor:', e);
                                        }
                                    }
                                    onContinue?.();
                                    navigate('/terv/helyszin');
                                }}
                                className="flex items-center gap-2 px-6 py-4 bg-primary hover:bg-primary-dark text-gray-900 rounded-2xl text-base font-black uppercase tracking-tight transition-all shadow-sm hover:scale-105"
                            >
                                <CalendarIcon size={18} />
                                <span>Tervezek</span>
                                <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div id="summary-ranking-container" className="flex flex-col gap-8 mb-12">
                    {/* 1. Dátum Intervallumok (Mikor menjünk?) */}
                    <RankingSection
                        id="summary-ranking-dates"
                        title="Mikor menjünk?"
                        icon={<CalendarIcon size={20} />}
                        emptyText="Még senki nem választott teljes időszakot."
                        isEmpty={(data.topIntervals || []).length === 0}
                    >
                        {(data.topIntervals || []).map((item, idx) => (
                            <RankingCard
                                key={idx}
                                id={`ranking-card-date-${idx}`}
                                variant="date"
                                title={(() => {
                                    const startDate = new Date(item.start);
                                    const endDate = new Date(item.end);
                                    if (startDate.getMonth() === endDate.getMonth()) {
                                        return `${format(startDate, 'MMM d', { locale: hu })}-${format(endDate, 'd.', { locale: hu })}`;
                                    }
                                    return `${format(startDate, 'MMM d.', { locale: hu })} - ${format(endDate, 'MMM d.', { locale: hu })}`;
                                })()}
                                count={item.count}
                                users={item.users}
                                isFirst={idx === 0}
                            />
                        ))}
                    </RankingSection>

                    {/* 2. Helyszín Rangsor (Hova menjünk?) */}
                    <RankingSection
                        id="summary-ranking-regions"
                        title="Hova menjünk?"
                        icon={<Trophy size={20} />}
                        emptyText="Még nem érkezett szavazat egyetlen régióra sem."
                        isEmpty={data.voteRanking.length === 0}
                    >
                        {data.voteRanking.map((item, idx) => {
                            const county = counties.find(c => c.id === item.regionId);
                            const regionName = county?.name ?? item.regionId;

                            // Megkeressük az első csomagot ehhez a régióhoz, hogy kinyerjük a képet, leírást és tageket
                            // Itt már az allPackages-ben keresünk, így megtalálja az újakat is
                            const relatedPackage = allPackages.find(p => p.countyId === item.regionId);

                            const regionImage = relatedPackage?.imageUrl
                                || `https://placehold.co/600x400/EEE/31343C/png?text=${encodeURIComponent(regionName)}`;

                            return (
                                <RankingCard
                                    key={item.regionId}
                                    id={`ranking-card-location-${item.regionId}`}
                                    variant="location"
                                    title={regionName}
                                    description={relatedPackage?.description || county?.description}
                                    count={item.count}
                                    users={item.voters}
                                    imageUrl={regionImage}
                                    isFirst={idx === 0}
                                    tags={relatedPackage?.tags}
                                    onClick={() => {
                                        onRegionSelect?.(item.regionId);
                                        navigate('/terv/csomagok');
                                    }}
                                />
                            );
                        })}
                    </RankingSection>
                </div>

                {/* 3. Felhasználók állapota */}
                <DesignerStatus
                    id="summary-designer-status"
                    users={data.userStatuses}
                    userProgress={data.userProgress}
                    detailedVotes={data.detailedVotes || []}
                    onManageVotes={() => setShowVoteModal(true)}
                    allPackages={allPackages} // Átadjuk az egyesített listát
                />
            </StepCard>

            {/* MODALS & OVERLAYS (Moved outside StepCard to cover browser viewport) */}
            <VoteManagementModal
                isOpen={showVoteModal}
                onClose={() => setShowVoteModal(false)}
            />

            {/* ADMIN PANEL OVERLAY */}
            {/* ADMIN PANEL OVERLAY (Portal-based) */}
            <SummaryAdminModal
                isOpen={adminMode}
                onClose={() => { setAdminMode(false); setAdminStatus(null); }}
                onReset={handleAdminReset}
                onDeleteVote={async (userId) => {
                    try {
                        await api.admin.resetUserVote(userId);
                        setAdminStatus(`✅ Szavazat visszavonva (User ID: ${userId})`);
                        refetch(); // Azonnali frissítés
                        setTimeout(() => setAdminStatus(null), 3000);
                    } catch (e) {
                        setAdminStatus('❌ Hiba a szavazat törlésekor!');
                    }
                }}
                onDeleteUser={handleAdminDeleteUser}
                adminStatus={adminStatus}
                detailedVotes={data.detailedVotes || []}
                userStatuses={data.userStatuses || []}
                allPackages={allPackages}
                counties={counties}
            />
        </>
    );
}
