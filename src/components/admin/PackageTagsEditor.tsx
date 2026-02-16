import React, { useState } from 'react';
import type { PackageTag } from '../../data/mockData';

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
        const newTags = [...tags, tag];
        onChange(newTags);
    };

    return (
        <div id="admin-tags-editor-root" className="space-y-6">
            {/* Input Area - Clean Design */}
            <div id="admin-tags-input-area" className="flex gap-3 items-stretch">
                {/* Icon Selector */}
                <div id="admin-tags-icon-wrapper" className="relative">
                    <button
                        id="admin-tags-icon-trigger"
                        onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                        className="w-[52px] h-[52px] text-2xl bg-white rounded-xl border-2 border-gray-200 hover:border-primary focus:border-primary focus:ring-4 focus:ring-primary/10 flex items-center justify-center transition-all shadow-sm"
                        title="Válassz ikont"
                    >
                        {newTagIcon}
                    </button>

                    {isIconPickerOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsIconPickerOpen(false)} />
                            <div id="admin-tags-icon-popover" className="absolute top-full mt-2 left-0 z-50 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 w-72 grid grid-cols-6 gap-2 animate-in fade-in zoom-in-95 duration-200">
                                {TAG_ICONS.map((icon) => (
                                    <button
                                        key={icon}
                                        id={`admin-tags-icon-option-${icon}`}
                                        onClick={() => { setNewTagIcon(icon); setIsIconPickerOpen(false); }}
                                        className={`text-xl p-2 rounded-xl hover:bg-gray-100 transition-colors ${newTagIcon === icon ? 'bg-primary/10 ring-2 ring-primary/30' : ''}`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Text Input */}
                <div id="admin-tags-text-wrapper" className="flex-1 relative">
                    <input
                        id="admin-tags-input-search"
                        type="text"
                        value={newTagLabel}
                        onChange={(e) => setNewTagLabel(e.target.value)}
                        className="w-full h-[52px] pl-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal transition-all"
                        placeholder="Írj egy jellemzőt (pl. Családbarát)..."
                        onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    />
                    <button
                        id="admin-tags-button-add"
                        onClick={addTag}
                        disabled={!newTagLabel.trim()}
                        className="absolute right-2 top-2 h-[36px] w-[36px] bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Quick Suggestions */}
            <div id="admin-tags-suggestions-area" className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map((tag, i) => (
                    <button
                        key={tag.label}
                        id={`admin-tags-option-${i}`}
                        onClick={() => handleSuggestionClick(tag)}
                        className="text-xs font-bold bg-white text-gray-500 px-3 py-1.5 rounded-full border-2 border-gray-100 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1.5"
                    >
                        <span>{tag.icon}</span>
                        {tag.label}
                    </button>
                ))}
            </div>

            {/* Active Tags */}
            <div id="admin-tags-active-list" className="bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-300 min-h-[100px]">
                {tags.length === 0 ? (
                    <div id="admin-tags-empty-state" className="h-full flex flex-col items-center justify-center text-gray-400 text-sm italic">
                        <span className="text-2xl mb-2 opacity-50">🏷️</span>
                        Még nincsenek címkék kiválasztva.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {tags.map((tag, index) => (
                            <div key={index} id={`admin-tags-active-item-${index}`} className="flex items-center gap-2 pl-3 pr-2 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group animate-in zoom-in-50 duration-200">
                                <span className="text-xl">{tag.icon}</span>
                                <span className="font-bold text-gray-700 text-sm">{tag.label}</span>
                                <button
                                    id={`admin-tags-button-delete-${index}`}
                                    onClick={() => removeTag(index)}
                                    className="ml-1 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
