import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { packages } from '../../data/mockData';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { StepCard } from '../common/StepCard';

interface PackageSelectionProps {
    regionId: string | undefined;
    onSelect: (packageId: string) => void;
    selectedPackageId?: string;
}

export function PackageSelection({ regionId, onSelect, selectedPackageId }: PackageSelectionProps) {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('Összes');

    // Filter packages by county (passed as regionId prop from App.tsx)
    const availablePackages = packages.filter(p => p.countyId === regionId);

    const filters = ['Összes', 'Aktív kikapcsolódás', 'Gasztronómia', 'Családi', 'Romantikus', 'Wellness'];

    return (
        <StepCard className="animate-fade-in" padding="p-[15px] min-[440px]:p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 w-fit">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                            3. Lépés: Csomagok
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                        Válaszd ki a <span className="text-primary-dark">kalandod</span>!
                    </h1>

                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                        Válassz egyet az előre összeállított, izgalmas programcsomagjaink közül.
                    </p>
                </div>

                <div className="flex gap-4 shrink-0">
                    <button
                        className="p-4 rounded-2xl border border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all"
                        onClick={() => navigate('/terv/helyszin')}
                        title="Vissza"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    {selectedPackageId && (
                        <button
                            className="p-4 rounded-2xl bg-primary hover:bg-primary-dark text-gray-900 transition-all shadow-lg hover:shadow-primary/30"
                            onClick={() => navigate('/terv/program')}
                            title="Tovább"
                        >
                            <ArrowRight size={24} />
                        </button>
                    )}
                </div>
            </div>

            {/* Szűrők */}
            <div className="hidden md:flex flex-wrap gap-4 mb-10 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border whitespace-nowrap ${filter === f
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
                            onClick={() => navigate('/terv/helyszin')}
                            className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-600"
                        >
                            Válassz másik megyét
                        </button>
                    </div>
                ) : (
                    availablePackages.map(pkg => (
                        <div
                            key={pkg.id}
                            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row cursor-pointer"
                            onClick={() => {
                                onSelect(pkg.id);
                                navigate('/terv/program');
                            }}
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
                                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
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
                                            navigate('/terv/program');
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
