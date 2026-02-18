import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavButton } from '../common/NavButton';
import { StepHeader } from '../common/StepHeader';
import { InfoPill } from '../common/InfoPill';
import { ArrowRight, ChevronLeft, MapPin, Map as MapIcon, Search, X } from 'lucide-react';
import { counties, packages } from '../../data/mockData';
import { HungaryMap } from '../common/HungaryMap';
import { StepCard } from '../common/StepCard';
import { useUser } from '../../context/UserContext';
import { api } from '../../api/client';
import { AnimatePresence, motion } from 'framer-motion';

interface MapSelectionProps {
    selectedRegionId: string | undefined;
    onSelect: (regionId: string | undefined) => void;
}

type SearchResult = {
    type: 'county' | 'package';
    id: string;
    name: string;
    secondary?: string;
    countyId: string;
};

export function MapSelection({ selectedRegionId, onSelect }: MapSelectionProps) {
    const navigate = useNavigate();
    const { user } = useUser();
    const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const selectedCounty = counties.find(c => c.id === selectedRegionId);
    const hoveredCounty = counties.find(c => c.id === hoveredRegionId);

    // Keresési logika
    const results = useMemo(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) return [];

        const query = searchQuery.toLowerCase();
        const found: SearchResult[] = [];

        // 1. Megyék és tájegységek keresése
        counties.forEach(c => {
            if (c.name.toLowerCase().includes(query) ||
                c.description.toLowerCase().includes(query) ||
                c.regionId.toLowerCase().includes(query)) {
                found.push({
                    type: 'county',
                    id: c.id,
                    name: c.name,
                    secondary: c.description,
                    countyId: c.id
                });
            }
        });

        // 2. Csomagok (városok, kulcsszavak) keresése
        packages.forEach(p => {
            if (p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.tags.some(t => t.label.toLowerCase().includes(query))) {
                const county = counties.find(c => c.id === p.countyId);
                found.push({
                    type: 'package',
                    id: p.id,
                    name: p.title,
                    secondary: county?.name,
                    countyId: p.countyId
                });
            }
        });

        return found.slice(0, 6); // Limit 6 találat
    }, [searchQuery]);

    // Kattintás kívülre -> bezárás
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectResult = (result: SearchResult) => {
        if (result.type === 'package') {
            // Ha csomag, akkor mentjük a megyét, kiválasztjuk a csomagot és megyünk tovább
            localStorage.setItem('3nap_selected_package', result.id);
            onSelect(result.countyId);
            if (user) {
                api.progress.update(user.id, { regionId: result.countyId, packageId: result.id }).catch(() => { });
            }
            navigate('/terv/csomagok');
        } else {
            // Ha csak megye, akkor kijelöljük a térképen
            onSelect(result.countyId);
            setIsSearchFocused(false);
            setSearchQuery('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && results.length > 0) {
            handleSelectResult(results[0]);
        }
    };

    // A tooltip szöveg: hover > kijelölés > semmi
    const displayCounty = hoveredCounty || selectedCounty;

    return (
        <StepCard id="region-selection-step-card" noPadding className="flex flex-col md:flex-row items-stretch overflow-hidden">
            {/* Bal oldal */}
            <div id="region-selection-content-left" className="flex-1 p-[15px] min-[440px]:p-8 md:p-12 flex flex-col justify-center items-start text-left">
                <StepHeader
                    step="1. Lépés: Úti cél"
                    title={<>Válaszd ki az <br /><span className="text-primary-dark">úti célt</span></>}
                    description="Kattints arra a régióra a térképen, vagy használd a keresőt a gyorsabb navigációhoz."
                />

                <div id="region-selection-nav-container" className="flex gap-4 items-center mt-4">
                    <NavButton
                        id="region-selection-back-btn"
                        variant="outline"
                        icon={<ChevronLeft size={24} />}
                        onClick={() => navigate('/')}
                        title="Vissza"
                    />
                    <button
                        id="region-selection-next-btn"
                        className="group bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg px-8 h-14 rounded-2xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        onClick={async () => {
                            if (selectedRegionId && user) {
                                try {
                                    await api.progress.update(user.id, { regionId: selectedRegionId });
                                } catch (e) {
                                    console.error('Hiba a régió szinkronizálásakor:', e);
                                }
                            }
                            navigate('/terv/csomagok');
                        }}
                        disabled={!selectedRegionId}
                    >
                        Tovább
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Jobb oldal — Térkép */}
            <div id="region-selection-content-right" className="md:w-5/12 bg-gray-50 p-[15px] min-[440px]:p-8 md:p-12 flex items-center justify-center border-l border-gray-100">
                <div id="region-selection-map-wrapper" className="w-full relative">
                    {/* Keresőmező */}
                    <div ref={searchRef} className="relative mb-6 z-50">
                        <div className={`flex items-center gap-3 bg-white px-4 h-12 rounded-xl shadow-sm border transition-all ${isSearchFocused ? 'border-primary ring-2 ring-primary/10' : 'border-gray-200'}`}>
                            <Search size={20} className={isSearchFocused ? 'text-primary' : 'text-gray-400'} />
                            <input
                                type="text"
                                placeholder="Város, megye vagy program..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onKeyDown={handleKeyDown}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Találati lista Overlay */}
                        <AnimatePresence>
                            {isSearchFocused && searchQuery.length >= 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                >
                                    {results.length > 0 ? (
                                        <div className="py-2">
                                            {results.map((res) => (
                                                <button
                                                    key={`${res.type}-${res.id}`}
                                                    onClick={() => handleSelectResult(res)}
                                                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 text-left transition-colors"
                                                >
                                                    <div className={`mt-0.5 p-1.5 rounded-lg ${res.type === 'package' ? 'bg-blue-50 text-blue-600' : 'bg-primary-50 text-primary'}`}>
                                                        {res.type === 'package' ? <MapIcon size={16} /> : <MapPin size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{res.name}</div>
                                                        <div className="text-xs text-gray-500">{res.secondary}</div>
                                                    </div>
                                                </button>
                                            ))}
                                            <div className="px-4 py-2 bg-gray-50 text-[10px] uppercase tracking-wider font-bold text-gray-400 border-t border-gray-100">
                                                Nyomj Enter-t az első találathoz
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="text-gray-400 mb-1 font-bold">Nincs találat</div>
                                            <div className="text-xs text-gray-500">Próbálj más tájegységet vagy várost!</div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div id="region-selection-map-header" className="flex items-center justify-between mb-6">
                        <h2 id="region-selection-map-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapIcon size={20} className="text-primary-dark" />
                            Tájegységek és megyék
                        </h2>
                    </div>

                    {/* Interaktív térkép */}
                    <HungaryMap
                        selectedRegionId={selectedRegionId}
                        hoveredRegionId={hoveredRegionId}
                        onRegionClick={(id) => {
                            if (selectedRegionId === id) {
                                onSelect(undefined);
                            } else {
                                onSelect(id);
                            }
                        }}
                        onRegionHover={setHoveredRegionId}
                    />

                    {/* Kiválasztott/hovered megye info */}
                    <div id="region-info-box" className="mt-6 pt-6 border-t border-gray-200">
                        <InfoPill
                            variant={selectedRegionId ? 'primary' : 'none'}
                            icon={<MapPin size={20} />}
                            label={displayCounty ? displayCounty.name : 'Kiválasztott terület'}
                            value={displayCounty ? displayCounty.description : 'Kattints a térképre!'}
                        />
                    </div>
                </div>
            </div>
        </StepCard>
    );
}
