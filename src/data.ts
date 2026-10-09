import { Game, GamePackage, PaymentMethod } from './types';

const defaultPackages: GamePackage[] = [
  {
    id: '6a58ee9a45127738a897b7de', // 110 Diamonds HankGames ID
    amount: 110,
    currency: 'Diamonds',
    price: 0.99,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2850/2850785.png',
  },
  {
    id: '6a58ee9a45127738a897b7df', // 341 Diamonds HankGames ID
    amount: 341,
    currency: 'Diamonds',
    price: 2.99,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2850/2850785.png',
  },
  {
    id: '6a58ee9a45127738a897b7e0', // 572 Diamonds HankGames ID
    amount: 572,
    currency: 'Diamonds',
    price: 4.99,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2850/2850785.png',
  },
];

export const GAMES: Game[] = [
  // --- JUEGOS DE RECARGA ---
  {
    id: 'free_fire',
    name: 'Free Fire',
    publisher: 'Garena',
    region: 'NORTE / SUR',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Diamonds',
    category: 'mobile',
    packages: [
      { id: 'ff_100', amount: 100, bonus: 10, currency: 'Diamonds', price: 0.99, category: 'Diamantes', iconUrl: '' },
      { id: 'ff_310', amount: 310, bonus: 31, currency: 'Diamonds', price: 2.95, category: 'Diamantes', iconUrl: '' },
      { id: 'ff_520', amount: 520, bonus: 52, currency: 'Diamonds', price: 4.90, category: 'Diamantes', iconUrl: '' },
      { id: 'ff_1060', amount: 1060, bonus: 106, currency: 'Diamonds', price: 9.80, category: 'Diamantes', iconUrl: '' },
      { id: 'ff_2180', amount: 2180, bonus: 218, currency: 'Diamonds', price: 19.60, category: 'Diamantes', iconUrl: '' },
      { id: 'ff_5600', amount: 5600, bonus: 560, currency: 'Diamonds', price: 49.00, category: 'Diamantes', iconUrl: '' },
      { id: 'ff_booyah', amount: 1, title: 'Pase Booyah Premium', currency: 'Pase', price: 4.20, category: 'Paquetes', iconUrl: '' },
      { id: 'ff_semanal', amount: 1, title: 'Membresía Semanal', currency: 'Membresía', price: 1.99, category: 'Paquetes', iconUrl: '' },
    ]
  },
  {
    id: 'blood_strike',
    name: 'Blood Strike',
    publisher: 'NetEase Games',
    region: 'GLOBAL',
    bannerUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLvf6VgpMfUzP1AJyNaL8GRJh7jGhmt3ucpBAVF2j2tl_s0pIUtNcv_9799NOJtYN_HXpJwvX2qb5y3QTa8jqfhjVan0_YhPAoLmNU_lpPjJOpXm5Ab3QVtvQprAOmK_ta7WVuhhoCkiPLTOP48epbXUS8-dh6ncCLpkGwKFQ_zCyXZmajVPCJ1MViNXIxHStoNOwB5fEeEpEfRANBzNohERtCh6XUw0Asx6Ijs9-l2WIq2Q_GXGauT7cFoS',
    cardUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Gold',
    category: 'mobile',
    packages: [
      { id: 'bs_100', amount: 100, bonus: 5, currency: 'Gold', price: 0.99, category: 'Golds', iconUrl: '' },
      { id: 'bs_300', amount: 300, bonus: 20, currency: 'Gold', price: 2.95, category: 'Golds', iconUrl: '' },
      { id: 'bs_500', amount: 500, bonus: 40, currency: 'Gold', price: 4.90, category: 'Golds', iconUrl: '' },
      { id: 'bs_1000', amount: 1000, bonus: 100, currency: 'Gold', price: 9.80, category: 'Golds', iconUrl: '' },
      { id: 'bs_2000', amount: 2000, bonus: 260, currency: 'Gold', price: 19.60, category: 'Golds', iconUrl: '' },
      { id: 'bs_5000', amount: 5000, bonus: 800, currency: 'Gold', price: 49.00, category: 'Golds', iconUrl: '' },
      { id: 'bs_pase_elite', amount: 1, title: 'Pase Elite', currency: 'Pase', price: 4.50, category: 'Paquetes', iconUrl: '' },
      { id: 'bs_pase_premium', amount: 1, title: 'Pase Premium', currency: 'Pase', price: 9.90, category: 'Paquetes', iconUrl: '' },
    ]
  },
  {
    id: 'mobile_legends',
    name: 'Mobile Legends',
    publisher: 'Moonton',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Diamonds',
    category: 'mobile',
    packages: [
      { id: 'ml_50', amount: 50, bonus: 5, currency: 'Diamonds', price: 0.99, category: 'Diamantes', iconUrl: '' },
      { id: 'ml_250', amount: 250, bonus: 25, currency: 'Diamonds', price: 4.80, category: 'Diamantes', iconUrl: '' },
      { id: 'ml_500', amount: 500, bonus: 65, currency: 'Diamonds', price: 9.50, category: 'Diamantes', iconUrl: '' },
      { id: 'ml_1000', amount: 1000, bonus: 155, currency: 'Diamonds', price: 18.90, category: 'Diamantes', iconUrl: '' },
      { id: 'ml_pass', amount: 1, title: 'Twilight Pass', currency: 'Pase', price: 9.99, category: 'Paquetes', iconUrl: '' },
    ]
  },
  {
    id: 'pubg_mobile',
    name: 'Pubg Mobile',
    publisher: 'Tencent Games',
    region: 'NORTE - SUR',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'UC',
    category: 'mobile',
    packages: [
      { id: 'pubg_60', amount: 60, bonus: 3, currency: 'UC', price: 0.99, category: 'UC', iconUrl: '' },
      { id: 'pubg_300', amount: 300, bonus: 25, currency: 'UC', price: 4.90, category: 'UC', iconUrl: '' },
      { id: 'pubg_600', amount: 600, bonus: 60, currency: 'UC', price: 9.80, category: 'UC', iconUrl: '' },
      { id: 'pubg_1500', amount: 1500, bonus: 300, currency: 'UC', price: 24.50, category: 'UC', iconUrl: '' },
      { id: 'pubg_royale', amount: 1, title: 'Royale Pass Elite', currency: 'Pase', price: 9.99, category: 'Paquetes', iconUrl: '' },
    ]
  },
  {
    id: 'delta_force',
    name: 'Delta Force',
    publisher: 'Garena',
    region: 'GARENA',
    bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Coins',
    category: 'mobile',
    packages: [
      { id: 'df_100', amount: 100, currency: 'Coins', price: 1.20, iconUrl: '' },
      { id: 'df_500', amount: 500, currency: 'Coins', price: 5.50, iconUrl: '' },
      { id: 'df_1000', amount: 1000, currency: 'Coins', price: 10.50, iconUrl: '' },
    ]
  },
  {
    id: 'arena_breakout',
    name: 'Arena Breakout',
    publisher: 'Level Infinite',
    region: 'EEUU - LATAM',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Bonds',
    category: 'mobile',
    packages: [
      { id: 'ab_60', amount: 60, currency: 'Bonds', price: 0.99, iconUrl: '' },
      { id: 'ab_310', amount: 310, currency: 'Bonds', price: 4.80, iconUrl: '' },
      { id: 'ab_650', amount: 650, currency: 'Bonds', price: 9.80, iconUrl: '' },
      { id: 'ab_pass', amount: 1, title: 'Pase de Batalla', currency: 'Pase', price: 4.99, iconUrl: '' },
    ]
  },
  {
    id: 'rainbow_six_mobile',
    name: 'Rainbow Six Mobile',
    publisher: 'Ubisoft',
    region: 'NORTE / SUR',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Platinum',
    category: 'mobile',
    packages: [
      { id: 'r6_500', amount: 500, currency: 'Platinum', price: 4.99, iconUrl: '' },
      { id: 'r6_1200', amount: 1200, currency: 'Platinum', price: 9.99, iconUrl: '' },
      { id: 'r6_2600', amount: 2600, currency: 'Platinum', price: 19.99, iconUrl: '' },
    ]
  },
  {
    id: 'identity_v',
    name: 'Identity V',
    publisher: 'NetEase Games',
    region: 'NORTE / SUR',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Echoes',
    category: 'mobile',
    packages: [
      { id: 'idv_60', amount: 60, currency: 'Echoes', price: 0.99, iconUrl: '' },
      { id: 'idv_300', amount: 300, currency: 'Echoes', price: 4.90, iconUrl: '' },
      { id: 'idv_680', amount: 680, currency: 'Echoes', price: 9.90, iconUrl: '' },
    ]
  },
  {
    id: 'where_winds_meet',
    name: 'Where Winds Meet',
    publisher: 'NetEase Games',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Coins',
    category: 'pc',
    packages: [
      { id: 'wwm_300', amount: 300, currency: 'Coins', price: 4.99, iconUrl: '' },
      { id: 'wwm_600', amount: 600, currency: 'Coins', price: 9.99, iconUrl: '' },
    ]
  },
  {
    id: 'honor_of_kings',
    name: 'Honor Of Kings',
    publisher: 'Level Infinite',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Tokens',
    category: 'mobile',
    packages: [
      { id: 'hok_80', amount: 80, currency: 'Tokens', price: 0.99, iconUrl: '' },
      { id: 'hok_400', amount: 400, currency: 'Tokens', price: 4.90, iconUrl: '' },
      { id: 'hok_800', amount: 800, currency: 'Tokens', price: 9.80, iconUrl: '' },
    ]
  },
  {
    id: 'wuthering_waves',
    name: 'Wuthering Wave',
    publisher: 'Kuro Games',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Lunite',
    category: 'mobile',
    packages: [
      { id: 'wuwa_60', amount: 60, currency: 'Lunite', price: 0.99, iconUrl: '' },
      { id: 'wuwa_300', amount: 300, currency: 'Lunite', price: 4.99, iconUrl: '' },
      { id: 'wuwa_980', amount: 980, currency: 'Lunite', price: 14.99, iconUrl: '' },
    ]
  },
  {
    id: 'supersus',
    name: 'SuperSUS',
    publisher: 'PI Productions',
    region: 'EEUU - LATAM',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Goldstar',
    category: 'mobile',
    packages: [
      { id: 'ss_100', amount: 100, currency: 'Goldstar', price: 0.99, iconUrl: '' },
      { id: 'ss_500', amount: 500, currency: 'Goldstar', price: 4.80, iconUrl: '' },
    ]
  },
  {
    id: 'marvel_rivals',
    name: 'Marvel Rivals',
    publisher: 'NetEase Games',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Units',
    category: 'pc',
    packages: [
      { id: 'mr_500', amount: 500, currency: 'Units', price: 4.99, iconUrl: '' },
      { id: 'mr_1000', amount: 1000, currency: 'Units', price: 9.99, iconUrl: '' },
      { id: 'mr_2200', amount: 2200, currency: 'Units', price: 19.99, iconUrl: '' },
    ]
  },
  {
    id: 'farlight_84',
    name: 'Farlight 84',
    publisher: 'Farlight Games',
    region: 'EEUU - LATAM',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Diamonds',
    category: 'mobile',
    packages: [
      { id: 'fl_60', amount: 60, currency: 'Diamonds', price: 0.99, iconUrl: '' },
      { id: 'fl_300', amount: 300, currency: 'Diamonds', price: 4.80, iconUrl: '' },
      { id: 'fl_600', amount: 600, currency: 'Diamonds', price: 9.50, iconUrl: '' },
    ]
  },
  {
    id: 'valorant',
    name: 'Valorant',
    publisher: 'Riot Games',
    region: 'LATAM / NA',
    bannerUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'VP',
    category: 'pc',
    packages: [
      { id: 'val_110', amount: 110, currency: 'VP', price: 0.99, iconUrl: '' },
      { id: 'val_341', amount: 341, currency: 'VP', price: 2.99, iconUrl: '' },
      { id: 'val_572', amount: 572, currency: 'VP', price: 4.99, iconUrl: '' },
    ]
  },
  {
    id: 'roblox',
    name: 'Roblox',
    publisher: 'Roblox Corporation',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Robux',
    category: 'pc',
    packages: [
      { id: 'rbx_110', amount: 110, currency: 'Robux', price: 0.99, iconUrl: '' },
      { id: 'rbx_341', amount: 341, currency: 'Robux', price: 2.99, iconUrl: '' },
      { id: 'rbx_572', amount: 572, currency: 'Robux', price: 4.99, iconUrl: '' },
    ]
  },

  // --- GIFT CARDS ---
  {
    id: 'apple_gift_card',
    name: 'Apple Gift Cards',
    publisher: 'Apple',
    region: 'ESTADOS UNIDOS',
    bannerUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'giftcard',
    isGiftCard: true,
    packages: [
      { id: 'apple_10', amount: 10, currency: 'USD', price: 10.99, iconUrl: '' },
      { id: 'apple_25', amount: 25, currency: 'USD', price: 26.50, iconUrl: '' },
      { id: 'apple_50', amount: 50, currency: 'USD', price: 52.00, iconUrl: '' },
    ]
  },
  {
    id: 'xbox_gift_card',
    name: 'Xbox Card',
    publisher: 'Microsoft',
    region: 'DIGITAL CARD',
    bannerUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'giftcard',
    isGiftCard: true,
    packages: [
      { id: 'xbox_10', amount: 10, currency: 'USD', price: 10.99, iconUrl: '' },
      { id: 'xbox_25', amount: 25, currency: 'USD', price: 26.50, iconUrl: '' },
      { id: 'xbox_50', amount: 50, currency: 'USD', price: 52.00, iconUrl: '' },
    ]
  },
  {
    id: 'steam_gift_card',
    name: 'Steam Card',
    publisher: 'Valve',
    region: 'WALLET CARD',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1612287232210-9cf43f3b9fa7?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'giftcard',
    isGiftCard: true,
    packages: [
      { id: 'steam_5', amount: 5, currency: 'USD', price: 5.50, iconUrl: '' },
      { id: 'steam_10', amount: 10, currency: 'USD', price: 10.99, iconUrl: '' },
      { id: 'steam_20', amount: 20, currency: 'USD', price: 21.50, iconUrl: '' },
      { id: 'steam_50', amount: 50, currency: 'USD', price: 52.00, iconUrl: '' },
    ]
  },
  {
    id: 'roblox_gift_card',
    name: 'Roblox Gift Cards',
    publisher: 'Roblox Corporation',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'giftcard',
    isGiftCard: true,
    packages: [
      { id: 'rbx_card_10', amount: 10, currency: 'USD', price: 10.99, iconUrl: '' },
      { id: 'rbx_card_25', amount: 25, currency: 'USD', price: 26.50, iconUrl: '' },
    ]
  },
  {
    id: 'psn',
    name: 'PlayStation',
    publisher: 'Sony Interactive Entertainment',
    region: 'ESTADOS UNIDOS',
    bannerUrl: 'https://images.unsplash.com/photo-1606144042871-331bdcb97647?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1606144042871-331bdcb97647?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'giftcard',
    isGiftCard: true,
    packages: [
      { id: 'psn_10', amount: 10, currency: 'USD', price: 10.99, iconUrl: '' },
      { id: 'psn_25', amount: 25, currency: 'USD', price: 26.50, iconUrl: '' },
      { id: 'psn_50', amount: 50, currency: 'USD', price: 52.00, iconUrl: '' },
    ]
  },
  {
    id: 'nintendo_eshop',
    name: 'Nintendo EShop',
    publisher: 'Nintendo',
    region: 'ESTADOS UNIDOS',
    bannerUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'giftcard',
    isGiftCard: true,
    packages: [
      { id: 'nin_10', amount: 10, currency: 'USD', price: 10.99, iconUrl: '' },
      { id: 'nin_20', amount: 20, currency: 'USD', price: 21.50, iconUrl: '' },
      { id: 'nin_50', amount: 50, currency: 'USD', price: 52.00, iconUrl: '' },
    ]
  },
  {
    id: 'riot_access_latam',
    name: 'Riot Acess Latam',
    publisher: 'Riot Games',
    region: 'LATAM',
    bannerUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'giftcard',
    isGiftCard: true,
    packages: [
      { id: 'riot_5', amount: 5, currency: 'USD', price: 5.50, iconUrl: '' },
      { id: 'riot_10', amount: 10, currency: 'USD', price: 10.99, iconUrl: '' },
      { id: 'riot_25', amount: 25, currency: 'USD', price: 26.50, iconUrl: '' },
    ]
  },
  {
    id: 'google_play',
    name: 'Google Play',
    publisher: 'Google',
    region: 'ESTADOS UNIDOS',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'giftcard',
    isGiftCard: true,
    packages: [
      { id: 'gp_5', amount: 5, currency: 'USD', price: 5.50, iconUrl: '' },
      { id: 'gp_10', amount: 10, currency: 'USD', price: 10.99, iconUrl: '' },
      { id: 'gp_25', amount: 25, currency: 'USD', price: 26.50, iconUrl: '' },
    ]
  },
  {
    id: 'razer_gold',
    name: 'Razer Gold PIN',
    publisher: 'Razer',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'USD',
    category: 'giftcard',
    isGiftCard: true,
    packages: [
      { id: 'razer_5', amount: 5, currency: 'USD', price: 5.50, iconUrl: '' },
      { id: 'razer_10', amount: 10, currency: 'USD', price: 10.99, iconUrl: '' },
      { id: 'razer_20', amount: 20, currency: 'USD', price: 21.50, iconUrl: '' },
    ]
  },

  // --- OTROS SERVICIOS ---
  {
    id: 'telegram',
    name: 'Telegram',
    publisher: 'Telegram FZ-LLC',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Stars / Premium',
    category: 'service',
    isService: true,
    packages: [
      { id: 'tg_50', amount: 50, currency: 'Stars', price: 1.10, iconUrl: '' },
      { id: 'tg_100', amount: 100, currency: 'Stars', price: 2.10, iconUrl: '' },
      { id: 'tg_500', amount: 500, currency: 'Stars', price: 9.99, iconUrl: '' },
      { id: 'tg_premium_3m', amount: 3, title: 'Telegram Premium 3 Meses', currency: 'Meses', price: 12.99, iconUrl: '' },
    ]
  },
  {
    id: 'poppolive',
    name: 'Poppolive',
    publisher: 'Poppo Live',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Coins',
    category: 'service',
    isService: true,
    packages: [
      { id: 'pp_7000', amount: 7000, currency: 'Coins', price: 0.99, iconUrl: '' },
      { id: 'pp_35000', amount: 35000, currency: 'Coins', price: 4.80, iconUrl: '' },
      { id: 'pp_70000', amount: 70000, currency: 'Coins', price: 9.50, iconUrl: '' },
    ]
  },
  {
    id: 'mico',
    name: 'mico',
    publisher: 'MICO World',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Coins',
    category: 'service',
    isService: true,
    packages: [
      { id: 'mico_300', amount: 300, currency: 'Coins', price: 0.99, iconUrl: '' },
      { id: 'mico_1500', amount: 1500, currency: 'Coins', price: 4.80, iconUrl: '' },
      { id: 'mico_3200', amount: 3200, currency: 'Coins', price: 9.80, iconUrl: '' },
    ]
  },
  {
    id: 'bigo_live',
    name: 'Bigo Live',
    publisher: 'Bigo Technology',
    region: 'GLOBAL',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&h=800',
    currencyName: 'Diamonds',
    category: 'service',
    isService: true,
    packages: [
      { id: 'bigo_40', amount: 40, currency: 'Diamonds', price: 0.99, iconUrl: '' },
      { id: 'bigo_210', amount: 210, currency: 'Diamonds', price: 4.90, iconUrl: '' },
      { id: 'bigo_450', amount: 450, currency: 'Diamonds', price: 9.90, iconUrl: '' },
    ]
  }
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { 
    id: 'pago_movil', 
    name: 'Pago Móvil', 
    iconType: 'payments',
    instructions: 'Banco: Banco de Venezuela\nCI: V-31536656\nTeléfono: 0414-2943532\nTitular: Raidexs',
    currency: 'VES'
  },
];
