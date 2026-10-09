import { Globe, Zap, ShieldCheck } from 'lucide-react';
import { Game } from '../types';

interface Props {
  game: Game;
}

export default function Hero({ game }: Props) {
  return (
    <section className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-[#050b14]/60 to-transparent z-10 pointer-events-none"></div>
      <img 
        alt={`${game.name} game banner`} 
        className="w-full h-full object-cover object-center opacity-70" 
        src={game.bannerUrl || game.cardUrl || undefined} 
      />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 absolute inset-0 z-20 flex flex-col justify-end pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl shrink-0">
            <img 
              src={game.cardUrl || game.bannerUrl || ''} 
              alt={game.name} 
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                <Globe size={12} /> Global
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[11px] font-bold">
                <Zap size={12} /> Instantáneo
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                <ShieldCheck size={12} /> Seguro
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
              {game.name}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
              {(game.publisher && !game.publisher.toLowerCase().includes('hank') ? game.publisher : 'Recarga oficial y autorizada')} • Entrega directa en cuenta
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

