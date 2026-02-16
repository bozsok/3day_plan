import React from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, RotateCcw, Calendar, MapPin, User, Package } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

interface UserStatus {
    id: number;
    name: string;
}

interface DetailedVote {
    id: number;
    userId: number;
    userName: string;
    dates: string[];
    regionId?: string;
    packageId?: string;
    timestamp: number;
}

interface SummaryAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
    onDeleteVote: (userId: number) => void;
    onDeleteUser: (userId: number) => void;
    adminStatus: string | null;
    detailedVotes: DetailedVote[];
    userStatuses: UserStatus[];
    allPackages: any[];
    counties: any[];
}

export const SummaryAdminModal: React.FC<SummaryAdminModalProps> = ({
    isOpen,
    onClose,
    onReset,
    onDeleteVote,
    onDeleteUser,
    adminStatus,
    detailedVotes,
    userStatuses,
    allPackages,
    counties
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div
            id="summary-admin-overlay"
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                id="summary-admin-panel"
                className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border-4 border-red-500 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            >
                <div id="summary-admin-header" className="flex justify-between items-center mb-6 shrink-0">
                    <h2 id="summary-admin-title" className="text-2xl font-bold text-red-600 flex items-center gap-2">
                        🛠️ RENDSZERGAZDA
                    </h2>
                    <button
                        id="summary-admin-close-btn"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-900 font-bold p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {adminStatus && (
                    <div id="summary-admin-status-msg" className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center font-bold text-gray-800 animate-in slide-in-from-top-2 shrink-0">
                        {adminStatus}
                    </div>
                )}

                <div className="flex-1 overflow-hidden flex flex-col gap-6">
                    {/* Globális műveletek */}
                    <div className="shrink-0">
                        <button
                            id="summary-admin-reset-btn"
                            onClick={onReset}
                            className="w-full font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all bg-red-600 hover:bg-red-700 text-white hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={20} />
                            ☢️ TELJES ADATBÁZIS TÖRLÉS (RESET)
                        </button>
                    </div>

                    {/* Felhasználók és szavazatok lista */}
                    <div id="summary-admin-vote-list" className="border-t border-gray-200 pt-4 flex-1 overflow-hidden flex flex-col">
                        <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <User size={18} />
                            Felhasználók és szavazatok ({userStatuses.length}):
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {userStatuses.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center italic py-4">Nincs felhasználó a rendszerben.</p>
                            ) : (
                                userStatuses.map(user => {
                                    // Megkeressük a felhasználó szavazatát
                                    const vote = detailedVotes.find(v => v.userId === user.id);
                                    const hasVote = !!vote;

                                    // Adatok előkészítése megjelenítéshez
                                    const regionName = vote?.regionId ? (counties.find(c => c.id === vote.regionId)?.name || vote.regionId) : '-';
                                    const packageTitle = vote?.packageId ? (allPackages.find(p => p.id === vote.packageId)?.title || 'Ismeretlen csomag') : '-';

                                    let datesDisplay = '-';
                                    if (vote?.dates && vote.dates.length > 0) {
                                        const start = new Date(vote.dates[0]);
                                        const end = new Date(vote.dates[vote.dates.length - 1]);
                                        datesDisplay = `${format(start, 'MMM d.', { locale: hu })} - ${format(end, 'MMM d.', { locale: hu })}`;
                                    }

                                    return (
                                        <div key={user.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors group">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                <div className="flex-1 w-full">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-bold text-gray-900 text-lg">{user.name}</span>
                                                        <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">ID: {user.id}</span>
                                                        {!hasVote && <span className="text-xs text-gray-400 italic ml-2">(Nincs aktív szavazat)</span>}
                                                    </div>

                                                    {hasVote && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                                                            <div className="flex items-center gap-1.5" title="Helyszín">
                                                                <MapPin size={14} className="text-gray-400" />
                                                                <span className="truncate max-w-[150px]">{regionName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5" title="Időpont">
                                                                <Calendar size={14} className="text-gray-400" />
                                                                <span>{datesDisplay}</span>
                                                            </div>
                                                            {(vote?.packageId) && (
                                                                <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5 mt-1" title="Csomag">
                                                                    <Package size={14} className="text-gray-400" />
                                                                    <span className="truncate text-xs font-medium text-gray-500">{packageTitle}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                                    {hasVote && (
                                                        <button
                                                            id={`summary-admin-reset-vote-btn-${user.id}`}
                                                            onClick={() => onDeleteVote(user.id)}
                                                            className="flex-1 sm:w-32 px-3 py-2 rounded-lg text-xs font-bold transition-all bg-white text-orange-500 hover:bg-orange-50 border border-orange-200 hover:border-orange-300 flex items-center justify-center gap-2 shadow-sm"
                                                            title="Csak a szavazat visszavonása"
                                                        >
                                                            <RotateCcw size={14} /> Visszavon
                                                        </button>
                                                    )}
                                                    <button
                                                        id={`summary-admin-delete-user-btn-${user.id}`}
                                                        onClick={() => onDeleteUser(user.id)}
                                                        className="flex-1 sm:w-32 px-3 py-2 rounded-lg text-xs font-bold transition-all bg-white text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 flex items-center justify-center gap-2 shadow-sm"
                                                        title="Felhasználó és adatai végleges törlése"
                                                    >
                                                        <Trash2 size={14} /> Törlés
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
