import React, { useState } from 'react';
import type { PackageTag } from '../../data/mockData';
import { HelpTooltip } from '../common/HelpTooltip';
import { Plus, Trash2 } from 'lucide-react';
import { PREDEFINED_TAGS, TAG_ICONS } from '../../utils/constants';

interface PackageTagsEditorProps {
    tags: PackageTag[];
    onChange: (tags: PackageTag[]) => void;
}

export const PackageTagsEditor: React.FC<PackageTagsEditorProps> = ({ tags, onChange }) => {
    const [newTagLabel, setNewTagLabel] = useState('');
    const [newTagIcon, setNewTagIcon] = useState('🌟');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    const addTag = () => {
        if (!newTagLabel.trim()) return;
        const newTag: PackageTag = { label: newTagLabel, icon: newTagIcon };
        onChange([...tags, newTag]);
        setNewTagLabel('');
        setNewTagIcon('🌟');
        setIsIconPickerOpen(false);
    };

    const removeTag = (index: number) => {
        const newTags = [...tags];
        newTags.splice(index, 1);
        onChange(newTags);
    };

    const handleSuggestionClick = (tag: { label: string, icon: string }) => {
        // Azonnal hozzáadjuk, nem kell a formot kitölteni
        const newTags = [...tags, tag];
        onChange(newTags);
        // Opcionális: visszajelzés vagy semmi, mivel azonnal bekerül a listába
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🏷️ Új Címke Hozzáadása
                    <HelpTooltip text="A címkék ikonokkal jelennek meg a kártyán, segítve a gyors tájékozódást (pl. Wellness, Túra)." />
                </h3>

                <div className="flex gap-4 items-start">
                    {/* Ikon Választó */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Ikon</label>
                        <button
                            onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                            className="w-16 h-[50px] text-2xl bg-white rounded-xl border border-gray-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 flex items-center justify-center transition-all shadow-sm"
                        >
                            {newTagIcon}
                        </button>

                        {isIconPickerOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsIconPickerOpen(false)} />
                                <div className="absolute top-16 left-0 z-20 bg-white p-3 rounded-xl shadow-xl border border-gray-100 w-64 grid grid-cols-6 gap-2 animate-in fade-in zoom-in-95 duration-200">
                                    {TAG_ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => { setNewTagIcon(icon); setIsIconPickerOpen(false); }}
                                            className={`text-xl p-2 rounded-lg hover:bg-gray-100 transition-colors ${newTagIcon === icon ? 'bg-blue-50 ring-2 ring-blue-500/20' : ''}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Szöveges Mező */}
                    <div className="flex-1 space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Megnevezés</label>
                            <input
                                type="text"
                                value={newTagLabel}
                                onChange={(e) => setNewTagLabel(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-primary shadow-sm"
                                placeholder="Pl. Családbarát"
                                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                            />
                        </div>

                        {/* Javaslatok */}
                        <div className="flex flex-wrap gap-2">
                            {PREDEFINED_TAGS.map((tag) => (
                                <button
                                    key={tag.label}
                                    onClick={() => handleSuggestionClick(tag)}
                                    className="text-xs font-medium bg-white text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1.5"
                                >
                                    <span>{tag.icon}</span>
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hozzáadás Gomb */}
                    <div className="mt-6">
                        <button
                            onClick={addTag}
                            className="bg-primary hover:bg-primary-dark text-white font-bold h-[50px] px-6 rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Hozzáad
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Beállított Címkék ({tags.length})</h3>
                {tags.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">
                        Nincs még címke hozzáadva.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {tags.map((tag, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                                <span className="text-xl bg-gray-50 w-8 h-8 flex items-center justify-center rounded-md">{tag.icon}</span>
                                <span className="font-bold text-gray-700 text-sm">{tag.label}</span>
                                <button
                                    onClick={() => removeTag(index)}
                                    className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
