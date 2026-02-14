import { Users } from 'lucide-react';

interface UserStatus {
    id: number;
    name: string;
    isComplete: boolean;
    datesCount: number;
    votesCount: number;
}

interface DesignerStatusProps {
    users: UserStatus[];
}

export function DesignerStatus({ users, id }: DesignerStatusProps & { id?: string }) {
    const activeUsers = users.filter(u => u.datesCount > 0 || u.votesCount > 0);
    const pendingUsers = users.filter(u => u.datesCount === 0 && u.votesCount === 0);

    return (
        <div id={id} className="mt-12 space-y-8">
            {/* 1. Aktív Szavazók */}
            {activeUsers.length > 0 && (
                <div id="designer-status-active-section" className="bg-gray-900 text-white rounded-2xl min-[440px]:rounded-3xl p-[15px] min-[440px]:p-8">
                    <div id="designer-status-active-header" className="flex items-center gap-3 mb-6">
                        <div id="designer-status-active-icon-box" className="w-10 h-10 rounded-xl bg-gray-800 text-green-400 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <h2 id="designer-status-active-title" className="text-xl font-bold">Aktív Tervezők</h2>
                    </div>
                    <div id="designer-status-active-grid" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {activeUsers.map(u => (
                            <div key={u.id} id={`designer-status-user-card-${u.id}`} className={`p-4 rounded-xl border ${u.isComplete ? 'bg-green-500/20 border-green-500/50' : 'bg-gray-800 border-gray-700'}`}>
                                <p id={`designer-status-user-name-${u.id}`} className="font-bold truncate mb-1">{u.name}</p>
                                <div id={`designer-status-user-stats-${u.id}`} className="text-xs space-y-1 opacity-80">
                                    <p id={`designer-status-user-dates-${u.id}`}>🗓️ {u.datesCount > 0 ? '✅' : '❌'}</p>
                                    <p id={`designer-status-user-votes-${u.id}`}>🗳️ {u.votesCount > 0 ? '✅' : '❌'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Még nem szavaztak */}
            {pendingUsers.length > 0 && (
                <div id="designer-status-pending-section" className="bg-white border border-gray-200 rounded-2xl min-[440px]:rounded-3xl p-[15px] min-[440px]:p-8">
                    <div id="designer-status-pending-header" className="flex items-center gap-3 mb-6">
                        <div id="designer-status-pending-icon-box" className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <h2 id="designer-status-pending-title" className="text-xl font-bold text-gray-400">Még várjuk a szavazatukat...</h2>
                    </div>
                    <div id="designer-status-pending-tags-list" className="flex flex-wrap gap-3">
                        {pendingUsers.map(u => (
                            <div key={u.id} id={`designer-status-user-pill-${u.id}`} className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-sm font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                {u.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
