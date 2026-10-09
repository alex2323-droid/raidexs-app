import { Banknote, CreditCard, Landmark, CheckCircle, Bitcoin, QrCode, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { PaymentMethod, Game, GamePackage, SiteSettings } from '../types';

interface Props {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
  game?: Game;
  selectedPackage?: GamePackage | null;
  siteSettings?: SiteSettings | null;
}

export default function PaymentMethodSelection({ methods, selectedId, onSelect, siteSettings }: Props) {
  const [copied, setCopied] = useState(false);

  const getIcon = (type: string, isActive: boolean) => {
    const className = `w-8 h-8 mb-2 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary/70'}`;
    switch (type) {
      case 'payments': return <Banknote className={className} />;
      case 'account_balance': return <Landmark className={className} />;
      case 'credit_card': return <CreditCard className={className} />;
      case 'binance': return <Bitcoin className={className} />;
      default: return <CreditCard className={className} />;
    }
  };

  const selectedMethod = (methods || []).find(m => m.id === selectedId);
  const isBinanceMethod = !!selectedMethod && (
    selectedMethod.iconType === 'binance' ||
    selectedMethod.name.toLowerCase().includes('binance') ||
    selectedMethod.name.toLowerCase().includes('usdt')
  );

  const handleCopyPayId = () => {
    if (siteSettings?.binancePayId) {
      navigator.clipboard.writeText(siteSettings.binancePayId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="bg-surface/90 rounded-2xl p-4 sm:p-6 border border-cyan-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/40 shadow-[0_0_12px_rgba(0,210,255,0.3)]">
          3
        </div>
        <h2 className="font-display text-lg sm:text-xl font-bold text-on-surface tracking-tight">
          Método de <span className="text-cyan-400">Pago</span>
        </h2>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-3 sm:gap-4 pb-4 relative z-10">
        {(methods || []).map((method, index) => {
          const isSelected = selectedId === method.id;
          return (
            <div 
              key={`${method.id || 'method'}-${index}`}
              onClick={() => onSelect(method.id)}
              className={`flex-shrink-0 w-36 h-28 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group relative ${
                isSelected 
                  ? 'bg-gradient-to-b from-surface-container to-surface-container-low border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.3)] scale-[1.02]' 
                  : 'bg-surface-container-low border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-surface-container'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle size={16} className="text-cyan-400 fill-cyan-400/20" />
                </div>
              )}
              {method.qrCodeUrl && (
                <div className="absolute top-2 left-2 text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                  <QrCode size={10} /> QR
                </div>
              )}
              {getIcon(method.iconType, isSelected)}
              <span className="text-xs sm:text-sm font-bold text-on-surface text-center px-2">{method.name}</span>
            </div>
          );
        })}
      </div>

      {selectedMethod && (
        <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-cyan-500/20 text-on-surface-variant text-xs sm:text-sm relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
            {/* Payment instructions details */}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center justify-between">
                <p className="font-bold text-cyan-400 flex items-center gap-2 text-sm">
                  <span>ℹ️ Instrucciones de Pago:</span>
                </p>
                {isBinanceMethod && siteSettings?.binancePayId && (
                  <button
                    type="button"
                    onClick={handleCopyPayId}
                    className="text-[11px] bg-amber-500/20 text-[#F0B90B] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>Pay ID: {siteSettings.binancePayId}</span>
                  </button>
                )}
              </div>

              {selectedMethod.instructions && (
                <div className="whitespace-pre-wrap text-slate-300 font-mono text-xs leading-relaxed bg-surface/80 p-3 rounded-lg border border-glass-border">
                  {selectedMethod.instructions}
                </div>
              )}
            </div>

            {/* QR Code display if available */}
            {selectedMethod.qrCodeUrl && (
              <div className="shrink-0 flex flex-col items-center bg-surface/90 p-3.5 rounded-xl border-2 border-cyan-400/40 shadow-[0_0_20px_rgba(0,210,255,0.15)]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-2">
                  <QrCode size={14} />
                  <span>{selectedMethod.qrTitle || `Escanear QR (${selectedMethod.name})`}</span>
                </div>
                <div className="w-36 h-36 sm:w-40 sm:h-40 bg-white p-2 rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedMethod.qrCodeUrl}
                    alt={`Código QR ${selectedMethod.name}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1.5 font-medium text-center">
                  Escanea con tu App o Binance Pay
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
