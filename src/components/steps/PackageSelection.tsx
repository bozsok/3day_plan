import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePackages } from '../../hooks/usePackages';
import { NavButton } from '../common/NavButton';
import { StepHeader } from '../common/StepHeader';
import { ArrowRight, ChevronLeft, Flag, Palmtree, Sun, Mountain, Trees, Waves, Wine, Utensils, Footprints, Landmark, Castle, Ship, Star } from 'lucide-react';
import { StepCard } from '../common/StepCard';
import { useUser } from '../../context/UserContext';
import { api } from '../../api/client';
import { FormattedText } from '../common/FormattedText';

interface PackageSelectionProps {
    regionId: string | undefined;
    onSelect: (packageId: string) => void;
    selectedPackageId?: string;
}

// Segédfüggvény a Material icon nevek Lucide-re fordításához
const getLucideIcon = (iconName: string, size: number = 14) => {
    const iconProps = { size, className: "shrink-0" };

    // Ha emoji (vagy nem a predefined kulcsszavak egyike, és rövid string), akkor rendereljük szövegként
    // Egyszerű ellenőrzés: ha nem csak angol kisbetűk vannak benne, vagy tartalmaz nem-ASCII karaktert
    if (/[^\x00-\x7F]+/.test(iconName) || iconName.length <= 2) {
        return <span style={{ fontSize: size, lineHeight: 1 }}>{iconName}</span>;
    }

    switch (iconName) {
        case 'flag': return <Flag {...iconProps} />;
        case 'spa': return <Palmtree {...iconProps} />;
        case 'wb_sunny': return <Sun {...iconProps} />;
        case 'hiking': return <Mountain {...iconProps} />;
        case 'trees':
        case 'nature': return <Trees {...iconProps} />;
        case 'waves': return <Waves {...iconProps} />;
        case 'wine_bar': return <Wine {...iconProps} />;
        case 'restaurant': return <Utensils {...iconProps} />;
        case 'directions_walk':
        case 'trail': return <Footprints {...iconProps} />;
        case 'museum':
        case 'account_balance': return <Landmark {...iconProps} />;
        case 'castle': return <Castle {...iconProps} />;
        case 'directions_boat': return <Ship {...iconProps} />;
        default: return <Star {...iconProps} />;
    }
};

