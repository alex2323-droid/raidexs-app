import { Home, Zap, Receipt, HelpCircle, Mail } from 'lucide-react';

interface Props {
  activeTab: string;
  onNavigate: (tab: 'home' | 'orders' | 'support' | 'inbox') => void;
}

export default function MobileNav({ activeTab, onNavigate }: Props) {
  return (
    <nav className="md:hidden bg-surface-container/90 fixed bottom-0 w-full z-50 rounded-t-2xl backdrop-blur-xl border-t border-glass-border shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)] flex justify-around items-center py-2 px-2 pb-safe">
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center px-3 py-2 transition-all duration-300 ease-in-out active:scale-90 rounded-xl ${activeTab === 'home' || activeTab === 'game' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
      >
        <Home size={22} className={activeTab === 'home' || activeTab === 'game' ? 'fill-current/20' : ''} />
        <span className="text-[10px] font-bold mt-1">Inicio</span>
      </button>
      
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center px-3 py-2 transition-all duration-300 ease-in-out active:scale-90 rounded-xl ${activeTab === 'home' || activeTab === 'game' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
      >
        <Zap size={22} className={activeTab === 'home' || activeTab === 'game' ? 'fill-current/20' : ''} />
        <span className="text-[10px] font-bold mt-1">Recargas</span>
      </button>
      
      <button 
        onClick={() => onNavigate('orders')}
        className={`flex flex-col items-center justify-center px-3 py-2 transition-all duration-300 ease-in-out active:scale-90 rounded-xl ${activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
      >
        <Receipt size={22} className={activeTab === 'orders' ? 'fill-current/20' : ''} />
        <span className="text-[10px] font-bold mt-1">Historial</span>
      </button>
      
      <button 
        onClick={() => onNavigate('inbox')}
        className={`flex flex-col items-center justify-center px-3 py-2 transition-all duration-300 ease-in-out active:scale-90 rounded-xl ${activeTab === 'inbox' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
      >
        <Mail size={22} className={activeTab === 'inbox' ? 'fill-current/20' : ''} />
        <span className="text-[10px] font-bold mt-1">Recibos</span>
      </button>
      
      <button 
        onClick={() => onNavigate('support')}
        className={`flex flex-col items-center justify-center px-3 py-2 transition-all duration-300 ease-in-out active:scale-90 rounded-xl ${activeTab === 'support' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
      >
        <HelpCircle size={22} className={activeTab === 'support' ? 'fill-current/20' : ''} />
        <span className="text-[10px] font-bold mt-1">Soporte</span>
      </button>
    </nav>
  );
}
