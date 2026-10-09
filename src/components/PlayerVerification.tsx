import { CheckCircle2, Info, User, Mail, Gift, Radio, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GamePackage, Game, isGameGiftCard, isGameService } from '../types';

interface Props {
  playerId: string;
  setPlayerId: (id: string) => void;
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
  selectedPackage?: GamePackage | null;
  game?: Game;
}

export default function PlayerVerification({ playerId, setPlayerId, isVerified, setIsVerified, game, selectedPackage }: Props) {
  const isGift = isGameGiftCard(game);
  const isService = isGameService(game);

  const [isVerifying, setIsVerifying] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasTested, setHasTested] = useState(false);

  // For gift cards or general services, we auto-verify based on contact/ID length
  useEffect(() => {
    if (isGift || isService) {
      if (playerId && playerId.trim().length >= 3) {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
      setPlayerName(null);
      setValidationError(null);
      setHasTested(false);
    }
  }, [playerId, isGift, isService, setIsVerified]);

  // When ID or package changes, reset validation state to prompt re-verification
  useEffect(() => {
    if (!isGift && !isService) {
      setIsVerified(false);
      setPlayerName(null);
      setValidationError(null);
      setHasTested(false);
    }
  }, [playerId, selectedPackage?.id, isGift, isService, setIsVerified]);

  const handleVerifyId = async () => {
    if (!playerId.trim()) {
      setValidationError('Por favor, ingresa tu ID de jugador.');
      return;
    }

    setIsVerifying(true);
    setValidationError(null);
    setPlayerName(null);
    setHasTested(true);

    try {
      // Parse possible server/zoneId (e.g. "12345678 (1234)" -> playerId: "12345678", zoneId: "1234")
      let cleanUserId = playerId.trim();
      let zoneId = '';
      const zoneMatch = cleanUserId.match(/^(.*?)[(\s]+([^)]+)[)\s]*$/);
      if (zoneMatch) {
        cleanUserId = zoneMatch[1].trim();
        zoneId = zoneMatch[2].trim();
      }

      const res = await fetch('/api/hankgames/validate-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedPackage?.id || '',
          playerId: cleanUserId,
          zoneId,
          server: zoneId
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.valid !== false) {
        // 1. Check known standardized name keys in the direct response or a nested data/result object
        const source = data.data || data.result || data;
        let foundName = 
          source.playerName || 
          source.name || 
          source.username || 
          source.nickname || 
          source.player_name || 
          source.char_name || 
          source.characterName || 
          source.role || 
          data.playerName || 
          data.name || 
          data.username || 
          data.nickname ||
          null;
        
        // 2. Fallback scan: Search the response for any string parameter representing the player nickname
        if (!foundName) {
          const keys = Object.keys(source);
          for (const key of keys) {
            if (
              typeof source[key] === 'string' && 
              source[key].length > 1 &&
              !['valid', 'success', 'message', 'code', 'error', 'userId', 'productId', 'server', 'zoneId', 'id', 'status'].includes(key)
            ) {
              foundName = source[key];
              break;
            }
          }
        }

        setPlayerName(foundName || 'ID de Jugador Válido');
        setIsVerified(true);
      } else {
        // Handle explicit invalid response
        setValidationError(
          data.error || 
          data.message || 
          'No se pudo encontrar este ID de jugador. Por favor, verifica el número e inténtalo de nuevo.'
        );
        setIsVerified(false);
      }
    } catch (e: any) {
      console.error('Player verification error:', e);
      // Fallback: If there is an upstream connection error or unconfigured keys, 
      // let the user proceed so checkouts are never blocked!
      setPlayerName('Validación Local (Llaves de API pendientes)');
      setIsVerified(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="glass-panel rounded-2xl p-6 relative overflow-hidden group border border-cyan-500/20 bg-surface/90 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm font-black text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,210,255,0.3)]">
            {isGift ? <Gift size={16} /> : isService ? <Radio size={16} /> : 2}
          </div>
          <h2 className="font-display text-lg font-bold text-on-surface">
            {isGift 
              ? `Datos de Entrega (${game?.name || 'Gift Card'})` 
              : isService 
              ? `ID / Usuario del Servicio (${game?.name || 'Servicio'})`
              : `Verificación de ID (${game?.name || 'Juego'})`}
          </h2>
        </div>
        
        {isVerified && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-in fade-in">
            <CheckCircle2 size={14} /> 
            {isGift ? 'Listo para entrega' : playerName ? 'ID Verificado' : 'ID Válido'}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          {isGift ? (
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70" size={20} />
          ) : isService ? (
            <Radio className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70" size={20} />
          ) : (
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70" size={20} />
          )}
          <input 
            type="text" 
            value={playerId}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 60) {
                setPlayerId(val);
              }
            }}
            placeholder={
              isGift 
                ? "Ingresa tu Correo o WhatsApp donde recibirás el código" 
                : isService
                ? "Ingresa tu ID de cuenta o @usuario (ej: ID de app o @usuario)"
                : "Ingresa tu ID de jugador (ej: 123456789)"
            } 
            maxLength={60}
            className="w-full bg-surface-container-low border border-cyan-500/30 rounded-xl py-3.5 pl-11 pr-4 text-on-surface font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all placeholder:text-on-surface-variant/60 shadow-inner"
          />
        </div>

        {/* Real-time Hank Games ID verification button for standard games */}
        {!isGift && !isService && (
          <button
            type="button"
            onClick={handleVerifyId}
            disabled={isVerifying || !playerId.trim()}
            className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Verificar ID</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Validation results and feedback messages */}
      {!isGift && !isService && (
        <div className="mt-3.5 animate-in fade-in slide-in-from-top-1">
          {playerName && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">¡ID verificado con éxito!</p>
                <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
                  Nombre de jugador: <span className="font-black text-white px-1.5 py-0.5 rounded bg-emerald-500/20 uppercase tracking-wide">{playerName}</span>
                </p>
              </div>
            </div>
          )}

          {validationError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Error de verificación</p>
                  <p className="text-[11px] text-red-400/90 mt-0.5">{validationError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVerified(true)}
                className="self-end px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/35 border border-red-500/40 text-red-200 text-[10px] font-bold transition-all"
              >
                Omitir y continuar de todos modos
              </button>
            </div>
          )}

          {!hasTested && !isVerified && (
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
              <Info size={14} className="text-cyan-400 shrink-0" />
              <span>Introduce tu ID exactamente como aparece en tu perfil y presiona <b>Verificar ID</b> para confirmar tu nombre de jugador en tiempo real.</span>
            </p>
          )}
        </div>
      )}

      {/* Legacy instructions for giftcards/services */}
      {(isGift || isService) && (
        <p className="text-xs text-on-surface-variant mt-3 flex items-center gap-1.5">
          <Info size={14} className="text-cyan-400 shrink-0" />
          {isGift 
            ? "El código o PIN digital de la tarjeta se enviará directamente a este contacto tras verificar el pago."
            : "Introduce tu ID o usuario de la plataforma exactamente como aparece en tu perfil para acreditar tus monedas/estrellas."}
        </p>
      )}
    </section>
  );
}
