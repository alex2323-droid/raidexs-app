import { ArrowLeft, Home, ChevronRight } from 'lucide-react';
import { PromoCode, Game, GamePackage, PaymentMethod, Order, SiteSettings, isGameGiftCard } from '../types';
import { LegalTab } from './LegalModal';
import Hero from './Hero';
import PlayerVerification from './PlayerVerification';
import PackageSelection from './PackageSelection';
import PaymentMethodSelection from './PaymentMethodSelection';
import OrderSummary from './OrderSummary';
import { useState } from 'react';

interface Props {
  game: Game;
  paymentMethods: PaymentMethod[];
  siteSettings?: SiteSettings | null;
  promoCodes: PromoCode[];
  onBack: () => void;
  onCheckoutSuccess: (order: Order) => void;
  onOpenLegal?: (tab: LegalTab) => void;
}

export default function GameRecharge({ game, paymentMethods, promoCodes, onBack, onCheckoutSuccess, siteSettings, onOpenLegal }: Props) {
  const [playerId, setPlayerId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>((game.packages && game.packages.length > 1) ? game.packages[1] : (game.packages && game.packages.length > 0 ? game.packages[0] : null));
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>((paymentMethods && paymentMethods.length > 0) ? paymentMethods[0].id : '');

  const selectedPayment = (paymentMethods || []).find(m => m.id === selectedPaymentId);

  return (
    <div className="w-full animation-fade-in pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-6 w-full flex items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-elevated text-primary font-bold text-sm border border-glass-border shadow-sm transition-all active:scale-95 group"
          title="Regresar a la pantalla de Inicio"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al Inicio</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
          <button 
            onClick={onBack} 
            className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Home size={14} /> Inicio
          </button>
          <ChevronRight size={14} className="opacity-50" />
          <span>{isGameGiftCard(game) ? 'Gift Cards' : 'Juegos'}</span>
          <ChevronRight size={14} className="opacity-50" />
          <span className="text-on-surface truncate max-w-[180px]">{game.name}</span>
        </div>
      </div>

      <Hero game={game} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 flex flex-col gap-8">
          <PackageSelection 
            packages={game.packages}
            selectedPackage={selectedPackage}
            onSelect={setSelectedPackage}
            exchangeRate={siteSettings?.exchangeRate}
            gameCurrency={game.currencyName}
            gameName={game.name}
          />

          <PlayerVerification 
            playerId={playerId}
            setPlayerId={setPlayerId}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            selectedPackage={selectedPackage}
            game={game}
          />
          
          <PaymentMethodSelection 
            methods={paymentMethods}
            selectedId={selectedPaymentId}
            onSelect={setSelectedPaymentId}
            game={game}
            selectedPackage={selectedPackage}
            siteSettings={siteSettings}
          />
        </div>
        
        <div className="md:col-span-4 mt-8 md:mt-0">
          <OrderSummary 
            game={game}
            selectedPackage={selectedPackage}
            selectedPayment={selectedPayment}
            isVerified={isVerified}
            playerId={playerId}
            promoCodes={promoCodes}
            exchangeRate={siteSettings?.exchangeRate}
            siteSettings={siteSettings}
            onCheckoutSuccess={onCheckoutSuccess}
            onOpenLegal={onOpenLegal}
          />
        </div>
      </div>
    </div>
  );
}
