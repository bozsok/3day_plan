import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ProgramItem } from '../../data/mockData';
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { usePackages } from '../../hooks/usePackages';
import { compressImages } from '../../utils/imageUtils';
import { HelpTooltip } from '../common/HelpTooltip';
import { PROGRAM_CATEGORIES, PROGRAM_ICONS } from '../../utils/constants';
import { StatusModal, type StatusModalType } from '../common/StatusModal';

interface ProgramItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: ProgramItem) => void;
    initialData?: ProgramItem;
}

export const ProgramItemModal: React.FC<ProgramItemModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { uploadImages } = usePackages();
    const [formData, setFormData] = useState<ProgramItem>({
        id: crypto.randomUUID(),
        time: '12:00',
        title: '',
        description: '',
        icon: '📍',
        category: 'egyeb',
        marketingLabel: '',
        notes: '',
        galleryImages: [],
        imageUrl: ''
    });
    const [isUploading, setIsUploading] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

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

    useEffect(() => {
        if (isOpen) {
            setIsIconPickerOpen(false);
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    id: crypto.randomUUID(),
                    time: '08:00',
                    title: '',
                    description: '',
                    icon: '🚗',
                    category: 'utazas',
                    marketingLabel: '',
                    notes: '',
                    galleryImages: [],
                    imageUrl: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const processFiles = async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const compressedFiles = await compressImages(Array.from(files));
            const uploadedUrls = await uploadImages(compressedFiles);

            setFormData(prev => ({
                ...prev,
                galleryImages: [...(prev.galleryImages || []), ...uploadedUrls]
            }));
        } catch (error) {
            console.error(error);
            showStatus('Feltöltési hiba', 'Nem sikerült a képek feltöltése. Kérlek próbáld újra!', 'error');
        } finally {
            setIsUploading(false);
            setIsDragging(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            galleryImages: prev.galleryImages?.filter((_, i) => i !== index)
        }));
    };

    // Drag & Drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
    };

    // Paste handler
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!isOpen) return;

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
                processFiles(files);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div id="admin-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-hidden">
            <div id="admin-modal-window" className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div id="admin-modal-header" className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0 z-10 shrink-0">
                    <h2 id="admin-modal-title" className="text-xl font-bold text-gray-800">
                        {initialData ? 'Programpont szerkesztése' : 'Új programpont'}
                    </h2>
                    <button id="admin-modal-program-close-button" onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div id="admin-modal-body" className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div id="admin-modal-section-basic" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="block text-sm font-bold text-gray-700">Időpont</label>
                                <HelpTooltip text="A programpont kezdési ideje (óra:perc formátumban)." />
                            </div>
                            <input id="admin-modal-program-input-time" type="time" name="time" value={formData.time} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary focus:border-primary cursor-pointer" />
                        </div>
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-1">
                                <label className="block text-sm font-bold text-gray-700">Cím</label>
                                <HelpTooltip text="A programpont megnevezése, pl. 'Látogatás a Várban'." />
                            </div>
                            <input id="admin-modal-program-input-title" type="text" name="title" value={formData.title} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary focus:border-primary" placeholder="Pl. Ebéd a Panoráma Étteremben" />
                        </div>
                    </div>

                    <div id="admin-modal-section-description">
                        <div className="flex items-center gap-2 mb-1">
                            <label className="block text-sm font-bold text-gray-700">Leírás</label>
                            <HelpTooltip text="Részletes leírás a programról. Használhatsz sortöréseket, **félkövér** szöveget és - listákat." />
                        </div>
                        <textarea id="admin-modal-program-input-description" name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary focus:border-primary" placeholder="Leírás (Markdown támogatott: **félkövér**, - listák)..." />
                    </div>

                    <div id="admin-modal-section-category" className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="block text-sm font-bold text-gray-700">Kategória</label>
                                <HelpTooltip text="A tevékenység típusa, ez alapján színezzük a kártyát." />
                            </div>
                            <select id="admin-modal-program-input-activity" name="category" value={formData.category} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-2.5 bg-white focus:ring-primary focus:border-primary">
                                {PROGRAM_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-1">
                                <label className="block text-sm font-bold text-gray-700">Ikon (Emoji)</label>
                                <HelpTooltip text="Egyetlen emoji, ami vizuálisan jelöli a program típusát." />
                            </div>
                            <button
                                id="admin-modal-program-icon-trigger"
                                type="button"
                                onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                                className="w-full rounded-lg border-gray-300 border p-2.5 text-center text-xl bg-white focus:ring-primary focus:border-primary hover:bg-gray-50 transition-colors"
                            >
                                {formData.icon}
                            </button>

                            {isIconPickerOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsIconPickerOpen(false)} />
                                    <div id="admin-modal-icon-picker-popover" className="absolute bottom-full mb-2 right-0 z-30 bg-white p-3 rounded-xl shadow-xl border border-gray-100 w-64 grid grid-cols-6 gap-2 animate-in fade-in zoom-in-95 duration-200 custom-scrollbar max-h-48 overflow-y-auto">
                                        {PROGRAM_ICONS.map((icon) => (
                                            <button
                                                key={icon}
                                                id={`admin-modal-program-icon-option-${icon}`}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, icon }));
                                                    setIsIconPickerOpen(false);
                                                }}
                                                className={`text-xl p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center aspect-square ${formData.icon === icon ? 'bg-blue-50 ring-2 ring-blue-500/20' : ''}`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div id="admin-modal-section-marketing" className="border-t pt-6">
                        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                            ✨ Marketing & Extrák
                        </h3>

                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <label className="block text-sm font-bold text-gray-700">Marketing Címke</label>
                                <HelpTooltip text="Rövid, figyelemfelkeltő szöveg, pl. 'Kihagyhatatlan', 'Ingyenes'. Kiemelten jelenik meg." />
                            </div>
                            <input id="admin-modal-program-input-marketing" type="text" name="marketingLabel" value={formData.marketingLabel || ''} onChange={handleChange} maxLength={20} className="w-full rounded-lg border-gray-300 border p-2.5 placeholder-gray-400" placeholder="Pl. 'Kihagyhatatlan', 'Családbarát', 'Ingyenes'" />
                            <p className="text-xs text-gray-400 mt-1">Ez a szöveg kiemelten jelenik meg a kártyán. (Max 20 karakter)</p>
                        </div>

                        <div id="admin-modal-section-notes">
                            <div className="flex items-center gap-2 mb-1">
                                <label className="block text-sm font-bold text-gray-700">Megjegyzés / Hasznos információ</label>
                                <HelpTooltip text="Extra tippek, amik lenyíló fülként (accordion) jelennek meg. Itt is működik a formázás (**félkövér**, listák)." />
                            </div>
                            <textarea id="admin-modal-program-input-notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary focus:border-primary placeholder-gray-400" placeholder="Tippek, fontos tudnivalók (Markdown támogatott)..." />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="block text-sm font-bold text-gray-700">Képgaléria</label>
                                <HelpTooltip text="Tölts fel több képet a helyszínről! Ráhúzhatod (drag & drop) vagy beillesztheted (Ctrl+V) is." />
                            </div>

                            {/* Feltöltés gomb / Drop zóna */}
                            <div
                                id="admin-modal-upload-zone"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${isDragging ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl' : 'border-gray-200 bg-gray-50'}`}
                            >
                                <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-primary/20 text-primary' : 'bg-white text-gray-400 shadow-sm'}`}>
                                    <Upload size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-gray-800">Húzd ide a képeket vagy kattints a tallózáshoz</p>
                                    <p className="text-sm text-gray-500 mt-1">Vágólapról való beillesztés is működik (Ctrl+V)</p>
                                </div>
                                <label className={`px-6 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 font-bold ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <span>{isUploading ? 'Feldolgozás...' : 'Tallózás'}</span>
                                    <input id="admin-modal-gallery-upload-input" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                </label>

                                {isDragging && (
                                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center pointer-events-none">
                                        <p className="text-primary font-black text-xl animate-bounce">Engedd el a feltöltéshez! ✨</p>
                                    </div>
                                )}
                            </div>

                            {/* Galéria előnézet */}
                            <div id="admin-modal-gallery-grid" className="grid grid-cols-4 gap-3 mt-6">
                                {formData.galleryImages?.map((img, idx) => (
                                    <div key={idx} id={`admin-modal-gallery-item-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm transition-transform hover:scale-[1.02]">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        <button
                                            id={`admin-modal-gallery-delete-button-${idx}`}
                                            onClick={() => removeGalleryImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 hover:scale-100 shadow-lg"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 h-1 bg-black/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                    </div>
                                ))}
                                {(!formData.galleryImages || formData.galleryImages.length === 0) && (
                                    <div id="admin-modal-gallery-empty" className="col-span-4 py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                        <ImageIcon size={48} className="mx-auto mb-3 opacity-10" />
                                        <p className="font-medium">Nincsenek még feltöltött képek.</p>
                                        <p className="text-xs mt-1">A képek automatikusan optimalizálásra kerülnek (max 2000px).</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div id="admin-modal-footer" className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 shrink-0">
                    <button id="admin-modal-program-cancel-button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors">
                        Mégse
                    </button>
                    <button
                        id="admin-modal-program-save-button"
                        onClick={() => onSave(formData)}
                        className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                    >
                        Mentés
                    </button>
                </div>
            </div>

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                title={statusModal.title}
                message={statusModal.message}
                type={statusModal.type}
            />
        </div>,
        document.body
    );
};
