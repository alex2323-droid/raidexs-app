import { Menu, User, Mail, Home, ShieldAlert, Smartphone } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import NexPlayLogo from './NexPlayLogo';

interface Props {
  activeTab: string;
  isAdmin?: boolean;
  onNavigate: (tab: 'home' | 'support' | 'profile' | 'inbox' | 'admin') => void;
  onOpenHermes?: () => void;
  onOpenDownloadApp?: () => void;
  logoUrl?: string;
}

export default function Header({ activeTab, isAdmin, onNavigate, onOpenHermes, onOpenDownloadApp, logoUrl }: Props) {
  return (
    <header className="bg-surface/80 fixed top-0 w-full z-50 backdrop-blur-md flex justify-between items-center px-4 h-16 border-b border-glass-border">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onNavigate('support')}
          title="Menú y Soporte"
          aria-label="Menú y Soporte"
          className={`transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl ${activeTab === 'support' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <Menu size={24} />
        </button>
        <button 
          onClick={() => onNavigate('home')}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${activeTab === 'home' ? 'bg-primary/15 text-primary border border-primary/30' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
          title="Ir al Inicio"
          aria-label="Ir al Inicio"
        >
          <Home size={16} />
          <span>Inicio</span>
        </button>
      </div>
      <button 
        onClick={() => onNavigate('home')}
        className="cursor-pointer transition-all active:scale-95 group"
        aria-label="Raidexs - Volver al Inicio"
      >
        <NexPlayLogo size="sm" variant="compact" showSubtitle={false} logoUrl={logoUrl} />
      </button>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onOpenDownloadApp}
          title="Descargar App / APK"
          aria-label="Descargar App / APK"
          className="relative transition-all duration-200 active:scale-95 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 font-bold text-xs cursor-pointer shadow-sm shadow-cyan-500/10"
        >
          <Smartphone size={16} className="text-cyan-400" />
          <span className="hidden md:inline">Descargar App</span>
          <span className="md:hidden text-[11px]">App</span>
        </button>
        <button
          onClick={() => {
            if (onOpenHermes) onOpenHermes();
            else window.dispatchEvent(new CustomEvent('open-hermes-agent'));
          }}
          aria-label="Hermes Agent - Asistente Virtual IA"
          title="Hermes Agent - Asistente Virtual IA"
          className="relative transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 group cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-cyan-400"
            >
              <path d="M4 14C2 11 2 7 5 5C7 3 10 4 10 6C8 7 6 9 6 12C6 13 5 14 4 14Z" fill="#00d2ff" fillOpacity="0.35" />
              <path d="M20 14C22 11 22 7 19 5C17 3 14 4 14 6C16 7 18 9 18 12C18 13 19 14 20 14Z" fill="#00d2ff" fillOpacity="0.35" />
              <path d="M8 9C8 6.5 9.8 5 12 5C14.2 5 16 6.5 16 9V14C16 16.5 14.2 19 12 19C9.8 19 8 16.5 8 14V9Z" />
              <circle cx="12" cy="12" r="1" fill="#fff" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>
          <span className="hidden xl:inline text-xs font-bold ml-1.5 text-cyan-300">Hermes IA</span>
        </button>
        <ThemeSwitcher />
        {isAdmin && (
          <button 
            onClick={() => onNavigate('admin')}
            aria-label="Panel de Administración"
            title="Panel de Administración"
            className={`transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl ${activeTab === 'admin' ? 'bg-red-500/10 text-red-500' : 'text-on-surface-variant hover:text-red-500 hover:bg-surface-container-high'}`}
          >
            <ShieldAlert size={24} />
          </button>
        )}
        <button 
          onClick={() => onNavigate('inbox')}
          aria-label="Bandeja de correos y notificaciones"
          title="Bandeja de correos"
          className={`transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl ${activeTab === 'inbox' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <Mail size={24} />
        </button>
        <button 
          onClick={() => onNavigate('profile')}
          aria-label="Mi Perfil de usuario"
          title="Mi Perfil"
          className={`transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <User size={24} />
        </button>
      </div>
    </header>
  );
}


