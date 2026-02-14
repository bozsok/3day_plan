import { useEffect, useState } from 'react';
import { api, type VoteBlock } from '../../api/client';
import { useUser } from '../../context/UserContext';
import { X, Trash2, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { counties } from '../../data/mockData';

interface VoteManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVoteDeleted: () => void; // Callback to refresh summary
}

export function VoteManagementModal({ isOpen, onClose, onVoteDeleted }: VoteManagementModalProps) {
    const { user } = useUser();
    const [votes, setVotes] = useState<VoteBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load votes whenever modal opens
    useEffect(() => {
        if (isOpen && user) {
            loadVotes();
        }
    }, [isOpen, user]);

    const loadVotes = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const list = await api.votes.list(user.id);
            setVotes(list);
        } catch (err) {
            console.error('Failed to load votes:', err);
            setError('Nem sikerült betölteni a szavazatokat.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (blockId: number) => {
        if (!user) return;

        // UI-based confirmation or immediate delete (User asked to remove popups)
        // For now: Immediate delete with optimisitc update is standard in modern UIs for this type of list

        setDeletingId(blockId);
        try {
            await api.votes.revoke(user.id, blockId);
            // Remove from local list immediately
            setVotes(prev => prev.filter(v => v.id !== blockId));
            // Notify parent to refresh counts
            onVoteDeleted();
        } catch (err) {
            console.error('Failed to delete vote:', err);
            setError('Hiba történt a törléskor.');
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl min-[440px]:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">

                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🗳️ Leadott Szavazataim
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Betöltés...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500 flex flex-col items-center gap-2">
                            <AlertCircle />
                            {error}
                        </div>
                    ) : votes.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p className="mb-2 text-4xl">📭</p>
                            <p>Még nem adtál le szavazatot.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {votes.map((vote) => {
                                const regionName = counties.find(r => r.id === vote.regionId)?.name ?? vote.regionId;
                                const sortedDates = [...vote.dates].sort();
                                const start = sortedDates[0];
                                const end = sortedDates[sortedDates.length - 1];
                                const dateStr = start && end
                                    ? `${format(new Date(start), 'MMM d.', { locale: hu })} - ${format(new Date(end), 'MMM d.', { locale: hu })}`
                                    : 'Ismeretlen dátum';

                                return (
                                    <div key={vote.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white transition-all group">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 font-bold text-gray-800">
                                                <MapPin size={16} className="text-primary-dark" />
                                                {regionName}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-md w-fit">
                                                <Calendar size={14} />
                                                {dateStr}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(vote.id)}
                                            disabled={deletingId === vote.id}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                            title="Törlés"
                                        >
                                            {deletingId === vote.id ? (
                                                <span className="animate-spin">⏳</span>
                                            ) : (
                                                <Trash2 size={20} />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-400">
                    A törlés azonnal megtörténik és mindenkinél frissül.
                </div>
            </div>
        </div>
    );
}
