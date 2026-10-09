import { useState, useEffect } from "react";
import { Cookie, Shield, Check, X, Settings2, Lock } from "lucide-react";

export interface CookiePreferences {
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
  timestamp: number;
}

interface Props {
  onOpenLegalTab?: (tab: "cookies" | "privacy" | "terms") => void;
}

export const COOKIE_STORAGE_KEY = "raidexs_cookie_consent_v1";

export default function CookieConsentBanner({ onOpenLegalTab }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    preferences: true,
    analytics: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!saved) {
        // Show after a brief delay for smoother entry
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // In restricted environments, do not block
    }
  }, []);

  // Listen to custom window event to re-open settings from the footer
  useEffect(() => {
    const handleReopen = () => {
      setIsVisible(true);
      setShowConfig(true);
    };

    window.addEventListener("open-cookie-settings", handleReopen);
    return () => window.removeEventListener("open-cookie-settings", handleReopen);
  }, []);

  const savePreferences = (prefs: {
    essential: boolean;
    preferences: boolean;
    analytics: boolean;
  }) => {
    try {
      const data: CookiePreferences = {
        ...prefs,
        essential: true, // Always essential
        timestamp: Date.now(),
      };
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
    setIsVisible(false);
    setShowConfig(false);
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, preferences: true, analytics: true });
  };

  const handleEssentialOnly = () => {
    savePreferences({ essential: true, preferences: false, analytics: false });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-5 flex justify-center pointer-events-none animate-in slide-in-from-bottom duration-300"
      role="region"
      aria-label="Aviso de cookies y consentimiento"
    >
      <div className="w-full max-w-4xl bg-[#030917]/95 backdrop-blur-xl border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_40px_rgba(0,210,255,0.25)] pointer-events-auto text-slate-100 flex flex-col gap-4">
        {/* Main Banner Message */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,210,255,0.3)]">
              <Cookie size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-white font-display flex items-center gap-2">
                Respetamos tu Privacidad y Datos
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Utilizamos cookies esenciales para la autenticación de tu cuenta y el funcionamiento de la tienda, así como cookies opcionales para recordar tus preferencias y optimizar la velocidad del sitio. Puedes aceptar todas o personalizar tu elección.
              </p>
            </div>
          </div>

          <button
            onClick={handleEssentialOnly}
            className="sm:hidden text-slate-400 hover:text-white p-1 self-end"
            aria-label="Cerrar aviso con solo esenciales"
          >
            <X size={18} />
          </button>
        </div>

        {/* Granular Configuration Panel (if expanded) */}
        {showConfig && (
          <div className="pt-3 border-t border-cyan-900/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            {/* Essential */}
            <div className="p-3 bg-[#05132d] border border-cyan-500/30 rounded-2xl space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock size={13} className="text-cyan-400" /> Esenciales
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    Requeridas
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Necesarias para iniciar sesión, verificar compras y seguridad del sitio.
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div className="p-3 bg-[#05132d] border border-cyan-500/30 rounded-2xl space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Settings2 size={13} className="text-blue-400" /> Preferencias
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={(e) =>
                        setPreferences({ ...preferences, preferences: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Recuerda tu correo al iniciar sesión y tu configuración visual.
                </p>
              </div>
            </div>

            {/* Analytics */}
            <div className="p-3 bg-[#05132d] border border-cyan-500/30 rounded-2xl space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield size={13} className="text-emerald-400" /> Rendimiento
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Métricas anónimas para evaluar velocidad de carga y prevenir fallos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons & Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-xs text-slate-400 order-2 sm:order-1">
            <button
              onClick={() => onOpenLegalTab && onOpenLegalTab("cookies")}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Política de Cookies
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenLegalTab && onOpenLegalTab("privacy")}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Privacidad
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
            {!showConfig ? (
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-700 hover:border-cyan-400/60 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Settings2 size={14} />
                <span>Configurar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-cyan-400/60 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check size={14} />
                <span>Guardar Selección</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleEssentialOnly}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Solo Esenciales
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(0,210,255,0.4)] transition cursor-pointer"
            >
              Aceptar Todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
