import { useState } from 'react';
import { ArrowRight, ChevronLeft, MapPin, Map } from 'lucide-react';
import { regions } from '../../data/mockData';

interface MapSelectionProps {
    selectedRegionId: string | undefined;
    onSelect: (regionId: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export function MapSelection({ selectedRegionId, onSelect, onNext, onBack }: MapSelectionProps) {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    const selectedRegionName = regions.find(r => r.id === selectedRegionId)?.name;

    const hoveredRegionData = regions.find(r => r.name === hoveredRegion);
    const tooltipStyle = hoveredRegionData ? {
        left: `${(hoveredRegionData.centerX / 800) * 100}%`,
        top: `${(hoveredRegionData.centerY / 450) * 100}%`
    } : {};

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row items-stretch">
            {/* Bal oldal */}
            <div className="flex-1 p-8 md:p-14 lg:p-16 flex flex-col justify-center border-b md:border-b-0 border-gray-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                        2. Lépés: Úti cél
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                    Válaszd ki az <br />
                    <span className="text-primary-dark">úti célt</span>
                </h1>

                <p className="text-gray-600 text-lg mb-10 leading-relaxed max-w-md">
                    Kattints arra a régióra a térképen, ahol szívesen eltöltenéd a hétvégét.
                </p>

                <div className="flex gap-4 items-center">
                    <button
                        className="p-4 rounded-2xl border border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all"
                        onClick={onBack}
                        title="Vissza"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        className="group bg-primary hover:bg-primary-dark text-background-dark font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        onClick={onNext}
                        disabled={!selectedRegionId}
                    >
                        Tovább
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Jobb oldal - Térkép */}
            <div className="md:w-5/12 bg-gray-50 p-8 md:p-10 flex flex-col items-center justify-center border-l border-gray-100">
                <div className="w-full max-w-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Map size={20} className="text-primary-dark" />
                            Magyarország régiói
                        </h2>
                    </div>

                    <div className="relative w-full flex items-center justify-center" style={{ aspectRatio: '1.6 / 1' }}>
                        <svg viewBox="0 0 800 450" className="w-full h-auto drop-shadow-sm">
                            {regions.map((region) => (
                                <g key={region.id}
                                    onClick={() => onSelect(region.id)}
                                    onMouseEnter={() => setHoveredRegion(region.name)}
                                    onMouseLeave={() => setHoveredRegion(null)}
                                >
                                    <path
                                        d={region.path}
                                        className={`region-path ${selectedRegionId === region.id ? 'selected' : ''}`}
                                    />
                                </g>
                            ))}
                        </svg>
                        {hoveredRegion && (
                            <div
                                className="absolute bg-background-dark text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none -translate-x-1/2 -translate-y-[150%]"
                                style={tooltipStyle}
                            >
                                {hoveredRegion}
                            </div>
                        )}
                    </div>

                    <div className="mt-12 pt-6 border-t border-gray-200 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary-dark">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-gray-900 text-xs font-bold uppercase tracking-tight">Kiválasztott terület</p>
                            <p className="text-gray-500 text-[10px]">
                                {selectedRegionName
                                    ? `${selectedRegionName} és környéke`
                                    : 'Nincs régió kiválasztva'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
