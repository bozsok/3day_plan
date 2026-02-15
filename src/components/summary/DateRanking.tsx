
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { Calendar as CalendarIcon, Heart, Crown } from 'lucide-react';

interface DateRankingProps {
    intervals: { start: string; end: string; count: number; users: string[] }[];
}

export function DateRanking({ intervals }: DateRankingProps) {
    if (intervals.length === 0) return null;

    const winner = intervals[0];
    const runnersUp = intervals.slice(1);

    return (
        <section>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <CalendarIcon size={20} className="text-primary" />
                        Időpont Szavazás
                    </h2>
                    <p className="text-sm font-medium text-gray-400 mt-1">Melyik hétvége felel meg a legjobban?</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
                {/* 1. GYŐZTES KÁRTYA (Kiemelt) */}
                <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg shadow-primary/10 border-2 border-primary p-6 transform hover:scale-[1.02] transition-all duration-300 z-10 cursor-pointer">
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-primary text-gray-900 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase flex items-center gap-1">
                        <Crown size={12} fill="currentColor" /> LEGNÉPSZERŰBB
                    </div>
                    <div className="text-center pt-2">
                        <span className="block text-2xl font-extrabold text-primary mb-1">
                            {format(new Date(winner.start), 'MMM d.', { locale: hu })} - {format(new Date(winner.end), 'd.', { locale: hu })}
                        </span>
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {format(new Date(winner.start), 'EEE', { locale: hu })} - {format(new Date(winner.end), 'EEE', { locale: hu })}
                        </span>
                    </div>
                    <div className="mt-5 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex -space-x-2 overflow-hidden">
                            {winner.users.slice(0, 3).map((u, i) => (
                                <div key={i} className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600" title={u}>
                                    {u.charAt(0)}
                                </div>
                            ))}
                            {winner.users.length > 3 && (
                                <div className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                    +{winner.users.length - 3}
                                </div>
                            )}
                        </div>
                        <div className="text-primary font-bold text-lg flex items-center gap-1">
                            {winner.count} <Heart size={16} className="fill-current" />
                        </div>
                    </div>
                </div>

                {/* TOVÁBBI HELYEZETTEK */}
                {runnersUp.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                        <div className="text-center">
                            <span className="block text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors mb-1">
                                {format(new Date(item.start), 'MMM d.', { locale: hu })} - {format(new Date(item.end), 'd.', { locale: hu })}
                            </span>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {format(new Date(item.start), 'EEE', { locale: hu })} - {format(new Date(item.end), 'EEE', { locale: hu })}
                            </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex -space-x-2 overflow-hidden">
                                {item.users.slice(0, 2).map((u, i) => (
                                    <div key={i} className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600" title={u}>
                                        {u.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <div className="text-gray-400 font-bold text-sm">{item.count} db</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
