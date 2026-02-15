import { Users, Calendar, MapPin, Package } from 'lucide-react';

interface UserStatus {
    id: number;
    name: string;
    isComplete: boolean;
    datesCount: number;
    votesCount: number;
}

interface UserProgress {
    hasDates: boolean;
    regionId: string | null;
    packageId: string | null;
    lastActive: number;
}

interface DesignerStatusProps {
    users: UserStatus[];
    userProgress?: Record<number, UserProgress>;
}

export function DesignerStatus({ users, userProgress = {}, id }: DesignerStatusProps & { id?: string }) {
    // Csak a teljesen kész tervezők (Dátum + Szavazat)
    const completedUsers = users.filter(u => u.isComplete);
    // Mindenki más, aki még hiányos vagy meg sem kezdte
    const incompleteUsers = users.filter(u => !u.isComplete);

    return (
        <div id={id} className="mt-12 space-y-12">
            {/* 1. KÉSZ Tervezők - Akik már leadták az érvényes tervüket */}
            {completedUsers.length > 0 && (
                <div id="designer-status-active-section">
                    <div id="designer-status-active-header" className="flex items-center gap-3 mb-8">
                        <div id="designer-status-active-icon-box" className="w-10 h-10 rounded-full bg-primary text-zinc-900 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Users size={20} />
                        </div>
                        <h2 id="designer-status-active-title" className="text-xl font-bold text-gray-900">Kész Tervezők</h2>
                    </div>
                    <div id="designer-status-active-grid" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {completedUsers.map(u => {
                            const progress = userProgress[u.id];
                            const hasProgress = progress && (progress.hasDates || progress.regionId || progress.packageId);

                            return (
                                <div
                                    key={u.id}
                                    id={`designer-status-user-card-${u.id}`}
                                    className="p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[110px] bg-primary/5 border-primary/20 shadow-sm"
                                >
                                    <p id={`designer-status-user-name-${u.id}`} className="font-bold text-gray-900 truncate">{u.name}</p>

                                    <div id={`designer-status-user-badge-${u.id}`} className="relative w-fit">
                                        <span className="text-[10px] font-black bg-primary text-zinc-900 px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm shadow-primary/20">
                                            Kész
                                        </span>
                                        {/* Szavazatok száma - Piros Értesítő Badge */}
                                        <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm border border-white z-10" title={`${u.votesCount} érvényes szavazat`}>
                                            {u.votesCount}
                                        </span>
                                    </div>

                                    {/* Ha újratervezést kezdett, mutassuk a státuszát */}
                                    {hasProgress && (
                                        <div id={`designer-status-user-restart-${u.id}`} className="mt-3 pt-2 border-t border-primary/10 w-full">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                                                <span className="font-bold text-[10px] uppercase tracking-wide">Új terv:</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                            </div>
                                            <div className="flex items-center justify-around bg-white/60 rounded-lg p-1.5 border border-primary/5">
                                                <Calendar size={14} className={progress.hasDates ? 'text-primary fill-primary/20' : 'text-gray-300'} />
                                                <div className="w-px h-3 bg-gray-200"></div>
                                                <MapPin size={14} className={progress.regionId ? 'text-primary fill-primary/20' : 'text-gray-300'} />
                                                <div className="w-px h-3 bg-gray-200"></div>
                                                <Package size={14} className={progress.packageId ? 'text-primary fill-primary/20' : 'text-gray-300'} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. Hiányos vagy még meg nem kezdett tervezők */}
            {incompleteUsers.length > 0 && (
                <div id="designer-status-pending-section" className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
                    <div id="designer-status-pending-header" className="flex items-center gap-3 mb-6">
                        <div id="designer-status-pending-icon-box" className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <h2 id="designer-status-pending-title" className="text-lg font-bold text-gray-500">Még úton vannak felénk...</h2>
                    </div>
                    <div id="designer-status-pending-tags-list" className="flex flex-wrap gap-3">
                        {incompleteUsers.map(u => {
                            const progress = userProgress[u.id];
                            const hasProgress = progress && (progress.hasDates || progress.regionId || progress.packageId);

                            return (
                                <div key={u.id} id={`designer-status-user-pill-${u.id}`} className="px-5 py-2.5 rounded-full bg-white text-gray-600 border border-gray-200 text-sm font-medium flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
                                    <span className={`w-2 h-2 rounded-full ${hasProgress ? 'bg-primary animate-pulse' : 'bg-gray-300'}`}></span>
                                    <span className="truncate max-w-[120px] font-bold">{u.name}</span>

                                    {hasProgress && (
                                        <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-gray-100">
                                            <Calendar size={14} className={progress.hasDates ? 'text-primary' : 'text-gray-200'} />
                                            <MapPin size={14} className={progress.regionId ? 'text-primary' : 'text-gray-200'} />
                                            <Package size={14} className={progress.packageId ? 'text-primary' : 'text-gray-200'} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
