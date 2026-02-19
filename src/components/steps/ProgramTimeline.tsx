import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { NavButton } from '../common/NavButton';
import { StepHeader } from '../common/StepHeader';
import { InfoPill } from '../common/InfoPill';
import { useQuery } from '@tanstack/react-query';
import { hu } from 'date-fns/locale';
import { usePackages } from '../../hooks/usePackages';
import { packages as packagesMock, counties } from '../../data/mockData';
import { useUser } from '../../context/UserContext';
import { api, type VoteBlock } from '../../api/client';
import { ChevronLeft, ArrowRight, ChevronDown, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormattedText } from '../common/FormattedText';
import ImageGallery from '../common/ImageGallery';

interface ProgramTimelineProps {
    regionId: string | undefined;
    packageId: string | undefined;
    dates: Date[] | undefined;
}

export function ProgramTimeline({ regionId, packageId, dates }: ProgramTimelineProps) {
    const navigate = useNavigate();
    const { user } = useUser();

    // API adatok betöltése
    const { packages: apiPackages, isLoading } = usePackages();

    const [activeDay, setActiveDay] = useState(1);
    const [galleryData, setGalleryData] = useState<{ images: string[], index: number } | null>(null);

    // Adatok egyesítése és származtatása
    const allPackages = [...apiPackages, ...packagesMock].filter((p, index, self) =>
        index === self.findIndex((t) => (
            t.id === p.id
        ))
    );
    const selectedPackage = allPackages.find(p => p.id === packageId);
    const county = counties.find(c => c.id === regionId);
    const sortedDates = dates ? [...dates].sort((a, b) => a.getTime() - b.getTime()) : [];

    // User votes hook
    const { data: userVotes = [] } = useQuery<VoteBlock[]>({
        queryKey: ['userVotes', user?.id],
        queryFn: () => user ? api.votes.list(user.id) : Promise.resolve([]),
        enabled: !!user,
    });

    // ── EFFECTS (Feltételes visszatérések ELŐTT) ──

    // Redirect if no package selected
    useEffect(() => {
        if (!packageId) {
            navigate('/terv/csomagok');
        }
    }, [packageId, navigate]);

    // Debug naplózás
    useEffect(() => {
        if (selectedPackage) {
            console.group('ProgramTimeline Debug');
            console.log('Selected Package ID:', packageId);
            console.log('Package Title:', selectedPackage.title);
            console.log('API version:', apiPackages.find(p => p.id === packageId) ? 'YES' : 'NO (Using Mock)');
            console.groupEnd();
        }
    }, [selectedPackage, packageId, apiPackages]);

    // ── EVENT HANDLERS ──

    const hasAnyVote = userVotes.length > 0;

    const handleVote = () => {
        navigate('/terv/idopont');
    };

    // ── EARLY RETURNS ──

    if (isLoading && !selectedPackage) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-500">Programterv betöltése...</p>
            </div>
        );
    }

    if (!selectedPackage) return null;

    // Alapértelmezett napnevek, ha még nincs választva dátum, vagy nem teljes a 3 nap
    const defaultDayNames = ['Péntek', 'Szombat', 'Vasárnap'];
    const dayNames = sortedDates.length === 3
        ? sortedDates.map(d => format(d, 'EEEE', { locale: hu }))
        : defaultDayNames;

    const dateRangeLabel = sortedDates.length >= 2
        ? `${format(sortedDates[0], 'yyyy. MMMM d.', { locale: hu })} – ${format(sortedDates[sortedDates.length - 1], 'd.', { locale: hu })}`
        : 'Időpont választása a szavazásnál';

    const SidebarInfo = (
        <div id="program-timeline-sidebar-info" className="flex flex-col relative w-full">
            {/* Fejléc */}
            <StepHeader
                step="3. Lépés: Programok"
                title={<div className="flex flex-col">
                    <div id="program-timeline-county-badge-wrapper" className="flex items-center justify-start md:justify-center lg:justify-start mb-2">
                        <span id="program-timeline-county-badge" className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase tracking-wider">
                            {county?.name}
                        </span>
                    </div>
                    <div className="flex justify-between items-start gap-4 w-full">
                        <span className="text-left md:text-center lg:text-left leading-tight">{selectedPackage.title}</span>
                    </div>
                </div>}
                description="programterv"
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
                <span id="program-timeline-cost-label" className="text-gray-500 text-sm block mb-1">Várható szállásköltség</span>
                <div id="program-timeline-cost-amount-wrapper" className="flex items-baseline gap-2">
                    <span id="program-timeline-cost-value" className="text-3xl font-bold text-gray-900">{selectedPackage.estimatedCost}</span>
                    <span id="program-timeline-cost-currency" className="text-gray-600 font-semibold">Ft</span>
                </div>
            </div>

            {/* Akció gombok */}
            <div id="program-timeline-actions-wrapper" className="space-y-3 mb-4">
                <button
                    id="program-timeline-vote-btn"
                    onClick={handleVote}
                    className="w-full h-14 font-black rounded-xl transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white text-xl shadow-lg shadow-primary/30 active:scale-95"
                >
                    Szavazok!
                </button>

                <button
                    id="program-timeline-results-btn"
                    onClick={() => navigate('/terv/osszegzes')}
                    className="w-full bg-white border-2 border-gray-100 hover:border-primary/50 text-gray-600 hover:text-primary-dark font-bold text-lg px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    Eredmények
                </button>
            </div>

            <p id="program-timeline-vote-disclaimer" className="mt-2 text-[11px] text-gray-400 text-center leading-relaxed px-4">
                A következő lépésben választhatod ki a pontos időpontot a szavazat véglegesítéséhez.
            </p>
        </div>
    );

    return (
        <>
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
                    <div id="program-timeline-tabs-row" className="flex bg-white lg:pr-40">
                        <div id="program-timeline-tabs-inner" className="flex flex-1 border-b border-gray-200">
                            {[1, 2, 3].map((dayIndex) => {
                                const isActive = activeDay === dayIndex;
                                const idx = dayIndex;
                                const dayName = (dayNames[dayIndex - 1] || `${dayIndex}. nap`).toUpperCase();
                                return (
                                    <button
                                        key={dayIndex}
                                        id={`program-day-tab-btn-${idx}`}
                                        onClick={() => setActiveDay(dayIndex)}
                                        className={`flex-1 py-6 px-4 text-center border-b-4 transition-all -mb-[4px] ${isActive
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
                    </div>

                    {/* TIMELINE TARTALOM */}
                    <div id="program-timeline-items-scroll" className="flex-1 p-[15px] min-[440px]:p-8 md:p-12 lg:p-12 overflow-y-auto bg-white">
                        <div id="program-timeline-items-wrapper" className="max-w-2xl mx-auto lg:mx-0 relative timeline-line space-y-12">
                            {selectedPackage.days.find(d => d.dayIndex === activeDay)?.items.map((item) => (
                                <div key={item.id} id={`program-timeline-item-${item.id}`} className="relative z-10 flex gap-8 items-start group">
                                    <div id="program-timeline-item-icon-box" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-110">
                                        <span className={`text-zinc-900 !text-[18px] select-none flex items-center justify-center w-full h-full ${!/^[^\x00-\x7F]+$/.test(item.icon) && item.icon.length > 2 ? 'material-icons-outlined' : ''}`}>
                                            {item.icon}
                                        </span>
                                    </div>
                                    <div id="program-timeline-item-content" className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                            <span id="program-timeline-item-time" className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                                                {item.time}
                                            </span>
                                            <span id="program-timeline-item-category" className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 id="program-timeline-item-title" className="text-xl font-bold text-gray-900 leading-tight">
                                                {item.title}
                                            </h3>
                                            {item.marketingLabel && (
                                                <span id="program-timeline-item-marketing-badge" className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-tighter rounded border border-amber-200 shrink-0">
                                                    {item.marketingLabel}
                                                </span>
                                            )}
                                        </div>
                                        <FormattedText
                                            id="program-timeline-item-description"
                                            className="text-gray-600 leading-relaxed"
                                            text={item.description}
                                        />

                                        {/* Képgaléria megjelenítése */}
                                        {item.galleryImages && item.galleryImages.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {item.galleryImages.map((img, imgIdx) => (
                                                    <div
                                                        key={imgIdx}
                                                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shadow-sm transition-transform hover:scale-105 cursor-zoom-in"
                                                        onClick={() => setGalleryData({ images: item.galleryImages!, index: imgIdx })}
                                                    >
                                                        <img src={img} alt={`${item.title} - ${imgIdx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Megjegyzés Accordion */}
                                        {item.notes && (
                                            <div className="mt-4">
                                                <ProgramNote content={item.notes} />
                                            </div>
                                        )}
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

            {/* KÉPGALÉRIA - NAVIGÁLHATÓ LIGHTBOX */}
            <ImageGallery
                images={galleryData?.images || []}
                initialIndex={galleryData?.index || 0}
                isOpen={!!galleryData}
                onClose={() => setGalleryData(null)}
            />
        </>
    );
}

// Belső komponens a Megjegyzés Accordionhoz
function ProgramNote({ content }: { content: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div id="program-note-wrapper" className="border border-blue-100 rounded-xl overflow-hidden bg-blue-50/30">
            <button
                id="program-note-trigger"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-blue-700 hover:bg-blue-50 transition-colors group"
            >
                <div className="flex items-center gap-2">
                    <Lightbulb size={16} className="text-blue-500 group-hover:animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Hasznos információk</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="program-note-content-motion"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <FormattedText
                            id="program-note-text"
                            className="px-4 pb-4 pt-3 text-sm text-blue-900/80 leading-relaxed border-t border-blue-100/50"
                            text={content}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
