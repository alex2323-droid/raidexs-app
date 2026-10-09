import { Zap, Lock, Gem, CheckCircle, Loader2, Tag, PartyPopper, Bitcoin, ShieldCheck, AlertCircle, CheckCircle2, ExternalLink, Copy, Check, Smartphone, ArrowRight, X, QrCode, Banknote } from 'lucide-react';
import { useState } from 'react';
import { PromoCode, Game, GamePackage, PaymentMethod, Order, SiteSettings } from '../types';
import { auth, db, getAccessToken } from '../firebase';
import { sendEmail } from '../gmailService';
import { doc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

import { LegalTab } from './LegalModal';

interface Props {
  game: Game;
  selectedPackage: GamePackage | null;
  selectedPayment: PaymentMethod | undefined;
  isVerified: boolean;
  playerId?: string;
  promoCodes?: PromoCode[];
  exchangeRate?: number;
  siteSettings?: SiteSettings | null;
  onCheckoutSuccess: (order: Order) => void;
  onOpenLegal?: (tab: LegalTab) => void;
}

export default function OrderSummary({ game, selectedPackage, selectedPayment, isVerified, playerId, promoCodes = [], exchangeRate, siteSettings, onCheckoutSuccess, onOpenLegal }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  
  // Binance state & modal
  const [showBinanceModal, setShowBinanceModal] = useState(false);
  const [isRedirectingBinance, setIsRedirectingBinance] = useState(false);
  const [isVerifyingBinance, setIsVerifyingBinance] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [binanceVerification, setBinanceVerification] = useState<{
    verified: boolean;
    message: string;
    source?: string;
    details?: any;
  } | null>(null);

  const isBinancePayment = !!selectedPayment && (
    selectedPayment.iconType === 'binance' ||
    selectedPayment.name.toLowerCase().includes('binance') ||
    selectedPayment.name.toLowerCase().includes('usdt')
  );

  const isPagoMovilPayment = !!selectedPayment && (
    selectedPayment.currency === 'VES' ||
    selectedPayment.iconType === 'payments' ||
    selectedPayment.name.toLowerCase().includes('pago móvil') ||
    selectedPayment.name.toLowerCase().includes('bolívar') ||
    selectedPayment.id.toLowerCase().includes('pago_movil')
  );

  const hasBinanceApi = !!siteSettings?.binanceApiKey || !!siteSettings?.binanceEnabled;

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setCopyToast(`¡${fieldName === 'payId' ? 'Binance Pay ID' : 'Monto'} copiado!`);
    setTimeout(() => {
      setCopiedField(null);
      setCopyToast(null);
    }, 2500);
  };

  const handleRedirectToBinancePay = async () => {
    if (!selectedPackage) return;
    setIsRedirectingBinance(true);
    setPromoError('');

    const finalPrice = calculateFinalPrice();
    const orderId = `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    // Auto-copy Pay ID if available
    if (siteSettings?.binancePayId) {
      navigator.clipboard.writeText(siteSettings.binancePayId);
      setCopyToast('¡Binance Pay ID copiado al portapapeles!');
      setTimeout(() => setCopyToast(null), 3000);
    }

    try {
      let apiUrl = import.meta.env.VITE_API_URL || '';
      if (apiUrl.includes('<AQUI')) apiUrl = '';
      apiUrl = apiUrl.replace(/\/+$/, '');

      const res = await fetch(`/api/binance/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: finalPrice,
          currency: 'USDT',
          packageName: `${selectedPackage.amount} ${selectedPackage.currency}`,
          gameName: game.name,
          binancePayId: siteSettings?.binancePayId,
          customPayUrl: siteSettings?.binanceCustomPayUrl,
          apiKey: siteSettings?.binanceApiKey,
          apiSecret: siteSettings?.binanceApiSecret,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.isOfficialMerchant && data.checkoutUrl) {
        if (data.prepayId) {
          setReferenceNumber(data.prepayId);
        }
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Open the guided assistant modal
        setShowBinanceModal(true);
      }
    } catch (err: any) {
      console.warn('Error connecting to Binance Pay:', err);
      setShowBinanceModal(true);
    } finally {
      setIsRedirectingBinance(false);
    }
  };

  const handleVerifyBinancePayment = async () => {
    if (!referenceNumber.trim()) {
      setPromoError('Ingresa el ID de Transacción o Referencia de Binance.');
      return;
    }

    setIsVerifyingBinance(true);
    setBinanceVerification(null);
    setPromoError('');

    try {
      let apiUrl = import.meta.env.VITE_API_URL || '';
      if (apiUrl.includes('<AQUI')) apiUrl = '';
      apiUrl = apiUrl.replace(/\/+$/, '');

      const finalPrice = calculateFinalPrice();

      const res = await fetch(`/api/binance/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: referenceNumber.trim(),
          expectedAmount: finalPrice,
          currency: 'USDT',
          apiKey: siteSettings?.binanceApiKey,
          apiSecret: siteSettings?.binanceApiSecret,
        }),
      });

      const data = await res.json();

      if (res.ok && data.verified) {
        setBinanceVerification({
          verified: true,
          message: data.message || 'Pago verificado con éxito por Binance API',
          source: data.source,
          details: data.details,
        });
      } else {
        setBinanceVerification({
          verified: false,
          message: data.message || data.error || 'No se encontró el pago en Binance. Verifica la referencia.',
        });
      }
    } catch (err: any) {
      setBinanceVerification({
        verified: false,
        message: err.message || 'Error al conectar con el servicio de validación de Binance.',
      });
    } finally {
      setIsVerifyingBinance(false);
    }
  };
  
  // Confetti trigger function
  const triggerConfetti = () => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  
  const calculateFinalPrice = () => {
    if (!selectedPackage) return 0;
    let price = selectedPackage.price;
    
    // 1. Package Discount
    if (selectedPackage.discountPercentage) {
      price = price * (1 - (selectedPackage.discountPercentage / 100));
    }
    
    // 2. Promo Code Discount
    if (appliedPromo) {
      price = price * (1 - (appliedPromo.discountPercentage / 100));
    }
    
    return price;
  };

  const calculateFinalPriceVES = () => {
    return calculateFinalPrice() * (exchangeRate || 1);
  };


  const handleApplyPromo = () => {
    setPromoError('');
    if (!promoCodeInput.trim()) {
      setAppliedPromo(null);
      return;
    }
    
    const code = (promoCodes || []).find(c => c.code.toUpperCase() === promoCodeInput.trim().toUpperCase());
    if (code) {
      if (code.active) {
        setAppliedPromo(code);
      } else {
        setPromoError('Este código ya no es válido.');
        setAppliedPromo(null);
      }
    } else {
      setPromoError('Código de descuento inválido.');
      setAppliedPromo(null);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPackage || !selectedPayment || !referenceNumber.trim()) return;
    
    setIsProcessing(true);
    setPromoError('');
    
    const finalPrice = calculateFinalPrice();
    const currentUserEmail = auth.currentUser?.email || 'N/A';
    
    let isAutoVerified = binanceVerification?.verified || false;
    let verifiedDetails = binanceVerification?.details || null;
    let autoVerifiedSource: string | null = binanceVerification?.verified ? 'binance' : null;

    // If Binance payment and API is configured, and not yet verified, try auto-verifying now
    if (isBinancePayment && hasBinanceApi && !isAutoVerified) {
      try {
        let apiUrl = import.meta.env.VITE_API_URL || '';
        if (apiUrl.includes('<AQUI')) apiUrl = '';
        apiUrl = apiUrl.replace(/\/+$/, '');

        const verifyRes = await fetch(`/api/binance/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceNumber: referenceNumber.trim(),
            expectedAmount: finalPrice,
            currency: 'USDT',
            apiKey: siteSettings?.binanceApiKey,
            apiSecret: siteSettings?.binanceApiSecret,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.verified) {
          isAutoVerified = true;
          autoVerifiedSource = 'binance';
          verifiedDetails = verifyData.details;
          setBinanceVerification({
            verified: true,
            message: verifyData.message || 'Pago verificado con éxito por Binance API',
            source: verifyData.source,
            details: verifyData.details,
          });
        }
      } catch (err) {
        console.warn('Auto-verify error on checkout:', err);
      }
    }

    const orderStatus: 'completed' | 'pending' = isAutoVerified ? 'completed' : 'pending';
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      date: new Date().toISOString(),
      gameId: game.id,
      gameName: game.name,
      packageId: selectedPackage.id,
      packageName: `${selectedPackage.amount} ${selectedPackage.currency}`,
      price: finalPrice,
      status: orderStatus,
      paymentMethod: selectedPayment.name,
      referenceNumber: referenceNumber.trim(),
      userId: auth.currentUser?.uid || 'N/A',
      userEmail: currentUserEmail,
      playerId: playerId || 'N/A',
      ...(verifiedDetails ? { 
        hankGamesResult: { 
          autoVerified: true, 
          source: autoVerifiedSource || 'binance',
          details: verifiedDetails 
        } 
      } : {})
    };

    try {
      // Save order to firestore
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);

      const currentUserEmail = auth.currentUser?.email || 'N/A';
      
      let apiUrl = import.meta.env.VITE_API_URL || '';
      if (apiUrl.includes('<AQUI')) apiUrl = '';
      apiUrl = apiUrl.replace(/\/+$/, '');
      // Ejecutamos la llamada al servidor de correo en segundo plano para no bloquear el UI
      fetch(`/api/notify-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder, customerEmail: currentUserEmail }),
      }).then(async (response) => {
        if (response.ok) {
          const resData = await response.json();
          const apiResult = resData.hankGamesResult;
          if (apiResult) {
            // Update order in Firestore with the API result
            try {
              await updateDoc(doc(db, 'orders', newOrder.id), {
                hankGamesResult: apiResult
              });
            } catch (e) {
              console.error('Failed to update order with hankGamesResult', e);
            }
          }
        }
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Email server error:', errorData);
          try {
            await addDoc(collection(db, 'email_errors'), {
              type: 'notify-order',
              orderId: newOrder.id,
              customerEmail: currentUserEmail,
              error: errorData,
              status: response.status,
              timestamp: new Date().toISOString()
            });
          } catch (logErr) {
            console.error('Failed to log email error to Firestore', logErr);
          }
        }
      }).catch(async (err) => {
        console.warn('Failed to send email notification, but order was saved', err);
        try {
          await addDoc(collection(db, 'email_errors'), {
            type: 'notify-order',
            orderId: newOrder.id,
            customerEmail: currentUserEmail,
            error: err instanceof Error ? err.message : String(err),
            timestamp: new Date().toISOString()
          });
        } catch (logErr) {
          console.error('Failed to log email error to Firestore', logErr);
        }
      });
      
      setIsProcessing(false);
      setShowSuccess(true);
      triggerConfetti();
      
      setTimeout(() => {
        setShowSuccess(false);
        onCheckoutSuccess(newOrder);
      }, 3500);

    } catch (error) {
      console.error('Error in checkout:', error);
      setPromoError('Hubo un error al procesar el pago.');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="glass-panel rounded-xl p-6 sticky top-24 border-t-4 border-t-primary">
        <h3 className="font-display text-xl font-bold text-on-surface mb-6 border-b border-glass-border pb-4">Resumen de Compra</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-medium">Juego</span>
            <span className="font-semibold text-on-surface">{game.name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-medium">Paquete</span>
            <span className="font-semibold text-on-surface flex items-center gap-1">
              {selectedPackage ? `${selectedPackage.amount} ${selectedPackage.currency}` : '--'}
              {selectedPackage && <Gem size={16} className="text-tertiary-container" />}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-medium">Método</span>
            <span className="font-semibold text-on-surface flex items-center gap-1.5">
              {isBinancePayment && <Bitcoin size={16} className="text-[#F0B90B]" />}
              {selectedPayment ? selectedPayment.name : '--'}
            </span>
          </div>
        </div>
        
        <div className="border-t border-glass-border py-4 mb-4">
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Código de Descuento</label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text" 
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                placeholder="Ej: EMBAJADOR10"
                className="w-full bg-surface border border-glass-border rounded-lg py-2 pl-9 pr-3 text-on-surface focus:border-primary focus:outline-none uppercase text-sm"
              />
            </div>
            <button 
              onClick={handleApplyPromo}
              disabled={!promoCodeInput.trim()}
              className="bg-surface-elevated hover:bg-primary/20 text-primary font-bold px-4 rounded-lg text-sm transition-colors border border-glass-border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar
            </button>
          </div>
          {promoError && <p className="text-red-400 text-xs mt-2 font-medium">{promoError}</p>}
          {appliedPromo && <p className="text-green-400 text-xs mt-2 font-medium">¡Código {appliedPromo.code} aplicado! (-{appliedPromo.discountPercentage}%)</p>}
        </div>

        {/* BINANCE PAY DIRECT CHECKOUT CARD & REDIRECTION */}
        {isBinancePayment && selectedPackage && (
          <div className="border-t border-glass-border pt-4 mb-4">
            <div className="bg-gradient-to-br from-[#1E2026] to-[#121318] p-4 rounded-xl border border-[#F0B90B]/30 shadow-[0_4px_20px_rgba(240,185,11,0.1)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F0B90B]/20 flex items-center justify-center border border-[#F0B90B]/40">
                    <Bitcoin size={16} className="text-[#F0B90B]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      Binance Pay Directo
                      <span className="text-[9px] bg-[#F0B90B]/20 text-[#F0B90B] font-bold px-1.5 py-0.2 rounded border border-[#F0B90B]/30">
                        Instantáneo
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">Redirección automática con monto exacto</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Total a Pagar</span>
                  <span className="text-sm font-black text-[#F0B90B] font-mono">
                    ${calculateFinalPrice().toFixed(2)} USDT
                  </span>
                </div>
              </div>

              {/* Action Redirection Button */}
              <button
                type="button"
                onClick={handleRedirectToBinancePay}
                disabled={isRedirectingBinance}
                className="w-full bg-gradient-to-r from-[#F0B90B] via-[#F8D33A] to-[#F0B90B] hover:from-[#e0ac0a] hover:to-[#dfab0a] text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(240,185,11,0.3)] hover:shadow-[0_0_25px_rgba(240,185,11,0.5)] active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {isRedirectingBinance ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-slate-950" />
                    <span>Conectando con Binance Pay...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-slate-950 fill-slate-950" />
                    <span>Pagar con Binance Pay (${calculateFinalPrice().toFixed(2)} USDT)</span>
                    <ExternalLink size={15} className="text-slate-950 ml-0.5" />
                  </>
                )}
              </button>

              {/* Data Breakdown with 1-click Copy */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Monto Exacto:</span>
                    <span className="font-bold text-white font-mono">{calculateFinalPrice().toFixed(2)} USDT</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(calculateFinalPrice().toFixed(2), 'amount')}
                    className="text-slate-400 hover:text-[#F0B90B] p-1 rounded transition-colors"
                    title="Copiar monto"
                  >
                    {copiedField === 'amount' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                {siteSettings?.binancePayId && (
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Binance Pay ID:</span>
                      <span className="font-bold text-white font-mono truncate max-w-[90px] block">
                        {siteSettings.binancePayId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(siteSettings.binancePayId || '', 'payId')}
                      className="text-slate-400 hover:text-[#F0B90B] p-1 rounded transition-colors"
                      title="Copiar Pay ID"
                    >
                      {copiedField === 'payId' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAGO MOVIL CARD */}
        {isPagoMovilPayment && selectedPackage && (
          <div className="border-t border-glass-border pt-4 mb-4">
            <div className="bg-gradient-to-br from-[#061838] to-[#040e24] p-4 rounded-xl border border-cyan-500/30 shadow-[0_4px_20px_rgba(0,210,255,0.15)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40 text-cyan-300">
                    <Banknote size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      Pago Móvil (Bolívares)
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-medium">
                      Tasa oficial BCV: Bs. {(exchangeRate || 1).toFixed(2)}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Bs. {calculateFinalPriceVES().toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Data Breakdown with 1-click Copy */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#020917] p-2 rounded-lg border border-cyan-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Banco:</span>
                    <span className="font-bold text-white text-xs truncate max-w-[100px] block">
                      Banco de Venezuela
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('Banco de Venezuela', 'bank')}
                    className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors cursor-pointer"
                    title="Copiar banco"
                  >
                    {copiedField === 'bank' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="bg-[#020917] p-2 rounded-lg border border-cyan-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Teléfono:</span>
                    <span className="font-bold text-white text-xs font-mono">
                      0414-2943532
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('0414-2943532', 'phone')}
                    className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors cursor-pointer"
                    title="Copiar teléfono"
                  >
                    {copiedField === 'phone' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="bg-[#020917] p-2 rounded-lg border border-cyan-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Cédula / RIF:</span>
                    <span className="font-bold text-white text-xs font-mono">
                      V-31536656
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('V-31536656', 'idDoc')}
                    className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors cursor-pointer"
                    title="Copiar cédula"
                  >
                    {copiedField === 'idDoc' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="bg-[#020917] p-2 rounded-lg border border-cyan-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Monto Bs:</span>
                    <span className="font-bold text-cyan-300 text-xs font-mono">
                      {calculateFinalPriceVES().toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(calculateFinalPriceVES().toFixed(2), 'montoBs')}
                    className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors cursor-pointer"
                    title="Copiar monto en Bs"
                  >
                    {copiedField === 'montoBs' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Copy all button */}
              <button
                type="button"
                onClick={() => {
                  const allData = `Pago Móvil Raidexs\nBanco: Banco de Venezuela\nTeléfono: 0414-2943532\nCédula: V-31536656\nMonto: Bs. ${calculateFinalPriceVES().toFixed(2)}`;
                  navigator.clipboard.writeText(allData);
                  setCopyToast('¡Todos los datos de Pago Móvil copiados!');
                  setTimeout(() => setCopyToast(null), 3000);
                }}
                className="w-full py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copiar todos los datos de Pago Móvil</span>
              </button>
            </div>
          </div>
        )}

        {/* REFERENCE / PAYMENT VALIDATION INPUT */}
        <div className="border-t border-glass-border pt-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase flex items-center gap-1.5">
              {isBinancePayment ? (
                <>
                  <Bitcoin size={14} className="text-[#F0B90B]" />
                  ID de Transacción / Referencia Binance
                </>
              ) : (
                <>Número de Referencia de Pago</>
              )}
            </label>
            {isBinancePayment && hasBinanceApi && (
              <span className="text-[10px] bg-amber-500/20 text-[#F0B90B] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                ⚡ API Activa
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={referenceNumber}
                onChange={(e) => {
                  setReferenceNumber(e.target.value);
                  setBinanceVerification(null);
                }}
                placeholder={isBinancePayment ? "Ej: 2938172948 o TxID / Pay ID" : "Ej: 12345678 (Número de Referencia)"}
                className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-cyan-400 focus:outline-none text-sm font-mono"
              />

              {isBinancePayment && hasBinanceApi && (
                <button
                  type="button"
                  onClick={handleVerifyBinancePayment}
                  disabled={!referenceNumber.trim() || isVerifyingBinance}
                  className="shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3.5 rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(240,185,11,0.2)]"
                  title="Verificar pago con Binance API"
                >
                  {isVerifyingBinance ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Zap size={14} />
                  )}
                  Validar
                </button>
              )}
            </div>

            {/* QR Code Quick View in summary if configured */}
            {selectedPayment?.qrCodeUrl && (
              <div className="p-3 rounded-xl bg-surface border border-glass-border flex items-center gap-3">
                <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                  <img
                    src={selectedPayment.qrCodeUrl}
                    alt={`QR ${selectedPayment.name}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-cyan-400 block">
                    {selectedPayment.qrTitle || 'Código QR Disponible'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Puedes escanear el QR directamente arriba para transferir de inmediato.
                  </span>
                </div>
              </div>
            )}
            {binanceVerification && (
              <div
                className={`p-2.5 rounded-lg text-xs border flex items-start gap-2 ${
                  binanceVerification.verified
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {binanceVerification.verified ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{binanceVerification.message}</p>
                  {binanceVerification.details && (
                    <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                      Monto: ${binanceVerification.details.amount} {binanceVerification.details.currency}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-glass-border pt-4 mb-6">
          <div className="flex flex-col gap-1">
            {appliedPromo && selectedPackage && (
              <div className="flex justify-between items-center text-sm text-on-surface-variant line-through">
                <span>Precio Original</span>
                <span>$ {selectedPackage.price.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-end mt-2">
              <span className="text-lg font-medium text-on-surface">Total</span>
                <div className="text-right">
                  <span className="font-display text-3xl sm:text-4xl font-black text-cyan-400 leading-none block drop-shadow-[0_0_12px_rgba(0,210,255,0.3)]">
                    {selectedPayment?.currency === 'VES' && exchangeRate
                      ? `Bs ${calculateFinalPriceVES().toFixed(2)}`
                      : `$ ${calculateFinalPrice().toFixed(2)}`}
                  </span>
                  {selectedPayment?.currency === 'VES' && exchangeRate && (
                    <span className="text-xs font-bold text-on-surface-variant block mt-1">
                      (Tasa BCV: {exchangeRate.toFixed(2)} VES)
                    </span>
                  )}
                  {selectedPayment?.currency !== 'VES' && exchangeRate && (
                    <span className="text-xs font-bold text-on-surface-variant block mt-1">
                      (Equivalente: Bs {calculateFinalPriceVES().toFixed(2)})
                    </span>
                  )}
                </div>
            </div>
          </div>
        </div>

        {/* Consentimiento Legal y Verificación de Datos */}
        <div className="mb-4 p-3 bg-surface/90 rounded-xl border border-cyan-500/20 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-cyan-800 bg-[#07152b] text-cyan-500 focus:ring-cyan-400 accent-cyan-500 cursor-pointer shrink-0"
            />
            <span className="text-[11px] sm:text-xs text-slate-300 leading-snug">
              He leído y acepto los{" "}
              <button
                type="button"
                onClick={() => onOpenLegal && onOpenLegal('terms')}
                className="text-cyan-400 underline font-semibold hover:text-cyan-300"
              >
                Términos y Condiciones
              </button>
              , la{" "}
              <button
                type="button"
                onClick={() => onOpenLegal && onOpenLegal('privacy')}
                className="text-cyan-400 underline font-semibold hover:text-cyan-300"
              >
                Política de Privacidad
              </button>{" "}
              y la{" "}
              <button
                type="button"
                onClick={() => onOpenLegal && onOpenLegal('refunds')}
                className="text-cyan-400 underline font-semibold hover:text-cyan-300"
              >
                Política de Reembolsos
              </button>
              . Confirmo que mi Player ID o contacto es correcto.
            </span>
          </label>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={!isVerified || !selectedPackage || !selectedPayment || !referenceNumber.trim() || !acceptedTerms || isProcessing || showSuccess}
          className={`w-full font-display text-lg font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 relative overflow-hidden ${
            !isVerified || !selectedPackage || !selectedPayment || !referenceNumber.trim() || !acceptedTerms
              ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-75'
              : showSuccess
              ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
              : 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black shadow-[0_0_20px_rgba(0,210,255,0.4)]'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Procesando Pago...
            </>
          ) : showSuccess ? (
            <>
              <CheckCircle size={20} />
              ¡Pago Exitoso!
            </>
          ) : !isVerified ? (
            <>Ingresa tu ID de Jugador</>
          ) : !selectedPackage ? (
            <>Selecciona un Paquete</>
          ) : !selectedPayment ? (
            <>Selecciona Método de Pago</>
          ) : !referenceNumber.trim() ? (
            <>Ingresa la Referencia</>
          ) : !acceptedTerms ? (
            <>Acepta los Términos para pagar</>
          ) : (
            <>
              <Zap size={20} />
              Realizar Pago
            </>
          )}
        </button>
        
        <p className="text-xs font-medium text-on-surface-variant text-center mt-4 flex items-center justify-center gap-1.5">
          <Lock size={14} /> Transacción Segura 100%
        </p>
      </div>

      <AnimatePresence>
        {/* TOAST DE COPIADO */}
        {copyToast && (
          <motion.div
            key="copy-toast-notification"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white border border-[#F0B90B] px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(240,185,11,0.4)] flex items-center gap-2 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-[#F0B90B]" />
            <span>{copyToast}</span>
          </motion.div>
        )}

        {/* MODAL ASISTENTE BINANCE PAY */}
        {showBinanceModal && selectedPackage && (
          <motion.div
            key="binance-payment-assistant-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-[#181A20] border border-[#F0B90B]/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl max-w-md w-full p-5 sm:p-6 text-white space-y-4 my-auto relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F0B90B] flex items-center justify-center shadow-[0_0_15px_rgba(240,185,11,0.4)]">
                    <Bitcoin size={20} className="text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-1.5">
                      Pagar con Binance Pay
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {game.name} • {selectedPackage.amount} {selectedPackage.currency}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBinanceModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Amount Box */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Monto Exacto a Transferir:
                  </span>
                  <span className="text-2xl font-black text-[#F0B90B] font-mono">
                    ${calculateFinalPrice().toFixed(2)} USDT
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(calculateFinalPrice().toFixed(2), 'amount')}
                  className="bg-[#F0B90B]/10 hover:bg-[#F0B90B]/20 border border-[#F0B90B]/30 text-[#F0B90B] font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedField === 'amount' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>Copiar Monto</span>
                </button>
              </div>

              {/* Pay ID Box */}
              {siteSettings?.binancePayId && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Binance Pay ID / Correo:
                    </span>
                    <span className="text-sm font-bold text-white font-mono truncate block">
                      {siteSettings.binancePayId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(siteSettings.binancePayId || '', 'payId')}
                    className="bg-[#F0B90B] hover:bg-[#dfab0a] text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-[0_0_12px_rgba(240,185,11,0.3)]"
                  >
                    {copiedField === 'payId' ? <Check size={14} /> : <Copy size={14} />}
                    <span>Copiar Pay ID</span>
                  </button>
                </div>
              )}

              {/* QR Code Section if available */}
              {selectedPayment?.qrCodeUrl && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-md flex items-center justify-center overflow-hidden border border-slate-700">
                    <img
                      src={selectedPayment.qrCodeUrl}
                      alt="Código QR Binance Pay"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Abre la app de Binance y usa el escáner <span className="text-[#F0B90B] font-bold">[ - ]</span> en la esquina superior.
                  </p>
                </div>
              )}

              {/* Step by step guide */}
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl text-xs space-y-1 text-slate-300">
                <span className="font-bold text-[#F0B90B] text-[11px] block uppercase">Pasos rápidos:</span>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-300">
                  <li>Abre <strong className="text-white">Binance</strong> y ve a <strong className="text-white">Pay</strong> (o usa el lector QR).</li>
                  <li>Envía <strong className="text-[#F0B90B] font-mono">${calculateFinalPrice().toFixed(2)} USDT</strong> al Pay ID indicado arriba.</li>
                  <li>Copia el <strong className="text-white">ID de Transacción</strong> que te genera Binance y pégalo abajo.</li>
                </ol>
              </div>

              {/* Direct Open Button */}
              <div className="pt-1 flex gap-2">
                <a
                  href={siteSettings?.binanceCustomPayUrl || "https://pay.binance.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <span>Abrir Binance Pay</span>
                  <ExternalLink size={13} />
                </a>

                <button
                  type="button"
                  onClick={() => setShowBinanceModal(false)}
                  className="flex-1 bg-gradient-to-r from-[#F0B90B] to-[#F8D33A] hover:from-[#dfab0a] hover:to-[#e0ac0a] text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(240,185,11,0.2)] cursor-pointer"
                >
                  <span>Ya realicé el pago</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div
            key="order-success-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-surface border border-glass-border shadow-2xl rounded-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <PartyPopper size={40} className="text-green-500" />
              </div>
              <h2 className="font-display text-3xl font-bold text-on-surface mb-2">
                ¡Orden Recibida!
              </h2>
              <p className="text-on-surface-variant mb-6">
                Tu recarga está siendo procesada. Serás redirigido a tus órdenes...
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.5, ease: "linear" }}
                className="h-1 bg-green-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
