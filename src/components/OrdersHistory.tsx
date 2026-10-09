import { Package, CheckCircle2, Clock, XCircle, ChevronRight, Copy } from 'lucide-react';
import { Order } from '../types';
import { useState } from 'react';

interface Props {
  orders: Order[];
}

export default function OrdersHistory({ orders }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'text-green-400', bg: 'bg-green-400/20', icon: <CheckCircle2 size={16} /> };
      case 'pending': return { color: 'text-yellow-400', bg: 'bg-yellow-400/20', icon: <Clock size={16} /> };
      case 'failed': return { color: 'text-red-400', bg: 'bg-red-400/20', icon: <XCircle size={16} /> };
      case 'rejected': return { color: 'text-red-400', bg: 'bg-red-400/20', icon: <XCircle size={16} /> };
      default: return { color: 'text-on-surface-variant', bg: 'bg-surface-variant', icon: <Clock size={16} /> };
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazada';
      case 'failed': return 'Fallida';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full pb-24 md:pb-8 animation-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">Historial de Compras</h1>
          <p className="text-on-surface-variant font-medium mt-1">Revisa tus recargas y transacciones recientes.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-2xl border border-glass-border border-dashed">
          <Package size={48} className="text-on-surface-variant mb-4" />
          <h3 className="font-display text-xl font-bold text-on-surface mb-2">Aún no tienes órdenes</h3>
          <p className="text-on-surface-variant">Tus recargas aparecerán aquí cuando realices tu primer pago.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {(orders || []).map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <div key={`${order.id || 'order'}-${index}`} className="glass-panel p-4 rounded-xl border border-glass-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-surface-container">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 bg-surface-dim rounded-lg flex items-center justify-center text-primary shrink-0 border border-glass-border">
                    <Package size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-display font-bold text-on-surface">{order.gameName}</h3>
                    <p className="text-sm font-medium text-on-surface-variant">{order.packageName}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant/70">
                      <span className="flex items-center gap-1.5">
                        {order.id}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.id);
                            setCopiedId(order.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className={`transition-colors p-1 rounded-full ${
                            copiedId === order.id ? 'text-green-400 bg-green-400/10' : 'hover:text-primary hover:bg-primary/10'
                          }`}
                          title="Copiar ID de orden"
                        >
                          {copiedId === order.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                        </button>
                      </span>
                      <span>•</span>
                      <span>{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    {order.playerId && (
                      <div className="text-xs text-tertiary-container font-mono font-bold mt-1">
                        ID: {order.playerId}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end justify-between w-full md:w-auto gap-4 border-t md:border-none border-glass-border pt-4 md:pt-0 mt-2 md:mt-0">
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.icon}
                      <span className="capitalize">{translateStatus(order.status)}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">{order.paymentMethod}</span>
                        <span className="font-display font-bold text-primary">Bs {order.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {order.referenceNumber && (
                    <div className="text-xs text-on-surface-variant font-mono self-start md:self-end">
                      Ref: {order.referenceNumber}
                    </div>
                  )}
                  {order.status === 'pending' && (
                    <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 self-start md:self-end bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ⏳ En espera de verificación y aprobación
                    </div>
                  )}
                  {order.receiptUrl && (
                    <div className="mt-2 w-full flex justify-start md:justify-end">
                      <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        Ver comprobante
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
