import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavButton } from '../common/NavButton';
import { StepHeader } from '../common/StepHeader';
import { InfoPill } from '../common/InfoPill';
import { ArrowRight, ChevronLeft, MapPin, Map as MapIcon } from 'lucide-react';
import { counties } from '../../data/mockData';
import { HungaryMap } from '../common/HungaryMap';
import { StepCard } from '../common/StepCard';

interface MapSelectionProps {
    selectedRegionId: string | undefined;
    onSelect: (regionId: string | undefined) => void;
}

export function MapSelection({ selectedRegionId, onSelect }: MapSelectionProps) {
    const navigate = useNavigate();
    const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

    const selectedCounty = counties.find(c => c.id === selectedRegionId);
    const hoveredCounty = counties.find(c => c.id === hoveredRegionId);

    // A tooltip szöveg: hover > kijelölés > semmi
    const displayCounty = hoveredCounty || selectedCounty;

    return (
        <StepCard noPadding className="flex flex-col md:flex-row items-stretch overflow-hidden">
            {/* Bal oldal */}
            <div className="flex-1 p-[15px] min-[440px]:p-8 md:p-12 flex flex-col justify-center items-start text-left">
                <StepHeader
                    step="2. Lépés: Úti cél"
                    title={<>Válaszd ki az <br /><span className="text-primary-dark">úti célt</span></>}
                    description="Kattints arra a régióra a térképen, ahol szívesen eltöltenéd a hétvégét."
                />

                <div className="flex gap-4 items-center">
                    <NavButton
                        variant="outline"
                        icon={<ChevronLeft size={24} />}
                        onClick={() => navigate('/terv/idopont')}
                        title="Vissza"
                    />
                    <button
                        className="group bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        onClick={() => navigate('/terv/csomagok')}
                        disabled={!selectedRegionId}
                    >
                        Tovább
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Jobb oldal — Térkép */}
            <div className="md:w-5/12 bg-gray-50 p-[15px] min-[440px]:p-8 md:p-10 flex flex-col items-center justify-center border-l border-gray-100">
                <div className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapIcon size={20} className="text-primary-dark" />
                            Tájegységek és megyék
                        </h2>
                    </div>

                    {/* Interaktív térkép */}
                    <HungaryMap
                        selectedRegionId={selectedRegionId}
                        hoveredRegionId={hoveredRegionId}
                        onRegionClick={(id) => {
                            // Toggle logika: ha ugyanarra kattintunk, töröljük a kijelölést
                            if (selectedRegionId === id) {
                                onSelect(undefined);
                            } else {
                                onSelect(id);
                            }
                        }}
                        onRegionHover={setHoveredRegionId}
                    />

                    {/* Kiválasztott/hovered megye info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
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
