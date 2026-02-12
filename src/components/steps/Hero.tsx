import { ArrowRight, Compass } from 'lucide-react';

interface HeroProps {
    onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row items-stretch">
            {/* Bal oldal - Tartalom */}
            <div className="flex-1 p-8 md:p-14 lg:p-16 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-primary-dark font-bold text-[10px] tracking-widest uppercase">
                        Hosszúhétvége tervező
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                    Hétvégi kalandok, <br />
                    <span className="text-primary-dark">tervezés nélkül.</span>
                </h1>

                <p className="text-gray-600 text-lg mb-10 leading-relaxed max-w-md">
                    A két lépéses kiválasztási folyamat végére 3 napos útiterv-csomagok közül válogathatsz.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        className="group bg-primary hover:bg-primary-dark text-background-dark font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
                        onClick={onStart}
                    >
                        Kezdődjön a tervezés!
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Jobb oldal - Kép */}
            <div className="md:w-5/12 relative min-h-[300px] md:min-h-full">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDdhE2diREcbPyTac34i2jm3G4cfCG9Z-HKPhgaCTdU-1C4ggicmsUuDIwK95HpPEsmHo2Qs-kJ5jdFHg4P_Y3XDrmXO3qK3-3HkgW2pnkyVUKicIldV-nb_B2xZi9LsOC-vckuq9B4Y2NFKJ5wJT2cxQ8d5vpFzm7PN2JAvEcrFSdkWhpkoy6Azv4HHw7UGdgrRiOfabmAEWfpF0f_Rvp4sG1k2pTNGWbeSSk7HFOdPHjte-8Ort0RazuqQG3YxdZp3zwTcve8kk"
                    alt="Scenic Hungarian landscape"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 md:from-white/10 to-transparent pointer-events-none" />

                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl hidden lg:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Compass size={24} />
                    </div>
                    <div>
                        <p className="text-white text-xs font-bold uppercase tracking-tight">Kiemelt úti cél</p>
                        <p className="text-white/80 text-[10px]">Dunakanyar Panoráma • 3 nap</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
