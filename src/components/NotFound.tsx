import { ArrowLeft, Home, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import NexPlayLogo from "./NexPlayLogo";

interface Props {
  onGoHome: () => void;
  onGoSupport?: () => void;
}

export default function NotFound({ onGoHome, onGoSupport }: Props) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 text-center">
      <div className="relative w-full max-w-lg bg-[#040e22]/90 border-2 border-cyan-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,210,255,0.2)] overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-4">
            <NexPlayLogo size="sm" showSubtitle={false} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <AlertCircle size={14} />
            <span>Error 404 • Enlace No Encontrado</span>
          </div>

          <h1 className="text-6xl sm:text-7xl font-black font-display text-white tracking-tight leading-none mb-3">
            4<span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(0,210,255,0.7)]">0</span>4
          </h1>

          <h2 className="text-xl font-bold text-white mb-2 font-display">
            ¡Ups! Esta página no existe
          </h2>

          <p className="text-sm text-slate-300 max-w-sm mb-8 leading-relaxed">
            La sección o juego que buscas no está disponible o el enlace ha cambiado. Regresa a nuestro catálogo para continuar tu recarga.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={onGoHome}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,210,255,0.4)] transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Home size={18} />
              <span>Volver a la Tienda</span>
            </button>

            {onGoSupport && (
              <button
                onClick={onGoSupport}
                className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare size={18} className="text-cyan-400" />
                <span>Contactar Soporte</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
