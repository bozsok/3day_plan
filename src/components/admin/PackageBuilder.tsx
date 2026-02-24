import React, { useState, useEffect, useCallback } from 'react';
import type { Package, ProgramItem } from '../../data/mockData';
import { usePackages } from '../../hooks/usePackages';
import { Loader2, Plus, ArrowRight, ArrowLeft, Save, Upload, Trash2, MapPin, Calendar, Pencil, Lightbulb } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProgramItemModal } from './ProgramItemModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { UnsavedChangesModal } from '../common/UnsavedChangesModal';
import { PackageTagsEditor } from './PackageTagsEditor';
import { compressImages } from '../../utils/imageUtils';
import { StatusModal, type StatusModalType } from '../common/StatusModal';
import { useUser } from '../../context/UserContext';

import { HUNGARIAN_COUNTIES } from '../../utils/constants';

export const PackageBuilder: React.FC = () => {
    const { user } = useUser();
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

    // Delete Item Modal
    const [showItemDeleteModal, setShowItemDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ dayIndex: number, itemId: string } | null>(null);
    const [isCoverDragging, setIsCoverDragging] = useState(false);

    // Status Modal State
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: StatusModalType;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showStatus = (title: string, message: string, type: StatusModalType = 'info') => {
        setStatusModal({ isOpen: true, title, message, type });
    };

    const confirmDeleteItem = () => {
        if (itemToDelete) {
            removeProgramItem(itemToDelete.dayIndex, itemToDelete.itemId);
            setShowItemDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const processCoverFiles = async (files: FileList | File[]) => {
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
            showStatus('Hiba történt', 'Nem sikerült a borítókép feltöltése. Kérlek próbáld újra!', 'error');
        } finally {
            setIsUploading(false);
            setIsCoverDragging(false);
        }
    };

    const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processCoverFiles(e.target.files);
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

    // Paste handler for Step 2
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (step !== 2 || isModalOpen) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            const files: File[] = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) files.push(file);
                }
            }

            if (files.length > 0) {
                processCoverFiles(files);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [step, isModalOpen]);

    const handleInputChange = (field: keyof Package, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1) {
            if (!formData.title?.trim()) {
                showStatus('Hiányzó adat', 'Kérlek adj meg egy nevet a csomagnak!', 'warning');
                return false;
            }
            if (!formData.countyId) {
                showStatus('Hiányzó adat', 'Kérlek válassz egy megyét!', 'warning');
                return false;
            }
        }
        if (currentStep === 2) {
            if (!formData.imageUrl) {
                showStatus('Hiányzó kép', 'A csomaghoz kötelező borítóképet feltölteni!', 'warning');
                return false;
            }
        }
        return true;
    };

    const handleNextStep = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };

    const handleSave = async (shouldExit = false) => {
        // Végső validáció mentés előtt
        if (!validateStep(1) || !validateStep(2)) return;

        // Ha nincs programpont, figyelmeztetés, de engedjük menteni
        const totalItems = formData.days?.reduce((acc, day) => acc + day.items.length, 0) || 0;
        if (totalItems === 0) {
            // Opcionális: itt is lehetne warning, de a felhasználó kérése szerint lehet, hogy csak a mezők kitöltése a kritikus.
            // Hagyjuk a mentést, de ha gondolod, ide is rakhatsz egy ellenőrzést.
        }

        // Ha nincs ID, generálunk egyet
        const packageToSave = {
            ...formData,
            id: formData.id || `pkg_${Date.now()}`,
            days: formData.days || [],
            authorName: formData.authorName || user?.name // Assign current user as author if not already set
        } as Package;

        try {
            // Meglévő csomagok frissítése vagy új hozzáadása
            const updatedPackages = selectedPackage
                ? packages.map(p => p.id === selectedPackage.id ? packageToSave : p)
                : [...packages, packageToSave];

            await savePackages(updatedPackages);

            setIsDirty(false); // Mentés sikeres -> tiszta állapot
            setShowUnsavedModal(false); // Modal bezárása

            if (shouldExit) {
                showStatus('Sikeres mentés', 'A kalandot sikeresen elmentettük!', 'success');
                // Kis késleltetéssel lépjünk vissza, hogy lássa a modalt
                setTimeout(() => {
                    setStatusModal(prev => ({ ...prev, isOpen: false }));
                    setIsEditing(false);
                    setSelectedPackage(null);
                    setStep(1);
                }, 1500);
            } else {
                showStatus('Sikeres mentés', 'A változtatásokat rögzítettük.', 'success');
            }
        } catch (error) {
            console.error('Mentési hiba:', error);
            showStatus('Mentési hiba', 'Nem sikerült menteni a csomagot. Kérlek próbáld újra!', 'error');
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
            showStatus('Sikeres törlés', 'A csomagot véglegesen töröltük.', 'success');
        } catch (error) {
            console.error('Törlési hiba:', error);
            showStatus('Törlési hiba', 'Nem sikerült törölni a csomagot.', 'error');
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
                        id={`admin-program-item-edit-${item.id}`}
                        className="p-1.5 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({ item, dayIndex });
                            setIsModalOpen(true);
                        }}
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        id={`admin-program-item-delete-${item.id}`}
                        className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete({ dayIndex, itemId: item.id });
                            setShowItemDeleteModal(true);
                        }}
                    >
                        <Trash2 size={14} />
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
                {item.notes && (
                    <div className="mt-2 pl-[3.2rem] flex items-center gap-1.5 text-blue-600 text-[10px] font-bold uppercase">
                        <Lightbulb size={12} />
                        Van hozzáadott megjegyzés
                    </div>
                )}
            </div>
        );
    };

    // --- Wizard Lépések (Narratív) ---

    // Step 1: Az Alapok (Szöveges)
    const renderStep1 = () => (
        <div id="admin-step1-container" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div id="admin-step1-section-location">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Hová tervezzük a kalandot? 🗺️</h3>
                <p className="text-gray-500 mb-4 text-sm">Válaszd ki azt a megyét, ahová a program szól. Ez segít a felhasználóknak a szűrésben.</p>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                    <select
                        id="admin-package-select-county"
                        name="countyId"
                        value={formData.countyId || ''}
                        onChange={(e) => handleInputChange('countyId', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm appearance-none bg-white font-bold text-lg text-gray-800 transition-all cursor-pointer hover:border-gray-300"
                    >
                        <option value="">Válassz megyét...</option>
                        {HUNGARIAN_COUNTIES.map((county) => (
                            <option key={county.value} value={county.value}>
                                {county.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            <div id="admin-step1-section-title">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Hogy nevezzük el? ✨</h3>
                <p className="text-gray-500 mb-4 text-sm">Adj neki egy hangzatos, figyelemfelkeltő nevet! <span className="font-medium text-primary">Pl. "Romantikus Hétvége a Dunakanyarban"</span></p>
                <input
                    id="admin-package-input-title"
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm font-bold text-lg placeholder:text-gray-300 transition-all"
                    placeholder="Írd ide a csomag nevét..."
                />
            </div>

            <div id="admin-step1-section-price">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Mennyibe fog kerülni? 💰</h3>
                <p className="text-gray-500 mb-4 text-sm">Becsült ár 1 főre. Nem muszáj kitölteni.</p>
                <div className="relative">
                    <input
                        id="admin-package-input-price"
                        type="number"
                        value={formData.estimatedCost || ''}
                        onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                        onKeyDown={(e) => {
                            if (['e', 'E', '+', '-'].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        className="w-full pl-5 pr-12 py-4 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm font-bold text-lg placeholder:text-gray-300 transition-all"
                        placeholder="Pl. 45000"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">Ft</span>
                </div>
            </div>

            <div id="admin-step1-section-description">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Miért fogják imádni? ❤️</h3>
                <p className="text-gray-500 mb-4 text-sm">Írj egy rövid, kedvcsináló leírást (2-3 mondat). Emeld ki a lényeget!</p>
                <textarea
                    id="admin-package-textarea-description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm text-base leading-relaxed placeholder:text-gray-300 transition-all resize-none"
                    placeholder="Ez a csomag tökéletes választás azoknak, akik..."
                />
            </div>
        </div>
    );

    // Step 2: Hangulat (Vizuális)
    const renderStep2 = () => (
        <div id="admin-step2-container" className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div id="admin-step2-section-cover">
                <h3 className="text-xl font-bold text-gray-800 mb-2">A kaland arca 📸</h3>
                <p className="text-gray-500 mb-6 text-sm">Tölts fel egy jó minőségű borítóképet, ami megadja az alaphangulatot. (Ajánlott méret: 800x600px)</p>

                <div
                    id="admin-step2-cover-preview-container"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsCoverDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsCoverDragging(false); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCoverDragging(false);
                        if (e.dataTransfer.files) processCoverFiles(e.dataTransfer.files);
                    }}
                    className={`group relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed transition-all ${isCoverDragging ? 'border-primary bg-primary/5 scale-[1.01] shadow-xl' : 'border-gray-200 bg-gray-50 hover:border-primary/50 hover:bg-primary/5'}`}
                >
                    {formData.imageUrl ? (
                        <>
                            <img src={formData.imageUrl} alt="Borító" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2">
                                    <Upload size={16} />
                                    Csere
                                    <input id="admin-package-upload-cover" type="file" className="hidden" accept="image/*" onChange={handleCoverImageUpload} disabled={isUploading} />
                                </label>
                                <button
                                    id="admin-package-delete-cover-button"
                                    onClick={() => handleInputChange('imageUrl', '')}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                            <div className={`p-4 rounded-full mb-4 transition-colors ${isCoverDragging ? 'bg-primary/20 text-primary' : 'bg-white text-gray-400 shadow-sm'}`}>
                                <Upload size={40} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-1">Engedd el a feltöltéshez!</h4>
                            <p className="text-gray-500 mb-6 max-w-xs text-sm">Vagy tallózz, esetleg illeszd be vágólapról!</p>
                            <label className={`cursor-pointer bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload size={20} />
                                {isUploading ? 'Feltöltés...' : 'Tallózás'}
                                <input id="admin-package-upload-cover-input" type="file" accept="image/*" className="hidden" onChange={handleCoverImageUpload} disabled={isUploading} />
                            </label>

                            {isCoverDragging && (
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                                    <p className="text-primary font-black text-2xl animate-bounce">Feltöltés indítása... 📸</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div id="admin-step2-section-tags">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Címkék és jellemzők 🏷️</h3>
                <p className="text-gray-500 mb-6 text-sm">Milyen stílusú ez az utazás? Válassz vagy adj hozzá új címkéket!</p>
                <PackageTagsEditor
                    tags={formData.tags || []}
                    onChange={(tags) => handleInputChange('tags', tags)}
                />
            </div>
        </div>
    );

    // Step 3: A Program (Tett) - Megmarad, de frissített körítéssel
    const renderStep3 = () => (
        <div id="admin-step3-container" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div id="admin-step3-info-box" className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Calendar className="text-primary" size={20} />
                    Szervezzük meg a hétvégét!
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Hozd létre a programpontokat a megfelelő naphoz a PLUSZ jellel. A programpontok szerkeszthetők, törölhetők, húzhatók.<br />
                    <span className="font-bold"> Tipp:</span> Egy jó 3 napos terv változatos és nem túl zsúfolt.
                </p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div id="admin-step3-days-grid" className="grid grid-cols-1 gap-6">
                    {formData.days?.map((day, dIdx) => (
                        <div key={day.dayIndex} id={`admin-step3-day-card-${dIdx}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div id={`admin-step3-day-header-${dIdx}`} className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <h4 className="font-black text-gray-700 uppercase tracking-wider text-sm flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${dIdx === 0 ? 'bg-amber-400' : dIdx === 1 ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                                    {dIdx === 0 ? 'Péntek (1. Nap)' : dIdx === 1 ? 'Szombat (2. Nap)' : 'Vasárnap (3. Nap)'}
                                </h4>
                                <button
                                    id={`admin-program-add-item-button-${dIdx}`}
                                    onClick={() => {
                                        setEditingItem({ item: null, dayIndex: dIdx });
                                        setIsModalOpen(true);
                                    }}
                                    className="p-2 bg-white hover:bg-primary hover:text-white rounded-lg text-gray-400 transition-all border border-gray-200 hover:border-primary shadow-sm"
                                    title="Programpont hozzáadása"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div id={`admin-step3-day-drop-area-${dIdx}`} className="p-4 min-h-[120px] space-y-3 bg-gray-50/30">
                                <SortableContext items={day.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {day.items.map(item => (
                                        <SortableItem key={item.id} id={item.id} item={item} dayIndex={dIdx} />
                                    ))}
                                </SortableContext>

                                {day.items.length === 0 && (
                                    <div id={`admin-step3-day-empty-${dIdx}`} className="flex flex-col items-center justify-center py-8 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
                                        <span className="text-2xl mb-1 opacity-50">🌱</span>
                                        <span className="text-xs font-medium">Még üres ez a nap</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </DndContext>
        </div>
    );

    // Live Preview Component
    const LivePreview = () => (
        <div id="admin-preview-container" className="sticky top-8 space-y-6">
            <h3 id="admin-preview-header" className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4 mt-2">
                {step === 3 ? 'Program Terv Előnézet' : 'Kártya Előnézet'}
            </h3>

            {step === 3 ? (
                // --- Program Timeline Preview (Step 3) ---
                <div id="admin-preview-program-card" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 w-full max-w-sm mx-auto flex flex-col">
                    <div id="admin-preview-program-header" className="p-4 bg-gray-50 border-b border-gray-100 text-center shrink-0">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide truncate px-4">
                            {formData.title || "Tervezett Program"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">3 Napos Terv</p>
                    </div>
                    <div id="admin-preview-program-content" className="flex-1 p-5 space-y-8">
                        {formData.days?.map((day, idx) => (
                            <div key={idx} className="relative pl-6 border-l-2 border-gray-100 last:border-0 pb-2">
                                {/* Day Header */}
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-emerald-400' : 'bg-blue-400'
                                    }`}></div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 leading-none transform -translate-y-1">
                                    {idx === 0 ? 'Péntek' : idx === 1 ? 'Szombat' : 'Vasárnap'}
                                </h4>

                                {/* Items */}
                                <div className="space-y-3">
                                    {day.items.length > 0 ? (
                                        day.items.map((item, i) => (
                                            <div key={i} className="flex gap-3 bg-gray-50/50 hover:bg-gray-50 rounded-lg p-2 border border-gray-100/50 hover:border-gray-200 transition-colors">
                                                <span className="text-lg shrink-0">{item.icon}</span>
                                                <div className="min-w-0">
                                                    <div className="text-[10px] font-bold text-primary">{item.time}</div>
                                                    <div className="text-xs font-bold text-gray-700 leading-tight truncate">{item.title}</div>
                                                    {item.marketingLabel && (
                                                        <div className="text-[8px] font-black text-amber-600 uppercase mt-0.5">{item.marketingLabel}</div>
                                                    )}
                                                    {item.notes && (
                                                        <div className="flex items-center gap-1 text-[8px] text-blue-500 mt-0.5">
                                                            <Lightbulb size={8} /> Megjegyzés
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-xs text-gray-300 italic pl-1">Még nincs program...</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div id="admin-preview-program-footer" className="p-3 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-400 shrink-0">
                        {formData.days?.reduce((acc, output) => acc + output.items.length, 0)} programpont összesen
                    </div>
                </div>
            ) : (
                // --- Standard Package Card Preview (Step 1 & 2) ---
                <div id="admin-preview-standard-card" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 w-full max-w-sm mx-auto">
                    <div id="admin-preview-card-image" className="h-56 overflow-hidden relative bg-gray-100">
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt={formData.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                                <span className="text-5xl">🖼️</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                            <h3 className="text-white font-bold text-xl leading-tight drop-shadow-md">
                                {formData.title || <span className="opacity-50 italic">Csomag Neve...</span>}
                            </h3>
                        </div>
                        {formData.countyId && (
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                {formData.countyId}
                            </div>
                        )}
                    </div>
                    <div id="admin-preview-card-content" className="p-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {formData.tags?.length ? (
                                formData.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md flex items-center gap-1">
                                        {tag.icon} {tag.label}
                                    </span>
                                ))
                            ) : (
                                <span className="px-2 py-1 bg-gray-50 text-gray-300 text-xs font-bold rounded-md border border-dashed border-gray-200">
                                    #Címkék
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 line-clamp-3 mb-6 text-sm leading-relaxed min-h-[3rem]">
                            {formData.description || <span className="opacity-40 italic">Itt fog megjelenni a rövid leírás, amit a felhasználók látni fognak...</span>}
                        </p>
                        <div id="admin-preview-card-footer" className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Becsült ár</span>
                            <span className="font-black text-primary text-lg">
                                {formData.estimatedCost && !isNaN(Number(formData.estimatedCost)) && Number(formData.estimatedCost) > 0
                                    ? `${Number(formData.estimatedCost).toLocaleString('hu-HU')} Ft`
                                    : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center">
                <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                    {step === 3
                        ? 'Itt láthatod a napok ívét és telítettségét.'
                        : 'Így fog kinézni a kártya a felhasználók számára a választó képernyőn.'
                    }
                </p>
            </div>
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

    if (!user) {
        return (
            <div id="admin-access-denied-container" className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border-2 border-dashed border-gray-100 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6 text-red-500 shadow-sm">
                    <Trash2 size={40} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Ajjaj! Nem vagy bejelentkezve... 🛑</h2>
                <p className="text-gray-500 max-w-md mb-8 text-lg">
                    Programcsomagot csak létező, névvel rendelkező résztvevő készíthet. Kérlek, térj vissza a kezdőlapra és írd be a neved a folytatáshoz!
                </p>
                <button
                    onClick={() => window.location.href = '#/'}
                    className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all text-xl"
                >
                    Vissza a kezdőlapra
                </button>
            </div>
        );
    }

    return (
        <div id="admin-package-builder-root" className="container mx-auto p-6 max-w-7xl">
            {/* Main Header (All packages view) */}
            {!isEditing && (
                <div id="admin-dashboard-header" className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Kalandor varázsló 🧙‍♂️</h1>
                        <p className="text-gray-500 mt-2 text-lg">Hozz létre felejthetetlen élményeket pár kattintással.</p>
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2 max-w-xl">
                            <span className="text-lg">📱</span>
                            <div>
                                <span className="font-bold">Figyelem:</span> A szerkesztő felület használatához minimum <strong>600px</strong> széles képernyő szükséges!
                                Mobil nézetben a megjelenés nem optimalizált.
                            </div>
                        </div>
                    </div>
                    <button
                        id="admin-dashboard-new-adventure-button"
                        onClick={() => {
                            setSelectedPackage(null);
                            setIsEditing(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-6 h-14 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} />
                        Új kaland tervezése
                    </button>
                </div>
            )}

            {isEditing ? (
                <div id="admin-wizard-layout" className="flex flex-col lg:flex-row gap-8 items-start h-full">
                    {/* Left Side: Wizard Form */}
                    <div id="admin-wizard-form-container" className="flex-1 w-full">
                        <div id="admin-wizard-card" className="bg-white rounded-3xl shadow-2xl border border-gray-100 relative flex flex-col">
                            {/* Wizard Header */}
                            <div id="admin-wizard-header" className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-start shrink-0 rounded-t-3xl">
                                <div>
                                    <div id="admin-wizard-steps-indicator" className="flex items-center gap-3 text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
                                        <span className={`flex items-center gap-1 ${step >= 1 ? 'text-primary' : ''}`}>
                                            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">1</span>
                                            Alapok
                                        </span>
                                        <span className="w-4 h-0.5 bg-gray-200"></span>
                                        <span className={`flex items-center gap-1 ${step >= 2 ? 'text-primary' : ''}`}>
                                            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">2</span>
                                            Hangulat
                                        </span>
                                        <span className="w-4 h-0.5 bg-gray-200"></span>
                                        <span className={`flex items-center gap-1 ${step >= 3 ? 'text-primary' : ''}`}>
                                            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">3</span>
                                            Program
                                        </span>
                                    </div>
                                    <h2 id="admin-wizard-step-title" className="text-2xl font-black text-gray-900">
                                        {step === 1 && 'Az alapok 📝'}
                                        {step === 2 && 'Hangulat és látvány 🎨'}
                                        {step === 3 && 'A program összeállítása 🗺️'}
                                    </h2>
                                    {user && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <div id="admin-wizard-author-badge" className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 shadow-sm">
                                                <span className="opacity-70">Létrehozó:</span>
                                                <span>{formData.authorName || user.name}</span>
                                            </div>
                                            {formData.authorName && formData.authorName !== user.name && (
                                                <div id="admin-wizard-editor-badge" className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
                                                    <span className="opacity-70">Szerkesztő:</span>
                                                    <span>{user.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    id="admin-wizard-exit-button"
                                    onClick={handleBack}
                                    className="-mt-2 text-red-500 hover:text-red-600 font-bold transition-colors px-4 py-2 hover:bg-red-50 rounded-xl text-sm border border-transparent hover:border-red-100"
                                >
                                    Kilépés
                                </button>
                            </div>

                            {/* Content Area */}
                            <div id="admin-wizard-content-area" className="p-8 lg:p-10 bg-white">
                                {step === 1 && renderStep1()}
                                {step === 2 && renderStep2()}
                                {step === 3 && renderStep3()}
                            </div>

                            {/* Footer Navigation */}
                            <div id="admin-wizard-footer" className="bg-white px-8 py-6 border-t border-gray-100 flex justify-between items-center shrink-0 rounded-b-3xl">
                                <button
                                    id={`admin-step${step}-back-button`}
                                    onClick={() => {
                                        if (step === 1) handleBack();
                                        else setStep(step - 1);
                                    }}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft size={18} />
                                    {step === 1 ? 'Mégse' : 'Vissza'}
                                </button>

                                {step < 3 ? (
                                    <button
                                        id={`admin-step${step}-next-button`}
                                        onClick={handleNextStep}
                                        className="px-8 py-4 rounded-xl font-black bg-primary text-white hover:bg-primary/90 flex items-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all text-lg"
                                    >
                                        Tovább
                                        <ArrowRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        id="admin-step3-save-button"
                                        onClick={() => handleSave(true)}
                                        disabled={isSaving}
                                        className="px-10 py-4 rounded-xl font-black bg-gradient-to-r from-primary-dark to-primary text-white hover:brightness-110 flex items-center gap-3 shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all text-lg disabled:opacity-70"
                                    >
                                        <Save size={20} />
                                        {isSaving ? 'Mentés...' : 'Kaland mentése!'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Live Preview (Desktop Only) */}
                    <div id="admin-wizard-preview-container" className="hidden lg:block w-96 shrink-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
                        <LivePreview />
                    </div>
                </div>
            ) : (
                /* Dashboard View - Package List */
                <div id="admin-dashboard-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Add New Card */}
                    <div
                        id="admin-dashboard-card-new"
                        onClick={() => { setSelectedPackage(null); setIsEditing(true); }}
                        className="bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group min-h-[400px] text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-blue-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center mb-6 transition-all shadow-sm text-primary">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">Új Csomag</h3>
                        <p className="text-gray-400 font-medium">Kezdj egy teljesen új<br />programterv összeállításába.</p>
                    </div>

                    {packages.map(pkg => (
                        <div
                            key={pkg.id}
                            id={`admin-dashboard-card-${pkg.id}`}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 h-full flex flex-col hover:-translate-y-2"
                            onClick={() => { setSelectedPackage(pkg); setIsEditing(true); }}
                        >
                            <div className="h-48 overflow-hidden relative bg-gray-100">
                                {pkg.imageUrl ? (
                                    <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <span className="text-4xl">🖼️</span>
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                    {pkg.countyId}
                                </div>
                                <button
                                    id={`admin-dashboard-card-delete-${pkg.id}`}
                                    onClick={(e) => handleDeletePackageClick(pkg.id, e)}
                                    className="absolute top-4 left-4 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 p-2 rounded-full shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                    title="Törlés"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">{pkg.title}</h3>
                                <p className="text-gray-500 line-clamp-3 mb-4 flex-1 text-sm leading-relaxed">{pkg.description}</p>

                                {pkg.authorName && (
                                    <div className="flex items-center gap-1.5 mb-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Készítette:</span>
                                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{pkg.authorName}</span>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Becsült ár</span>
                                    <span className="font-black text-primary text-lg">
                                        {pkg.estimatedCost && !isNaN(Number(pkg.estimatedCost)) && Number(pkg.estimatedCost) > 0
                                            ? `${Number(pkg.estimatedCost).toLocaleString('hu-HU')} Ft`
                                            : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
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

            <ConfirmationModal
                isOpen={showItemDeleteModal}
                title="Programpont törlése"
                message="Biztosan törölni szeretnéd ezt a programpontot?"
                confirmLabel="Törlés"
                cancelLabel="Mégse"
                onConfirm={confirmDeleteItem}
                onCancel={() => { setShowItemDeleteModal(false); setItemToDelete(null); }}
                isDestructive={true}
            />

            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onSave={() => handleSave(true)}
                onDiscard={handleDiscard}
                onCancel={() => setShowUnsavedModal(false)}
            />

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                title={statusModal.title}
                message={statusModal.message}
                type={statusModal.type}
            />
        </div>
    );
};
