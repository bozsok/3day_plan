import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Save, Trash2 } from 'lucide-react';

interface UnsavedChangesModalProps {
    isOpen: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onCancel: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({ isOpen, onSave, onDiscard, onCancel }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-amber-600" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nem mentett változások!</h3>
                    <p className="text-gray-600 mb-6">
                        Van néhány módosítás, amit nem mentettél el. Ha most kilépsz, ezek a változások elvesznek. Mit szeretnél tenni?
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onSave}
                            className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <Save size={18} />
                            Mentés és Kilépés
                        </button>

                        <button
                            onClick={onDiscard}
                            className="w-full py-3 px-4 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            Változások elvetése
                        </button>

                        <button
                            onClick={onCancel}
                            className="w-full py-3 px-4 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                        >
                            Mégse, maradok szerkeszteni
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
