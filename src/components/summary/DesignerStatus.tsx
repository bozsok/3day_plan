
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
import { ChevronDown, ChevronUp, Clock, Activity } from 'lucide-react';
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
}

// Egységesített sor az összesítéshez
interface TableRow {
    id: string; // Egyedi azonosító (pl. vote-123 vagy progress-456)
    userId: number;
    userName: string;
    status: 'COMPLETED' | 'IN_PROGRESS';
    datesDisplay: string;
    regionDisplay: string;
    packageDisplay: string;
    timestamp: number;
}

export function DesignerStatus({ users, userProgress = {}, detailedVotes = [], id }: DesignerStatusProps & { id?: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // 1. ADATELŐKÉSZÍTÉS: Sorok generálása
    const rows: TableRow[] = [];

    // A) KÉSZ (Leadott) szavazatok hozzáadása
    detailedVotes.forEach(vote => {
        // Dátum formázása
        let datesDisplay = '';
        if (vote.dates && vote.dates.length > 0) {
            const start = new Date(vote.dates[0]);
            const end = new Date(vote.dates[vote.dates.length - 1]);
            datesDisplay = `${format(start, 'MMM d.', { locale: hu })} - ${format(end, 'MMM d.', { locale: hu })}`;
        }

        // Régió és Csomag név keresése
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
            timestamp: typeof vote.timestamp === 'string' ? new Date(vote.timestamp).getTime() : vote.timestamp * 1000 // Backend timestamp kezelés
        });
    });

    // B) FOLYAMATBAN lévő tervezések hozzáadása
    // Csak akkor adjuk hozzá, ha tényleg van aktivitás (azaz nem üres progress)
    Object.entries(userProgress).forEach(([userIdStr, progress]) => {
        // SZŰRÉS: Ha nincs dátum, akkor csak nézelődik -> nem mutatjuk
        if (!progress.hasDates) return;

        const userId = parseInt(userIdStr);
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // Csak akkor tekintjük folyamatban lévőnek, ha van dátum választva (mert az a folyamat eleje)
        // VÉSZHELYZETI FIX: A 'datesDisplay' itt nem tudjuk pontosan, mert a progress csak boolean-t tárol ('hasDates').
        // A kérés szerint: "A dátum is dinamikusan jelenik meg".
        // DE: A progress API jelenleg nem küldi le a választott dátumokat, csak azt, hogy VAN-E.
        // Ezért itt egyelőre egy helyőrzőt vagy a 'Folyamatban...' szöveget kell használnunk a dátum helyett,
        // AMÍG a backend nem küldi a pontos draft adatokat.
        // Mivel a kérés szigorú ("Ne törjön el a kód"), nem kockáztatok újabb backend hívással most.
        // Megjelenítjük, amit tudunk: státuszjelzőket.

        if (progress.hasDates || progress.regionId || progress.packageId) {
            // Régió és Csomag név keresése (itt megvannak az ID-k!)
            const regionName = progress.regionId ? (counties.find(c => c.id === progress.regionId)?.name || progress.regionId) : '';
            const packageName = progress.packageId ? (packages.find(p => p.id === progress.packageId)?.title || progress.packageId) : '';

            // Dátum megjelenítése: Ha van konkrét dátum, azt írjuk ki
            let datesDisplay = progress.hasDates ? 'Dátum kiválasztva...' : '';
            if (progress.dates && Array.isArray(progress.dates) && progress.dates.length > 0) {
                const start = new Date(progress.dates[0]);
                const end = new Date(progress.dates[progress.dates.length - 1]);
                datesDisplay = `${format(start, 'MMM d.', { locale: hu })} - ${format(end, 'MMM d.', { locale: hu })}`;
            }

            rows.push({
                id: `progress-${userId}`,
                userId: userId,
                userName: user.name,
                status: 'IN_PROGRESS',
                datesDisplay, // Ez most kompromisszumos
                regionDisplay: regionName,
                packageDisplay: packageName,
                timestamp: progress.lastActive * 1000 // Sec -> MS konverzió
            });
        }
    });

    // Rendezés: Legfrissebb felül
    rows.sort((a, b) => b.timestamp - a.timestamp);

    // Megjelenítendő sorok (Max 5 vagy mind)
    const displayedRows = isExpanded ? rows : rows.slice(0, 5);

    return (
        <section id={id} className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-12 w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="text-primary" size={20} />
                    Részletes Szavazatok
                </h3>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    Összesen: {rows.length}
                </span>
            </div>

            {/* Táblázat */}
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-card-dark text-xs font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                            <th className="p-5 w-1/4">Tervező</th>
                            <th className="p-5 w-1/6">Státusz</th>
                            <th className="p-5 w-1/5">Dátum</th>
                            <th className="p-5 w-1/6">Helyszín</th>
                            <th className="p-5 w-1/6 text-left">Csomag</th>
                            <th className="p-5 w-1/6 text-right">Aktivitás</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                        {displayedRows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                                    Még nem érkezett szavazat, de a tervezés már elindult...
                                </td>
                            </tr>
                        ) : (
                            displayedRows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    {/* Név + Avatar */}
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm">
                                                {row.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{row.userName}</div>
                                                {/* Dinamikus csomag kijelzés mobilon vagy alcímként */}
                                                {row.packageDisplay && (
                                                    <div className="text-xs text-primary font-medium md:hidden">
                                                        {row.packageDisplay}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Státusz */}
                                    <td className="p-5">
                                        {row.status === 'COMPLETED' ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 shadow-sm">
                                                KÉSZ
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-sm animate-pulse">
                                                FOLYAMATBAN
                                            </span>
                                        )}
                                    </td>

                                    {/* Dátum (Dinamikus) */}
                                    <td className="p-5 text-gray-700 dark:text-gray-300 font-medium">
                                        {row.datesDisplay || <span className="text-gray-300 dark:text-gray-600">-</span>}
                                    </td>

                                    {/* Helyszín */}
                                    <td className="p-5">
                                        <span className="font-bold text-gray-800 dark:text-gray-200">
                                            {row.regionDisplay || <span className="text-gray-300 dark:text-gray-600 font-normal">-</span>}
                                        </span>
                                    </td>

                                    {/* Csomag */}
                                    <td className="p-5">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {row.packageDisplay || <span className="text-gray-300 dark:text-gray-600 font-normal">-</span>}
                                        </span>
                                    </td>

                                    {/* Aktivitás (Relatív idő) */}
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                                            <Clock size={12} className="opacity-70" />
                                            {formatDistanceToNow(row.timestamp, { addSuffix: true, locale: hu })}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Expand / Collapse Button */}
            {rows.length > 5 && (
                <div className="p-0 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        {isExpanded ? (
                            <>Kevesebb mutatása <ChevronUp size={14} /></>
                        ) : (
                            <>Összes résztvevő mutatása ({rows.length}) <ChevronDown size={14} /></>
                        )}
                    </button>
                </div>
            )}
        </section>
    );
}
