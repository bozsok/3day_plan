import { useState } from 'react';
import { ArrowRight, Calendar, Map as MapIcon, Sparkles, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { StepCard } from '../common/StepCard';
import { StatusModal } from '../common/StatusModal';

interface HeroProps {
}

export function Hero({ }: HeroProps) {
    const navigate = useNavigate();
    const { user, login, isLoading } = useUser();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [showAdminWarning, setShowAdminWarning] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Kérlek add meg a neved!');
            return;
        }

        try {
            await login(name, '3nap2026');
            navigate('/terv/helyszin');
        } catch (err) {
            setError('Hiba történt a bejelentkezéskor. Próbáld újra!');
        }
    };

    const handleContinue = () => {
        navigate('/terv/helyszin');
    };

    const handleAdminClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (user) {
            window.open('#/admin', '_blank');
        } else {
            setShowAdminWarning(true);
        }
    };

    return (
        <StepCard id="hero-root-card" className="text-center" padding="p-[15px] min-[440px]:p-8 md:p-12">
            <div className="absolute top-4 right-4 z-20">
                <button
                    id="hero-admin-access-btn"
                    onClick={handleAdminClick}
                    className="bg-white/50 hover:bg-white text-gray-500 hover:text-primary text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm border border-transparent hover:border-gray-100 flex items-center gap-1"
                >
                    ⚙️ Admin
                </button>
            </div>

            {/* Dekorációs háttérelemek */}
            <div id="hero-bg-blob-top" className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div id="hero-bg-blob-bottom" className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl opacity-50" />

            <div id="hero-content-wrapper" className="relative z-10 max-w-3xl mx-auto">
                {user && (
                    <div id="hero-status-badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
                        <span id="hero-status-pulse" className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span id="hero-status-text" className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                            Hosszú Hétvége Tervező
                        </span>
                    </div>
                )}

                <h1 id="hero-main-title" className="max-[371px]:text-3xl text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                    {user ? (
                        <>
                            Tervezd meg a tökéletes <br />
                            <span id="hero-title-gradient-text" className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dark via-primary to-emerald-400">
                                hosszú hétvégét.
                            </span>
                            🌲
                        </>
                    ) : (
                        <>
                            Szia! <br />
                            <span id="hero-title-gradient-text" className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dark via-primary to-emerald-400">
                                Én egy hosszú hétvége tervező vagyok.
                            </span>
                        </>
                    )}
                </h1>

                <p id="hero-description-text" className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Néhány lépés, és máris készen állnak a közös programok.
                    {!user && (
                        <span className="italic">
                            <br /><br />
                            Ha most vagy itt először, írd be a neved a kezdéshez!
                        </span>
                    )}
                </p>




                {/* Feature Icons */}
                <div id="hero-features-container" className="hidden md:flex justify-center gap-8 md:gap-16 mb-12 text-gray-400">
                    <div id="feature-region-box" className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary-dark transition-colors">
                            <MapIcon size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Tájegység</span>
                    </div>
                    <div id="feature-program-box" className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary-dark transition-colors">
                            <Sparkles size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Program</span>
                    </div>
                    <div id="feature-timing-box" className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary-dark transition-colors">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Időzítés</span>
                    </div>
                </div>

                {/* Login Form / Welcome */}
                <div id="hero-auth-container" className="max-w-md mx-auto">
                    {user ? (
                        <div id="hero-auth-logged-in" className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                            <h3 id="welcome-user-title" className="text-xl font-bold text-gray-900 mb-2">
                                Szia, {user.name}! 👋
                            </h3>
                            <p id="welcome-user-subtitle" className="text-gray-600 mb-6 text-sm">
                                Folytasd a tervezést ott, ahol abbahagytad.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    id="action-start-plan-button"
                                    onClick={handleContinue}
                                    className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 group"
                                >
                                    Tervezés
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    id="action-view-results-button"
                                    onClick={() => navigate('/terv/osszegzes')}
                                    className="w-full bg-white border-2 border-gray-100 hover:border-primary/50 text-gray-600 hover:text-primary-dark font-bold text-lg px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Eredmények
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form id="login-form-wrapper" onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-4">
                            <div id="login-name-container" className="relative text-left">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Név</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Users size={18} />
                                    </div>
                                    <input
                                        id="login-name-input"
                                        type="text"
                                        placeholder="Hogy hívnak?"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setError('');
                                        }}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>


                            <button
                                id="login-submit-button"
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                                        Betöltés...
                                    </span>
                                ) : (
                                    <>
                                        Kezdés
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {error && (
                        <p id="hero-error-message" className="mt-3 text-red-500 text-sm font-medium animate-pulse">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            <StatusModal
                isOpen={showAdminWarning}
                onClose={() => setShowAdminWarning(false)}
                type="warning"
                title="Ajjaj! Nem vagy bejelentkezve... 🛑"
                message="Programcsomagot csak létező, névvel rendelkező résztvevő készíthet. Kérlek, előbb add meg a neved a folytatáshoz!"
                actionLabel="Értem"
            />
        </StepCard>
    );
}
