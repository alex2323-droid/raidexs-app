export interface GamePackage {
  id: string;
  amount: number;
  currency: string;
  price: number;
  bonus?: number;
  discountPercentage?: number;
  originalPrice?: number;
  iconUrl: string;
  title?: string;
  category?: string; // e.g. 'currency' | 'package' | 'pass'
  badge?: string; // e.g. 'Reseller -12%'
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  active: boolean;
  usageCount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  iconType: 'payments' | 'account_balance' | 'credit_card' | 'binance';
  instructions?: string;
  currency?: 'USD' | 'VES';
  qrCodeUrl?: string;
  qrTitle?: string;
}

export interface Game {
  id: string;
  name: string;
  publisher: string;
  region?: string;
  discountBadge?: string;
  bannerUrl: string;
  cardUrl: string;
  currencyName: string;
  category: 'mobile' | 'pc' | 'console' | 'giftcard' | 'service';
  isGiftCard?: boolean;
  isService?: boolean;
  syncWithHankGames?: boolean;
  packages: GamePackage[];
}

export function isGameService(game?: Partial<Game> | null): boolean {
  if (!game) return false;
  if (game.isService === true) return true;
  if (game.category === 'service') return true;
  const lowerName = (game.name || '').toLowerCase();
  const lowerId = (game.id || '').toLowerCase();
  const serviceKeywords = [
    'telegram', 'poppo', 'poppolive', 'mico', 'bigo', 'bigo live', 'chamu', 'tinder', 'liveme', 'streaming', 'servicio'
  ];
  return serviceKeywords.some(kw => lowerName.includes(kw) || lowerId.includes(kw));
}

export function isGameGiftCard(game?: Partial<Game> | null): boolean {
  if (!game) return false;
  if (isGameService(game)) return false;
  if (game.isGiftCard === true) return true;
  if (game.category === 'giftcard') return true;
  const lowerName = (game.name || '').toLowerCase();
  const lowerId = (game.id || '').toLowerCase();
  const giftKeywords = [
    'gift card', 'giftcard', 'gift-card', 'tarjeta de regalo', 'tarjetas de regalo',
    'playstation', 'psn', 'steam', 'google play', 'apple', 'itunes',
    'xbox', 'nintendo', 'razer gold', 'amazon', 'netflix', 'spotify',
    'voucher', 'código', 'pin', 'riot acess', 'riot access', 'eshop'
  ];
  return giftKeywords.some(kw => lowerName.includes(kw) || lowerId.includes(kw));
}

export interface Order {
  id: string;
  date: string;
  gameId?: string;
  gameName: string;
  packageId?: string;
  packageName: string;
  price: number;
  status: 'completed' | 'pending' | 'failed' | 'rejected';
  paymentMethod: string;
  referenceNumber?: string;
  userId?: string;
  userEmail?: string;
  playerId?: string;
  receiptUrl?: string;
  hankGamesResult?: any;
}

export interface SiteSettings {
  publicSiteDisabled?: boolean;
  mascotHomeUrl: string;
  mascotSupportUrl: string;
  mascotLoginUrl: string;
  showMascotHome: boolean;
  showMascotSupport: boolean;
  showMascotLogin: boolean;
  paymentMethods: PaymentMethod[];
  exchangeRate?: number;
  useAutomaticBcvRate?: boolean;
  supportPhone?: string;
  hankGamesClientId?: string;
  hankGamesClientSecret?: string;
  binanceEnabled?: boolean;
  binanceApiKey?: string;
  binanceApiSecret?: string;
  binanceMerchantId?: string;
  binancePayId?: string;
  binanceCustomPayUrl?: string;
  binanceValidationMode?: 'merchant_pay' | 'api_transactions' | 'auto';
  siteLogoUrl?: string;
  siteBannerUrl?: string;
  renderDomain?: string;
  apkDownloadUrl?: string;
  githubRepoUrl?: string;
}
