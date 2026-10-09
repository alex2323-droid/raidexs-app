import React from "react";
import { ShieldAlert, Lock, ShieldCheck, EyeOff, Server } from "lucide-react";
import NexPlayLogo from "./NexPlayLogo";

interface Props {
  onAdminLoginClick?: () => void;
}

export default function DeactivatedSite({ onAdminLoginClick }: Props) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-red-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-[#1e0826] via-[#030917] to-[#02050e] pointer-events-none"></div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ef4444 1px, transparent 1px), linear-gradient(to bottom, #ef4444 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Volumetric Spotlights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md mx-auto text-center flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6">
          <NexPlayLogo size="sm" showSubtitle={false} />
        </div>

        {/* Card */}
        <div className="w-full bg-[#090b14]/90 backdrop-blur-xl border-2 border-red-500/40 rounded-[28px] p-7 sm:p-9 shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col items-center">
          <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-2xl flex items-center justify-center mb-5 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
            <EyeOff size={42} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Lock size={12} />
            <span>Página Desactivada</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-3 font-display">
            Sitio Web Privado / Desactivado
          </h2>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Esta página web ha sido <span className="text-red-400 font-bold">desactivada para el público</span> por razones de mayor seguridad.
          </p>

          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 text-left flex flex-col gap-3.5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/10 text-red-400 rounded-lg shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xs text-slate-300">
                <strong className="block text-slate-100 font-semibold mb-0.5">Acceso exclusivo en Panel de Control</strong>
                El contenido y las funciones solo están disponibles para el propietario registrado desde su panel oficial.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <Server size={18} />
              </div>
              <div className="text-xs text-slate-300">
                <strong className="block text-slate-100 font-semibold mb-0.5">Estado del Servidor</strong>
                Servidor activo. Visitas públicas bloqueadas intencionalmente.
              </div>
            </div>
          </div>

          {onAdminLoginClick && (
            <button
              onClick={onAdminLoginClick}
              type="button"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-sm"
            >
              <ShieldAlert size={18} />
              <span>Acceso Administrador (Panel de Control)</span>
            </button>
          )}

          <p className="text-[11px] text-slate-500 mt-4 font-mono">
            ID: NEXPLAY-SECURITY-RESTRICTED-V1
          </p>
        </div>
      </div>
    </div>
  );
}