export function PackageSelection({ regionId, onSelect, selectedPackageId }: PackageSelectionProps) {
    const navigate = useNavigate();
    const { user } = useUser();
    const [filter, setFilter] = useState('Összes');

    // API adatok betöltése
    const { packages: apiPackages, isLoading } = usePackages();

    // Modosítva: Csak az API-ból jövő csomagokat használjuk, nem keverjük a mock adatokkal.
    // Így ha az admin töröl mindent, akkor üres lista jelenik meg, nem a "szellem" mock adatok.
    const allPackages = apiPackages;

    // Filter packages by county (passed as regionId prop from App.tsx)
    const availablePackages = allPackages.filter(p => p.countyId === regionId);

    const filters = ['Összes', 'Aktív kikapcsolódás', 'Gasztronómia', 'Családi', 'Romantikus', 'Wellness'];

    return (
        <StepCard id="package-selection-step-card" className="animate-fade-in" padding="p-[15px] min-[440px]:p-8 md:p-12">
            <div id="package-selection-header-row" className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                <StepHeader
                    step="2. Lépés: Csomagok"
                    title={<>Válaszd ki a <span className="text-primary-dark">kalandod</span>!</>}
                    description="Válassz egyet az előre összeállított, izgalmas programcsomagok közül."
                />

                <div id="package-selection-nav-controls" className="flex gap-4 shrink-0">
                    <NavButton
                        id="package-selection-back-btn"
                        variant="outline"
                        icon={<ChevronLeft size={24} />}
                        onClick={() => navigate('/terv/helyszin')}
                        title="Vissza"
                    />
                    <NavButton
                        id="package-selection-next-btn"
                        variant="primary"
                        icon={<ArrowRight size={24} />}
                        onClick={async () => {
                            if (user && selectedPackageId) {
                                await api.progress.update(user.id, { packageId: selectedPackageId });
                            }
                            navigate('/terv/program');
                        }}
                        disabled={!selectedPackageId}
                        title="Tovább"
                    />
                </div>
            </div>

            {/* Szűrők */}
            <div id="package-selection-filter-bar" className="hidden md:flex flex-wrap gap-4 mb-10 overflow-x-auto pt-1 pb-4 md:pb-0 scrollbar-hide">
                {filters.map(f => (
                    <button
                        key={f}
                        id={`package-selection-filter-btn-${f.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all border whitespace-nowrap ${filter === f
                            ? 'bg-primary text-gray-900 border-primary'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Loading / Csomag kártyák */}
            <div id="package-selection-cards-list" className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-gray-500">Csomagok betöltése...</p>
                    </div>
                ) : availablePackages.length === 0 ? (
                    <div id="package-selection-no-results" className="text-center py-12 text-gray-400">
                        <p>Ehhez a megyéhez jelenleg nem tartozik elérhető csomag.</p>
                        <button
                            id="package-selection-back-to-map-btn"
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
                            id={`package-card-root-${pkg.id}`}
                            className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row cursor-pointer"
                            onClick={async () => {
                                onSelect(pkg.id);
                                if (user) {
                                    await api.progress.update(user.id, { packageId: pkg.id });
                                }
                                navigate('/terv/program');
                            }}
                        >
                            {/* Kép */}
                            <div id="package-card-image-wrapper" className="md:w-80 h-48 md:h-auto relative shrink-0 overflow-hidden">
                                <img
                                    src={pkg.imageUrl}
                                    alt={pkg.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div id="package-card-image-overlay" className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>

                            {/* Tartalom */}
                            <div id="package-card-content" className="flex-1 p-5 md:p-6 flex flex-col justify-between min-w-0">
                                <div id="package-card-body">
                                    <div id="package-card-header-group" className="flex justify-between items-start mb-3 gap-4">
                                        <h2 id="package-card-title" className="text-2xl font-bold text-gray-900">
                                            {pkg.title}
                                        </h2>
                                        <div id="package-card-duration-badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 whitespace-nowrap shrink-0">
                                            <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                                                3 Nap / 2 Éj
                                            </span>
                                        </div>
                                    </div>
                                    <FormattedText
                                        id="package-card-description"
                                        className="text-gray-600 mb-4 line-clamp-3 leading-relaxed"
                                        text={pkg.description}
                                    />
                                    {pkg.authorName && (
                                        <div className="flex items-center gap-1.5 mb-4">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Készítette:</span>
                                            <span className="text-xs font-black text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{pkg.authorName}</span>
                                        </div>
                                    )}
                                </div>

                                <div id="package-card-footer" className="flex flex-wrap items-end justify-between mt-auto pt-3 border-t border-gray-50 gap-4">
                                    <div id="package-card-tags-list" className="flex flex-wrap gap-x-3 gap-y-2">
                                        {pkg.tags.map((tag, idx) => (
                                            <div key={idx} id={`package-card-tag-item-${idx}`} className="flex items-center gap-1 text-gray-500">
                                                <span className="text-primary flex items-center">
                                                    {getLucideIcon(tag.icon, 14)}
                                                </span>
                                                <span className="text-xs font-semibold hidden lg:inline whitespace-nowrap">
                                                    {tag.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        id="package-card-select-btn"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            onSelect(pkg.id);
                                            if (user) {
                                                await api.progress.update(user.id, { packageId: pkg.id });
                                            }
                                            navigate('/terv/program');
                                        }}
                                        className="bg-primary hover:bg-primary-dark text-white font-black h-14 px-8 rounded-xl transition-all text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 shrink-0 ml-2 active:scale-95"
                                    >
                                        Kiválasztás
                                        <ArrowRight size={20} />
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
