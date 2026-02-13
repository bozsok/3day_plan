import { useState } from 'react';
import { ArrowRight, Compass, Calendar, MapPin, Users } from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface HeroProps {
    onStart: () => void;
    onSkip?: () => void;
}

export function Hero({ onStart, onSkip }: HeroProps) {
    const { user, login, isLoading } = useUser();
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Kérlek add meg a neved!');
            return;
        }

        try {
            await login(name);
            onStart();
        } catch (err) {
            setError('Hiba történt a bejelentkezéskor. Próbáld újra!');
        }
    };

    // Ha már be van jelentkezve, csak a tovább gomb látszik (vagy automatikusan továbbvihetnénk)
    const handleContinue = () => {
        onStart();
    };

    return (
        <div className="relative overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:p-14 lg:p-20 text-center">
            {/* Dekorációs háttérelemek */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                        Hosszú Hétvége Tervező
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                    Tervezd meg a tökéletes <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dark via-primary to-emerald-400">
                        három napot.
                    </span>
                    🌲
                </h1>

                <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Kattints párat és már meg is kapod a 3 napos programcsomagokat.<br></br>
                    Ha most vagy itt először, akkor írd be a neved!
                </p>

                {/* Feature Icons */}
                <div className="flex justify-center gap-8 md:gap-16 mb-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary-dark transition-colors">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Időzítés</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary-dark transition-colors">
                            <Compass size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Tájegység</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary-dark transition-colors">
                            <MapPin size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Program</span>
                    </div>
                </div>

                {/* Login Form / Welcome */}
                <div className="max-w-md mx-auto">
                    {user ? (
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Szia, {user.name}! 👋
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                Folytasd a tervezést ott, ahol abbahagytad.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleContinue}
                                    className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 group"
                                >
                                    Tervezés folytatása
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                {onSkip && (
                                    <button
                                        onClick={onSkip}
                                        className="w-full bg-white border-2 border-gray-100 hover:border-primary/50 text-gray-600 hover:text-primary-dark font-bold text-lg px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        Eredmények megtekintése
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-2">
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Users size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Hogy hívnak?"
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-900 placeholder:text-gray-400 h-full"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setError('');
                                    }}
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isLoading ? 'Betöltés...' : 'Kezdés'}
                                <ArrowRight size={20} />
                            </button>
                        </form>
                    )}

                    {error && (
                        <p className="mt-3 text-red-500 text-sm font-medium animate-pulse">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
