import NexPlayLogo from "./NexPlayLogo";
import { LegalTab } from "./LegalModal";
import { ShieldCheck, Cookie, Scale, Lock, RotateCcw, FileText, Mail, Smartphone } from "lucide-react";

interface Props {
  onOpenLegal?: (tab: LegalTab) => void;
  onOpenCookieSettings?: () => void;
  logoUrl?: string;
  onOpenDownloadApp?: () => void;
}

export default function Footer({ onOpenLegal, onOpenCookieSettings, logoUrl, onOpenDownloadApp }: Props) {
  const handleLegalClick = (tab: LegalTab) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenLegal) {
      onOpenLegal(tab);
    }
  };

  const handleCookieClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenCookieSettings) {
      onOpenCookieSettings();
    } else {
      window.dispatchEvent(new CustomEvent("open-cookie-settings"));
    }
  };

  return (
    <footer className="bg-[#020712] w-full border-t border-cyan-900/40 text-slate-300 py-10 px-4 mb-20 md:mb-0 relative z-20">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center gap-2">
          <NexPlayLogo size="md" showSubtitle={true} logoUrl={logoUrl} />
          <p className="text-xs text-slate-400 max-w-md mt-1">
            Plataforma segura de recargas de videojuegos por ID, diamantes oficiales y tarjetas de regalo digitales con entrega inmediata.
          </p>
        </div>

        {/* Legal Links Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={handleLegalClick("terms")}
            className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <FileText size={14} className="text-cyan-400" /> Términos y Condiciones
          </button>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <button
            onClick={handleLegalClick("privacy")}
            className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Lock size={14} className="text-cyan-400" /> Política de Privacidad
          </button>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <button
            onClick={handleLegalClick("refunds")}
            className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw size={14} className="text-cyan-400" /> Política de Reembolsos
          </button>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <button
            onClick={handleLegalClick("notice")}
            className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Scale size={14} className="text-cyan-400" /> Aviso Legal & Marcas
          </button>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <button
            onClick={handleCookieClick}
            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer flex items-center gap-1"
          >
            <Cookie size={14} /> Configurar Cookies
          </button>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <button
            onClick={() => {
              if (onOpenDownloadApp) onOpenDownloadApp();
              else window.dispatchEvent(new CustomEvent("open-download-app"));
            }}
            className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors cursor-pointer flex items-center gap-1"
          >
            <Smartphone size={14} /> Descargar App (APK)
          </button>
        </div>

        {/* Business and Trademark Disclaimer */}
        <div className="max-w-3xl pt-2 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong>Descargo de Marcas y Propiedad Intelectual:</strong> Todos los nombres de videojuegos, logotipos, carátulas y marcas registradas (incluyendo Free Fire®, Mobile Legends®, PUBG Mobile®, Roblox®, Brawl Stars® y afines) son propiedad de sus respectivos dueños y distribuidores (Garena, Tencent, Moonton, Roblox Corp., Supercell, etc.). Raidexs opera como proveedor de servicios e intermediario digital independiente y no ostenta relación de exclusividad ni afiliación propietaria sobre dichas marcas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-cyan-400" /> Conexión Segura SSL (256-bit)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail size={13} className="text-cyan-400" /> Contacto: nexplay2307@gmail.com
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} Raidexs. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
