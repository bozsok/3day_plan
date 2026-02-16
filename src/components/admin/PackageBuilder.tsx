import React, { useState, useEffect, useCallback } from 'react';
import type { Package, ProgramItem } from '../../data/mockData';
import { usePackages } from '../../hooks/usePackages';
import { Loader2, Plus, ArrowRight, ArrowLeft, Save, Upload, Trash2, MapPin } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProgramItemModal } from './ProgramItemModal';
import { HelpTooltip } from '../common/HelpTooltip';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { UnsavedChangesModal } from '../common/UnsavedChangesModal';
import { PackageTagsEditor } from './PackageTagsEditor';
import { compressImages } from '../../utils/imageUtils';
import { HUNGARIAN_COUNTIES } from '../../utils/constants';

export const PackageBuilder: React.FC = () => {
    const { packages, isLoading, savePackages, isSaving, uploadImages } = usePackages();
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Package>>({});

    // Unsaved changes védelem
    const [isDirty, setIsDirty] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    // Delete Confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState<string | null>(null);

    // --- Modal Logic ---
    const [editingItem, setEditingItem] = useState<{ item: ProgramItem | null, dayIndex: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const compressedFiles = await compressImages(Array.from(files));
            const uploadedUrls = await uploadImages(compressedFiles);

            if (uploadedUrls.length > 0) {
                handleInputChange('imageUrl', uploadedUrls[0]);
            }
        } catch (error) {
            console.error('Cover image upload failed:', error);
            alert('Hiba a borítókép feltöltése során!');
        } finally {
            setIsUploading(false);
        }
    };

    // Ha szerkesztünk, töltsük be az adatokat
    useEffect(() => {
        if (selectedPackage) {
            setFormData(selectedPackage);
        } else {
            // Reset
            setFormData({
                id: crypto.randomUUID(),
                title: '',
                description: '',
                countyId: '',
                estimatedCost: '',
                imageUrl: '',
                tags: [],
                days: [
                    { dayIndex: 1, items: [] },
                    { dayIndex: 2, items: [] },
                    { dayIndex: 3, items: [] }
                ]
            });
        }
        setStep(1);
        setIsDirty(false); // Reset dirty state when package changes or new package is started
    }, [selectedPackage, isEditing]);

    const handleInputChange = (field: keyof Package, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = async (shouldExit = false) => {
        if (!formData.title || !formData.countyId) {
            alert('A csomag neve és a megye kötelező!');
            return;
        }

        // Ha nincs ID, generálunk egyet
        const packageToSave = {
            ...formData,
            id: formData.id || `pkg_${Date.now()}`,
            days: formData.days || []
        } as Package;

        try {
            // Meglévő csomagok frissítése vagy új hozzáadása
            const updatedPackages = selectedPackage
                ? packages.map(p => p.id === selectedPackage.id ? packageToSave : p)
                : [...packages, packageToSave];

            await savePackages(updatedPackages);

            setIsDirty(false); // Mentés sikeres -> tiszta állapot

            if (shouldExit) {
                setIsEditing(false);
                setSelectedPackage(null);
                setStep(1);
            } else {
                // Opcionális: visszajelzés a felhasználónak, hogy sikeres volt a mentés
            }
        } catch (error) {
            console.error('Mentési hiba:', error);
            alert('Hiba történt a mentés során!');
        }
    };

    const handleBack = () => {
        if (isDirty) {
            setShowUnsavedModal(true);
        } else {
            setIsEditing(false);
            setSelectedPackage(null);
            setStep(1);
        }
    };

    const handleDiscard = () => {
        setShowUnsavedModal(false);
        setIsDirty(false);
        setIsEditing(false);
        setSelectedPackage(null);
        setStep(1);
    };

    const handleSaveItem = (item: ProgramItem) => {
        if (!editingItem) return;

        const { dayIndex } = editingItem;
        const newDays = [...formData.days!];

        // Meglévő elem frissítése vagy új hozzáadása
        const itemIndex = newDays[dayIndex].items.findIndex(i => i.id === item.id);

        if (itemIndex >= 0) {
            newDays[dayIndex].items[itemIndex] = item;
        } else {
            newDays[dayIndex].items.push(item);
        }

        handleInputChange('days', newDays);
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const removeProgramItem = useCallback((dayIndex: number, itemId: string) => {
        const newDays = [...formData.days!];
        newDays[dayIndex].items = newDays[dayIndex].items.filter((i: ProgramItem) => i.id !== itemId);
        handleInputChange('days', newDays);
    }, [formData.days, handleInputChange]);

    const handleDeletePackageClick = (packageId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPackageToDelete(packageId);
        setShowDeleteModal(true);
    };

    const confirmDeletePackage = async () => {
        if (!packageToDelete) return;

        const updatedPackages = packages.filter(p => p.id !== packageToDelete);
        try {
            await savePackages(updatedPackages);
            setShowDeleteModal(false);
            setPackageToDelete(null);

            // Ha épp ezt a csomagot szerkesztettük, lépjünk ki
            if (selectedPackage?.id === packageToDelete) {
                setIsEditing(false);
                setSelectedPackage(null);
                setStep(1);
            }
        } catch (error) {
            console.error('Törlési hiba:', error);
            alert('Nem sikerült a törlés.');
        }
    };


    // --- DnD Setup ---
    // DnD szenzorok (Smart activation a kattintások engedélyezéséhez)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Csak 8px mozgás után indul a drag -> így a click átmegy
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Melyik aktív naphoz tartozik?
        const activeDayIndex = formData.days?.findIndex(d => d.items.some(i => i.id === active.id));
        if (activeDayIndex === -1 || activeDayIndex === undefined) return;

        // Ha ugyanazon a napon belül mozgattuk
        const activeItems = formData.days![activeDayIndex].items;
        const oldIndex = activeItems.findIndex(i => i.id === active.id);
        const newIndex = activeItems.findIndex(i => i.id === over.id);

        if (oldIndex !== newIndex) {
            const newDays = [...formData.days!];
            newDays[activeDayIndex].items = arrayMove(activeItems, oldIndex, newIndex);
            handleInputChange('days', newDays);
        }
    };

    const SortableItem = ({ id, item, dayIndex }: { id: string; item: ProgramItem; dayIndex: number }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };

        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-all relative touch-none">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                        className="p-1.5 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()} // KLIKK JAVÍTÁS: Megakadályozza a drag indítást
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({ item, dayIndex });
                            setIsModalOpen(true);
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                    </button>
                    <button
                        className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()} // KLIKK JAVÍTÁS
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Biztosan törölni szeretnéd ezt a programpontot?')) {
                                removeProgramItem(dayIndex, item.id);
                            }
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                </div>
                <div className="flex gap-3 mb-1">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-primary">{item.time}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">{item.category}</span>
                            {item.marketingLabel && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">{item.marketingLabel}</span>
                            )}
                        </div>
                        <h4 className="font-bold text-gray-800 leading-tight">{item.title}</h4>
                    </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1 pl-[3.2rem]">{item.description}</p>
                {item.galleryImages && item.galleryImages.length > 0 && (
                    <div className="pl-[3.2rem] mt-2 flex gap-1">
                        {item.galleryImages.map((img: string, i: number) => (
                            <img key={i} src={img} className="w-8 h-8 rounded-md object-cover border border-white shadow-sm" alt="" />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // --- Wizard Lépések ---

    const renderStep1 = () => (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Csomag neve
                        <HelpTooltip text="A csomag megjelenő neve, pl. 'Romantikus Hétvége a Dunakanyarban'." />
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full rounded-lg border-gray-300 border p-3 focus:ring-primary focus:border-primary shadow-sm"
                        placeholder="Pl. Romantikus Hétvége"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Régió / Megye
                        <HelpTooltip text="Válaszd ki, melyik megyében található a programcsomag." />
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            name="countyId"
                            value={formData.countyId || ''}
                            onChange={(e) => handleInputChange('countyId', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 border focus:ring-primary focus:border-primary shadow-sm appearance-none bg-white"
                        >
                            <option value="">Válassz megyét...</option>
                            {HUNGARIAN_COUNTIES.map((county) => (
                                <option key={county.value} value={county.value}>
                                    {county.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Becsült ár (Ft)
                        <HelpTooltip text="A teljes csomag becsült ára 2 főre, Forintban. Csak számokat írj be (e nélkül)." />
                    </label>
                    <input
                        type="number"
                        name="estimatedCost"
                        value={formData.estimatedCost || ''}
                        onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                        onKeyDown={(e) => {
                            if (['e', 'E', '+', '-'].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        className="w-full rounded-lg border-gray-300 border p-3 focus:ring-primary focus:border-primary shadow-sm"
                        placeholder="Pl. 45000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Borítókép
                        <span className="text-xs font-normal text-gray-500 ml-2">(Javasolt méret: 800x600 px)</span>
                        <HelpTooltip text="A csomag főképének feltöltése. (JPG/PNG, max 2MB)" />
                    </label>

                    <div className="space-y-3">
                        {formData.imageUrl ? (
                            <div className="relative group w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                                <img src={formData.imageUrl} alt="Borítókép" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handleInputChange('imageUrl', '')}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm cursor-pointer"
                                    title="Kép törlése"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-primary transition-all group relative overflow-hidden ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                                    )}
                                    <p className="mb-1 text-sm text-gray-500"><span className="font-bold text-gray-700">Kattints a feltöltéshez</span></p>
                                    <p className="text-xs text-gray-400">SVG, PNG, JPG (MAX. 2MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleCoverImageUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                    Leírás
                    <HelpTooltip text="Rövid, kedvcsináló leírás a csomagról, ami megjelenik a kártyán." />
                </label>
                <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border-gray-300 border p-3 focus:ring-primary focus:border-primary shadow-sm"
                    placeholder="Írj egy rövid leírást..."
                />
            </div>
        </div>
    );



    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    Programterv
                    <HelpTooltip text="Állítsd össze a 3 napos programot! Húzd át az elemeket a napok között, vagy addj hozzá újakat. Tipp: Kezdj egy péntek délutáni érkezéssel, szombatra tegyél több aktivitást, vasárnapra pedig egy levezető programot." />
                </h3>
                <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-2">
                    <span className="text-lg">💡</span> Húzd és ejtsd a programpontokat a sorrend módosításához.
                </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {formData.days?.map((day, dIdx) => (
                        <div key={day.dayIndex} className="bg-gray-50/50 rounded-xl border border-gray-200 flex flex-col h-full bg-slate-50">
                            <div className="p-4 border-b border-gray-100 bg-white rounded-t-xl sticky top-0 z-10 shadow-sm">
                                <h4 className="font-black text-gray-700 uppercase tracking-wider text-sm flex justify-between items-center">
                                    {dIdx === 0 ? 'Péntek' : dIdx === 1 ? 'Szombat' : 'Vasárnap'}
                                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full border border-gray-200">{day.items.length}</span>
                                </h4>
                            </div>

                            <div className="p-3 flex-1 min-h-[200px] space-y-3">
                                <SortableContext items={day.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {day.items.map(item => (
                                        <SortableItem key={item.id} id={item.id} item={item} dayIndex={dIdx} />
                                    ))}
                                </SortableContext>

                                {day.items.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-lg m-2">
                                        Nincs programpont erre a napra.
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
                                <button
                                    onClick={() => {
                                        setEditingItem({ item: null, dayIndex: dIdx }); // Új elem
                                        setIsModalOpen(true);
                                    }}
                                    className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm flex items-center justify-center gap-2 group"
                                >
                                    <div className="bg-gray-200 rounded-full p-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Plus size={14} />
                                    </div>
                                    Programpont hozzáadása
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </DndContext>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-gray-500 font-medium">Csomagok betöltése...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Programcsomagok</h1>
                    <p className="text-gray-500 mt-1">Hozzon létre új utazási ajánlatokat vagy szerkessze a meglévőket.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setSelectedPackage(null);
                            setIsEditing(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        Új Csomag
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50/50 px-8 py-6 border-b flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {selectedPackage ? 'Csomag szerkesztése' : 'Új csomag létrehozása'}
                                <span className="text-sm font-normal text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm ml-2">
                                    Lépés {step} / 3
                                </span>
                            </h2>
                        </div>
                        <button onClick={handleBack} className="text-gray-500 hover:text-red-500 font-medium transition-colors px-3 py-1 hover:bg-red-50 rounded-lg">
                            Mégse
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-1">
                        <div
                            className="bg-primary h-1 transition-all duration-300 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-8 min-h-[400px]">
                        {step === 1 && renderStep1()}
                        {step === 2 && (
                            <PackageTagsEditor
                                tags={formData.tags || []}
                                onChange={(tags) => handleInputChange('tags', tags)}
                            />
                        )}
                        {step === 3 && renderStep3()}
                    </div>

                    {/* Footer / Navigation */}
                    <div className="bg-gray-50 px-8 py-6 border-t flex justify-between items-center">
                        <button onClick={() => setStep(step - 1)} disabled={step === 1} className="px-6 py-3 rounded-xl font-bold bg-white text-gray-700 border border-gray-200 hover:border-gray-300 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all hover:bg-gray-50">
                            <ArrowLeft size={18} />
                            Vissza
                        </button>
                        {step < 3 ? (
                            <button onClick={() => setStep(step + 1)} className="px-8 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-black flex items-center gap-2 shadow-lg shadow-gray-200/50 transition-all hover:-translate-y-0.5">
                                Tovább
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button onClick={() => handleSave(true)} disabled={isSaving} className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-primary-dark to-primary text-white hover:brightness-110 flex items-center gap-2 shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
                                <Save size={18} />
                                {isSaving ? 'Mentés...' : 'Mentés'}
                            </button>
                        )}
                    </div>

                    <UnsavedChangesModal
                        isOpen={showUnsavedModal}
                        onSave={() => handleSave(true)}
                        onDiscard={handleDiscard}
                        onCancel={() => setShowUnsavedModal(false)}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map(pkg => (
                        <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 h-full flex flex-col hover:-translate-y-1" onClick={() => { setSelectedPackage(pkg); setIsEditing(true); }}>
                            <div className="h-56 overflow-hidden relative bg-gray-100">
                                {pkg.imageUrl ? (
                                    <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                        <span className="text-4xl opacity-20">🖼️</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                                    <h3 className="text-white font-bold text-xl leading-tight drop-shadow-md">{pkg.title}</h3>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                    {pkg.countyId}
                                </div>
                                <button
                                    onClick={(e) => handleDeletePackageClick(pkg.id, e)}
                                    className="absolute top-4 left-4 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                    title="Csomag törlése"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <p className="text-gray-600 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">{pkg.description}</p>
                                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Becsült ár</span>
                                    <span className="font-black text-primary text-lg">{parseInt(pkg.estimatedCost).toLocaleString('hu-HU')} Ft</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Hozzáadás Kártya */}
                    <div
                        onClick={() => { setSelectedPackage(null); setIsEditing(true); }}
                        className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group min-h-[300px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-4 transition-colors shadow-sm">
                            <Plus size={32} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400 group-hover:text-primary transition-colors">Új Csomag</h3>
                        <p className="text-sm text-gray-400 mt-2 text-center">Hozzon létre egy teljesen új<br />programtervet.</p>
                    </div>

                    {/* Empty State ha nincs csomag */}
                    {packages.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 hidden">
                            Nincsenek megjeleníthető csomagok.
                        </div>
                    )}
                </div>
            )}

            <ProgramItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                initialData={editingItem?.item || undefined}
            />

            <ConfirmationModal
                isOpen={showDeleteModal}
                title="Csomag törlése"
                message="Biztosan törölni szeretnéd ezt a teljes csomagot? Ez a művelet nem vonható vissza!"
                confirmLabel="Igen, törlöm"
                cancelLabel="Mégse"
                onConfirm={confirmDeletePackage}
                onCancel={() => { setShowDeleteModal(false); setPackageToDelete(null); }}
                isDestructive={true}
            />
        </div>
    );
};
