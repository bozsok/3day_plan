import { useState } from 'react';
import { packages } from '../../data/mockData';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { StepCard } from '../common/StepCard';

interface PackageSelectionProps {
    regionId: string | undefined;
    onSelect: (packageId: string) => void;
    onBack: () => void;
    onNext?: () => void;
    selectedPackageId?: string;
}

export function PackageSelection({ regionId, onSelect, onBack, onNext, selectedPackageId }: PackageSelectionProps) {
    const [filter, setFilter] = useState('Összes');

    // Filter packages by county (passed as regionId prop from App.tsx)
    const availablePackages = packages.filter(p => p.countyId === regionId);

    const filters = ['Összes', 'Aktív kikapcsolódás', 'Gasztronómia', 'Családi', 'Romantikus', 'Wellness'];

    return (
        <StepCard className="animate-fade-in" padding="p-[15px] min-[440px]:p-8 md:p-12">
            {/* Vissza gomb */}
            <button
                onClick={onBack}
                className="absolute top-4 left-4 min-[440px]:top-8 md:top-12 min-[440px]:left-8 md:left-12 group hover:scale-105 transition-transform z-10"
            >
                <div
                    className="flex items-center justify-center w-10 h-10 min-[440px]:w-12 min-[440px]:h-12 md:w-14 md:h-14 rounded-2xl border border-gray-200 text-gray-400 group-hover:border-gray-900 group-hover:text-gray-900 transition-all"
                >
                    <ChevronLeft size={24} />
                </div>
            </button>

            {/* Tovább gomb (Csak ha van kiválasztott csomag) */}
            {selectedPackageId && onNext && (
                <button
                    onClick={onNext}
                    className="absolute top-4 right-4 min-[440px]:top-8 md:top-12 min-[440px]:right-8 md:right-12 group hover:scale-105 transition-transform z-10"
                >
                    <div
                        className="flex items-center justify-center w-10 h-10 min-[440px]:w-12 min-[440px]:h-12 md:w-14 md:h-14 rounded-2xl border border-gray-200 text-gray-400 group-hover:border-gray-900 group-hover:text-gray-900 transition-all"
                    >
                        <ChevronRight size={24} />
                    </div>
                </button>
            )}


            {/* Címke - Abszolút pozicionálás minden nézeten */}
            <div className="absolute top-4 min-[440px]:top-8 md:top-12 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 z-10 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                    3. Lépés: Csomagok
                </span>
            </div>

            <div className="text-center mb-10 mt-20">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Válaszd ki a <span className="text-primary-dark">kalandod</span>
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                    Gondosan összeállított 3 napos útiterv-csomagok ebben a megyében.
                </p>
            </div>

            {/* Szűrők */}
            <div className="hidden md:flex flex-wrap justify-center gap-3 mb-12">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border ${filter === f
                            ? 'bg-primary text-gray-900 border-primary'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Csomag kártyák */}
            <div className="space-y-6">
                {availablePackages.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>Ehhez a megyéhez jelenleg nem tartozik elérhető csomag.</p>
                        <button
                            onClick={onBack}
                            className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-600"
                        >
                            Válassz másik megyét
                        </button>
                    </div>
                ) : (
                    availablePackages.map(pkg => (
                        <div
                            key={pkg.id}
                            className="group bg-white rounded-2xl min-[440px]:rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row cursor-pointer"
                            onClick={() => onSelect(pkg.id)}
                        >
                            {/* Kép */}
                            <div className="md:w-80 h-48 md:h-auto relative shrink-0 overflow-hidden">
                                <img
                                    src={pkg.imageUrl}
                                    alt={pkg.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>

                            {/* Tartalom */}
                            <div className="flex-1 p-5 md:p-6 flex flex-col justify-between min-w-0">
                                <div>
                                    <div className="flex justify-between items-start mb-3 gap-4">
                                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                            {pkg.title}
                                        </h2>
                                        <span className="text-xs font-bold bg-primary/10 text-gray-800 px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0">
                                            3 Nap / 2 Éj
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                        {pkg.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                                    <div className="flex gap-1.5">
                                        {pkg.tags.map((tag, idx) => (
                                            <div key={idx} className="flex items-center gap-1 text-gray-500 shrink-0">
                                                <span className="material-icons-outlined text-primary text-xl">
                                                    {tag.icon}
                                                </span>
                                                <span className="text-xs font-semibold hidden lg:inline whitespace-nowrap">
                                                    {tag.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(pkg.id);
                                        }}
                                        className="bg-primary hover:bg-primary-dark text-gray-900 font-bold px-4 py-2 rounded-xl transition-all text-sm flex items-center gap-2 shadow-sm hover:shadow-md shrink-0 ml-2"
                                    >
                                        Kiválasztás
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </StepCard>
    );
}
