
import { useState } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { counties, packages } from '../../data/mockData';

interface UserStatus {
    id: number;
    name: string;
}

interface UserProgress {
    hasDates: boolean;
    dates?: string[]; // Opcionális, de a backend küldi
    regionId: string | null;
    packageId: string | null;
    lastActive: number;
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

interface DesignerStatusProps {
    users: UserStatus[];
    userProgress?: Record<number, UserProgress>;
    detailedVotes?: DetailedVote[];
    onManageVotes?: () => void;
}

// Egységesített sor az összesítéshez
interface TableRow {
    id: string; // Egyedi azonosító (pl. vote-123 vagy progress-456)
    userId: number;
    userName: string;
    avatarUrl?: string;
    status: 'COMPLETED' | 'IN_PROGRESS';
    datesDisplay: string;
    regionDisplay: string;
    packageDisplay: string;
    timestamp: number;
}

export function DesignerStatus({ users, userProgress = {}, detailedVotes = [], onManageVotes, id }: DesignerStatusProps & { id?: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // 1. ADATELŐKÉSZÍTÉS: Sorok generálása
    const rows: TableRow[] = [];

    // A) KÉSZ (Leadott) szavazatok hozzáadása
    detailedVotes.forEach(vote => {
        let datesDisplay = '';
        if (vote.dates && vote.dates.length > 0) {
            const start = new Date(vote.dates[0]);
            const end = new Date(vote.dates[vote.dates.length - 1]);
            datesDisplay = `${format(start, 'MMM d.', { locale: hu })} - ${format(end, 'MMM d.', { locale: hu })}`;
        }

        const regionName = vote.regionId ? (counties.find(c => c.id === vote.regionId)?.name || vote.regionId) : '';
        const packageName = vote.packageId ? (packages.find(p => p.id === vote.packageId)?.title || vote.packageId) : '';

        rows.push({
            id: `vote-${vote.id}`,
            userId: vote.userId,
            userName: vote.userName,
            status: 'COMPLETED',
            datesDisplay,
            regionDisplay: regionName,
            packageDisplay: packageName,
            timestamp: typeof vote.timestamp === 'string' ? new Date(vote.timestamp).getTime() : vote.timestamp * 1000
        });
    });

    // B) FOLYAMATBAN lévő tervezések hozzáadása
    Object.entries(userProgress).forEach(([userIdStr, progress]) => {
        const userId = parseInt(userIdStr);

        // Ha már van leadott szavazata ebben a listában, akkor a "Függőben" lévőt csak akkor mutatjuk, 
        // ha az frissebb (máshol tart a tervezésben). De egyszerűség kedvéért mutassuk mindkettőt, 
        // a timestamp alapján úgyis sorrendbe kerülnek.

        const user = users.find(u => u.id === userId);
        if (!user) return;

        // Csak akkor mutatjuk, ha már elkezdett dátumot választani (Voksolási fázis)
        const hasVisibleProgress = progress.dates && progress.dates.length > 0;

        if (hasVisibleProgress) {
            const regionName = progress.regionId ? (counties.find(c => c.id === progress.regionId)?.name || progress.regionId) : '';
            const packageName = progress.packageId ? (packages.find(p => p.id === progress.packageId)?.title || progress.packageId) : '';

            let datesDisplay = '';
            if (progress.dates && Array.isArray(progress.dates) && progress.dates.length > 0) {
                const sortedDates = [...progress.dates].sort();
                const start = new Date(sortedDates[0]);
                const end = new Date(sortedDates[sortedDates.length - 1]);
                const rangeText = `${format(start, 'MMM d.', { locale: hu })} - ${format(end, 'MMM d.', { locale: hu })}`;

                if (progress.hasDates) {
                    datesDisplay = rangeText;
                } else {
                    datesDisplay = `${progress.dates.length} nap kiválasztva...`;
                }
            }

            rows.push({
                id: `progress-${userId}`,
                userId: userId,
                userName: user.name,
                status: 'IN_PROGRESS',
                datesDisplay,
                regionDisplay: regionName,
                packageDisplay: packageName,
                timestamp: progress.lastActive * 1000
            });
        }
    });

    rows.sort((a, b) => b.timestamp - a.timestamp);
    const displayedRows = isExpanded ? rows : rows.slice(0, 5);

    return (
        <section id={id || 'designer-status-root'} className="bg-surface rounded-2xl shadow-soft overflow-hidden mt-12 w-full transition-all">
            {/* Header */}
            <div id="designer-status-header" className="py-6 px-0 flex justify-between items-center">
                <h3 id="designer-status-title" className="text-2xl font-bold text-gray-900">Részletes szavazatok</h3>
                {onManageVotes && (
                    <button
                        id="designer-status-manage-btn"
                        onClick={onManageVotes}
                        className="flex items-center justify-center px-8 h-14 bg-gray-200 text-gray-400 rounded-2xl text-lg font-bold tracking-tight hover:bg-gray-300 hover:text-gray-600 transition-all active:scale-95"
                    >
                        <span>Szavazataim</span>
                    </button>
                )}
            </div>

            {/* Táblázat */}
            <div id="designer-status-table-container" className="overflow-x-auto w-full">
                <table id="designer-status-table" className="w-full text-left border-collapse min-w-[650px]">
                    <thead id="designer-status-thead">
                        <tr className="border-b border-border-subtle text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">
                            <th className="p-5">Tervező</th>
                            <th className="p-5">Időpont</th>
                            <th className="p-5">Helyszín</th>
                            <th className="p-5">Csomag</th>
                            <th className="p-5 text-right">Státusz</th>
                        </tr>
                    </thead>
                    <tbody id="designer-status-tbody" className="divide-y divide-border-subtle text-sm bg-gray-50/50">
                        {displayedRows.length === 0 ? (
                            <tr id="designer-status-empty-row">
                                <td colSpan={5} className="p-8 text-center text-content-muted italic">
                                    Még nem érkezett szavazat, de a tervezés már elindult...
                                </td>
                            </tr>
                        ) : (
                            displayedRows.map((row) => (
                                <tr id={`designer-status-row-${row.id}`} key={row.id} className="hover:bg-surface-hover transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div id={`designer-status-avatar-box-${row.userId}`} className="h-9 w-9 rounded-full bg-surface-alt flex items-center justify-center text-xs font-bold text-content-muted ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm">
                                                {row.avatarUrl ? <img src={row.avatarUrl} alt={row.userName} className="h-full w-full rounded-full object-cover" /> : row.userName.charAt(0)}
                                            </div>
                                            <span id={`designer-status-user-name-${row.userId}`} className="font-bold text-content-main">{row.userName}</span>
                                        </div>
                                    </td>

                                    <td id={`designer-status-cell-dates-${row.userId}`} className="p-5 text-content-muted font-medium">
                                        {row.datesDisplay || <span className="opacity-20">-</span>}
                                    </td>

                                    <td id={`designer-status-cell-region-${row.userId}`} className="p-5 text-content-muted font-medium">
                                        {row.regionDisplay || <span className="opacity-20">-</span>}
                                    </td>

                                    <td id={`designer-status-cell-package-${row.userId}`} className="p-5 text-content-muted font-medium">
                                        {row.packageDisplay || <span className="opacity-20">-</span>}
                                    </td>

                                    <td id={`designer-status-cell-status-${row.userId}`} className="p-5 text-right flex justify-end">
                                        {row.status === 'COMPLETED' ? (
                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                                                Végleges
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold text-[10px] tracking-widest uppercase">
                                                Függőben
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div id="designer-status-footer" className="p-4 border-t border-border-subtle text-center">
                <button
                    id="designer-status-expand-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-2 w-full py-2"
                >
                    {isExpanded ? 'Kevesebb mutatása' : `Összes résztvevő mutatása (${rows.length})`}
                    <span className="material-icons-outlined text-base">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                </button>
            </div>
        </section>
    );
}
