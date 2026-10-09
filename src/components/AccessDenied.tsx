import React from "react";
import { ShieldAlert, LogOut, Lock } from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import NexPlayLogo from "./NexPlayLogo";

interface Props {
  userEmail?: string | null;
  onSignOut: () => void;
}

export default function AccessDenied({ userEmail, onSignOut }: Props) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onSignOut();
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

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

        {/* Access Denied Card */}
        <div className="w-full bg-[#090b14]/90 backdrop-blur-xl border-2 border-red-500/40 rounded-[28px] p-7 sm:p-9 shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col items-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-5 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse">
            <ShieldAlert size={36} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Lock size={12} />
            <span>Sitio Privado</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-2 font-display">
            Acceso Restringido
          </h2>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Esta página es totalmente <span className="text-red-400 font-semibold">privada</span> y está configurada para acceso exclusivo del propietario:
          </p>

          <div className="w-full mb-6">
            <strong className="text-cyan-300 font-mono text-xs sm:text-sm block bg-slate-900/80 py-2.5 px-3 rounded-xl border border-slate-700/80 shadow-inner break-all">
              Administrador Autorizado
            </strong>
          </div>

          {userEmail && (
            <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-6 text-xs text-slate-400">
              Iniciaste sesión actualmente como:
              <span className="text-slate-200 font-medium block mt-1 break-all">
                {userEmail}
              </span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            type="button"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <LogOut size={18} />
            <span>Cerrar sesión e intentar con otra cuenta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
