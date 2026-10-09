import { User as UserIcon, Mail, Shield, Settings, LogOut, ChevronRight, Crown } from 'lucide-react';
import { Order } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface Props {
  orders: Order[];
}

export default function Profile({ orders }: Props) {
  const completedOrders = (orders || []).filter(o => o.status === 'completed');
  const totalSpent = completedOrders.reduce((sum, order) => sum + order.price, 0);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('lastLoginTime');
    } catch (e) {
      console.warn('localStorage access denied', e);
    }
    await signOut(auth);
  };

  const currentEmail = auth.currentUser?.email || 'usuario@correo.com';
  const isUsernameOnly = currentEmail.endsWith('@raidexs.com');
  const displayName = isUsernameOnly 
    ? currentEmail.replace('@raidexs.com', '') 
    : currentEmail;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 w-full pb-24 md:pb-8 animation-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">Mi Perfil</h1>
        <p className="text-on-surface-variant font-medium mt-1">Gestiona tu información personal y verifica tu nivel de cuenta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-2xl border border-glass-border flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield size={120} />
          </div>
          
          <div className="relative z-10 w-24 h-24 rounded-full bg-surface-dim border-2 border-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,210,255,0.35)]">
            <UserIcon size={40} className="text-cyan-400" />
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 rounded-full p-1.5 text-[10px] font-bold border-2 border-background flex items-center justify-center shadow-[0_0_10px_rgba(0,210,255,0.5)]">
              <Crown size={12} />
            </div>
          </div>
          
          <div className="relative z-10 flex-grow">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-1">
              {isUsernameOnly ? displayName : 'Mi Cuenta'}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-2 text-on-surface-variant font-medium text-sm mb-4">
              <Mail size={14} /> {isUsernameOnly ? `Usuario: ${displayName}` : currentEmail}
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-lg border border-glass-border">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface">Cuenta Activa</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="glass-panel p-6 rounded-2xl border border-glass-border flex flex-col justify-center">
          <h3 className="font-display text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Resumen</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-glass-border pb-3">
              <span className="text-on-surface font-medium">Recargas</span>
              <span className="font-display font-bold text-2xl text-primary leading-none">{completedOrders.length}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-on-surface font-medium">Invertido</span>
              <span className="font-display font-bold text-xl text-on-surface">Bs {totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl border border-glass-border overflow-hidden">
          <div className="p-4 border-b border-glass-border bg-surface-container-low">
            <h3 className="font-display font-bold text-on-surface flex items-center gap-2">
              <Settings size={18} className="text-primary" /> Configuraciones
            </h3>
          </div>
          <div className="flex flex-col">
            <button className="flex items-center justify-between p-4 hover:bg-surface-container transition-colors text-left border-b border-glass-border">
              <span className="font-medium text-on-surface">Editar Información Personal</span>
              <ChevronRight size={18} className="text-on-surface-variant" />
            </button>
            <button className="flex items-center justify-between p-4 hover:bg-surface-container transition-colors text-left border-b border-glass-border">
              <span className="font-medium text-on-surface">Métodos de Pago Guardados</span>
              <ChevronRight size={18} className="text-on-surface-variant" />
            </button>
            <button className="flex items-center justify-between p-4 hover:bg-surface-container transition-colors text-left">
              <span className="font-medium text-on-surface">Notificaciones y Alertas</span>
              <ChevronRight size={18} className="text-on-surface-variant" />
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-glass-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-glass-border bg-surface-container-low">
            <h3 className="font-display font-bold text-on-surface flex items-center gap-2">
              <Shield size={18} className="text-primary" /> Seguridad
            </h3>
          </div>
          <div className="flex flex-col flex-grow">
            <button className="flex items-center justify-between p-4 hover:bg-surface-container transition-colors text-left border-b border-glass-border">
              <span className="font-medium text-on-surface">Cambiar Contraseña</span>
              <ChevronRight size={18} className="text-on-surface-variant" />
            </button>
            <button className="flex items-center justify-between p-4 hover:bg-surface-container transition-colors text-left">
              <span className="font-medium text-on-surface">Autenticación de 2 Pasos</span>
              <span className="text-xs bg-surface-variant text-primary px-2 py-1 rounded font-bold">Inactivo</span>
            </button>
          </div>
          <div className="p-4 mt-auto">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold transition-all"
            >
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
