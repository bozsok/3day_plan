import { ArrowRight } from 'lucide-react';

interface SidebarActionsProps {
    totalCost: string | number;
    isMobile?: boolean;
    isPending: boolean;
    onVote: () => void;
    error?: string | null;
    onNavigateToSummary?: () => void;
    className?: string;
}

export function SidebarActions({
    totalCost,
    isMobile = false,
    isPending,
    onVote,
    error,
    onNavigateToSummary,
    className = ""
}: SidebarActionsProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Költség kártya */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-bold mb-1">Becsült összköltség</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900">{totalCost}</span>
                    <span className="text-sm font-bold text-gray-500 uppercase">Ft</span>
                    <span className="text-[10px] text-gray-400 ml-1">/ fő</span>
                </div>
            </div>

            {/* Hibaüzenet */}
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 animate-fade-in shadow-sm">
                    {error}
                </div>
            )}

            {/* Szavazás gomb */}
            <button
                onClick={onVote}
                disabled={isPending}
                className="w-full group bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg px-8 py-5 rounded-2xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <span className="animate-pulse">Mentés...</span>
                ) : (
                    <>
                        Erre szavazok
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            {/* Eredmények gomb (opcionális) */}
            {onNavigateToSummary && (
                <button
                    onClick={onNavigateToSummary}
                    className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Csak az eredmények érdekelnek
                </button>
            )}

            {!isMobile && (
                <p className="text-[10px] text-gray-400 text-center leading-relaxed px-4">
                    A szavazatoddal rögzíted a választott megyét és időpontot is.
                </p>
            )}
        </div>
    );
}
