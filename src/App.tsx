import { useState, useEffect, useRef } from "react";
import { PromoCode, Game, Order, SiteSettings, isGameGiftCard } from "./types";
import { GAMES, PAYMENT_METHODS } from "./data";
import { MessageCircle } from "lucide-react";
import Header from "./components/Header";
import Home from "./components/Home";
import GameRecharge from "./components/GameRecharge";
import OrdersHistory from "./components/OrdersHistory";
import Support from "./components/Support";
import Profile from "./components/Profile";
import MobileNav from "./components/MobileNav";
import GmailInbox from "./components/GmailInbox";
import Footer from "./components/Footer";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel";
import AccessDenied from "./components/AccessDenied";
import DeactivatedSite from "./components/DeactivatedSite";
import LegalModal, { LegalTab } from "./components/LegalModal";
import CookieConsentBanner from "./components/CookieConsentBanner";
import HermesAgent from "./components/HermesAgent";
import DownloadAppModal from "./components/DownloadAppModal";
import { auth, db, getAccessToken } from "./firebase";
import { sendEmail } from "./gmailService";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc, updateDoc, addDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";

const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 horas (Sesión periódica requerida)

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "home" | "orders" | "support" | "profile" | "inbox" | "admin"
  >("home");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [games, setGamesRaw] = useState<Game[]>([]);

  const setGames = (newGames: Game[]) => {
    const cleanName = (n: string) => {
      if (!n) return "";
      return n.replace(/\s*-\s*topup/ig, "")
              .replace(/\s*-\s*top\s+up/ig, "")
              .replace(/\s+topup/ig, "")
              .replace(/\s+top\s+up/ig, "")
              .replace(/\s+direct/ig, "")
              .replace(/\s*-\s*direct/ig, "")
              .trim();
    };

    const cleanCurrency = (curr: string) => {
      if (!curr) return "";
      const lower = curr.toLowerCase();
      if (lower === 'diamonds') return 'Diamantes';
      if (lower === 'gold' || lower === 'golds') return 'Oro';
      if (lower === 'coins') return 'Monedas';
      if (lower === 'bonds') return 'Bonos';
      if (lower === 'platinum') return 'Platino';
      if (lower === 'echoes') return 'Ecos';
      if (lower === 'tokens') return 'Fichas';
      if (lower === 'lunite') return 'Lunita';
      if (lower === 'units') return 'Unidades';
      if (lower === 'stars') return 'Estrellas';
      return curr;
    };

    const cleaned = newGames.map(g => {
      const cleanedPackages = (g.packages || []).map(p => ({
        ...p,
        currency: cleanCurrency(p.currency),
        category: p.category ? p.category.replace('Diamonds', 'Diamantes').replace('Golds', 'Oro').replace('Coins', 'Monedas') : undefined
      }));

      return {
        ...g,
        name: cleanName(g.name),
        currencyName: cleanCurrency(g.currencyName),
        packages: cleanedPackages
      };
    });

    setGamesRaw(cleaned);
  };
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loadingGames, setLoadingGames] = useState(true);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>("terms");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenDownloadApp = () => setIsDownloadModalOpen(true);
    window.addEventListener("open-download-app", handleOpenDownloadApp);
    return () => window.removeEventListener("open-download-app", handleOpenDownloadApp);
  }, []);

  const handleOpenLegal = (tab: LegalTab = "terms") => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Fetch games, promo codes, and site settings using onSnapshot for real-time updates and instant caching fallback when offline
  useEffect(() => {
    // 1. Listen for games
    const unsubscribeGames = onSnapshot(collection(db, "games"), (gamesSnap) => {
      if (!gamesSnap.empty) {
        const loadedGames = gamesSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Game);
        const hasGiftCards = loadedGames.some((g) => isGameGiftCard(g));
        const baseGames = !hasGiftCards ? [...loadedGames, ...GAMES.filter((g) => isGameGiftCard(g))] : loadedGames;
        const uniqueGames: Game[] = Array.from(new Map<string, Game>(baseGames.map(g => [g.id, g])).values());
        setGames(uniqueGames);
      } else {
        setGames(GAMES);
      }
      setLoadingGames(false);
    }, (error) => {
      console.warn("Failed to load games in real-time, using defaults", error);
      setGames(GAMES);
      setLoadingGames(false);
    });

    // 2. Listen for promo codes
    const unsubscribePromos = onSnapshot(collection(db, "promoCodes"), (promoSnap) => {
      if (!promoSnap.empty) {
        const loadedPromoCodes = promoSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as PromoCode,
        );
        const uniquePromoCodes: PromoCode[] = Array.from(new Map<string, PromoCode>(loadedPromoCodes.map(c => [c.id, c])).values());
        setPromoCodes(uniquePromoCodes);
      }
    }, (error) => {
      console.warn("Failed to load promo codes in real-time", error);
    });

    // 3. Listen for site settings
    const unsubscribeSettings = onSnapshot(doc(db, "siteSettings", "general"), async (settingsDoc) => {
      if (settingsDoc.exists()) {
        const loadedSettings = settingsDoc.data() as SiteSettings;

        if (loadedSettings.useAutomaticBcvRate) {
          try {
            const bcvRes = await fetch('https://ve.dolarapi.com/v1/dolares');
            const bcvData = await bcvRes.json();
            const oficial = bcvData.find((d: any) => d.fuente === 'oficial');
            if (oficial && oficial.promedio) {
              loadedSettings.exchangeRate = oficial.promedio;
            }
          } catch(e) {
            console.error("Failed to fetch BCV rate", e);
          }
        }
        setSiteSettings(loadedSettings);
      } else {
        const newSettings: SiteSettings = {
          publicSiteDisabled: false,
          mascotHomeUrl: "",
          mascotSupportUrl: "",
          mascotLoginUrl: "",
          showMascotHome: true,
          showMascotSupport: true,
          showMascotLogin: true,
          paymentMethods: PAYMENT_METHODS,
          supportPhone: "+584142943532",
          binanceEnabled: false,
          binanceApiKey: "",
          binanceApiSecret: "",
          binanceMerchantId: "",
          binancePayId: "",
          binanceValidationMode: "auto",
        };
        setSiteSettings(newSettings);
      }
    }, (error) => {
      console.warn("Could not load remote site settings in real-time, using defaults", error);
      setSiteSettings((prev) => prev || {
        publicSiteDisabled: false,
        mascotHomeUrl: "",
        mascotSupportUrl: "",
        mascotLoginUrl: "",
        showMascotHome: true,
        showMascotSupport: true,
        showMascotLogin: true,
        paymentMethods: PAYMENT_METHODS,
        supportPhone: "+584142943532",
        binanceEnabled: false,
        binanceApiKey: "",
        binanceApiSecret: "",
        binanceMerchantId: "",
        binancePayId: "",
        binanceValidationMode: "auto",
      });
    });

    return () => {
      unsubscribeGames();
      unsubscribePromos();
      unsubscribeSettings();
    };
  }, []);

  useEffect(() => {
    let unsubscribeOrders: (() => void) | undefined;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
        unsubscribeOrders = undefined;
      }
      
      if (user) {
        // Check session expiration
        let lastLoginTime = 0;
        try {
          const lastLoginTimeStr = localStorage.getItem("lastLoginTime");
          if (!lastLoginTimeStr) {
            // New login or registration, initialize the timer
            lastLoginTime = Date.now();
            localStorage.setItem("lastLoginTime", lastLoginTime.toString());
          } else {
            lastLoginTime = parseInt(lastLoginTimeStr, 10);
          }
        } catch (e) {
          console.warn("localStorage access denied", e);
          lastLoginTime = Date.now(); // assume fresh if we can't read
        }

        if (Date.now() - lastLoginTime > SESSION_TIMEOUT_MS) {
          // Session expired
          try {
            localStorage.removeItem("lastLoginTime");
          } catch (e) {
            console.warn("localStorage access denied", e);
          }
          signOut(auth).then(() => {
            setIsAuthenticated(false);
            setIsAuthorized(false);
          });
        } else {
          setIsAuthenticated(true);
          const userEmail = user.email || "";
          
          setIsAuthorized(true);

          const isUserAdmin = userEmail.toLowerCase() === "nexplay2307@gmail.com" ||
              userEmail.toLowerCase() === "alexparababi23@gmail.com" ||
              userEmail.toLowerCase() === "avila2004alexparababi@gmail.com";
          setIsAdmin(isUserAdmin);

          const loadOrders = () => {
            try {
              let ordersQuery;
              if (isUserAdmin) {
                // Admins see all orders
                ordersQuery = query(collection(db, "orders"));
              } else {
                ordersQuery = query(collection(db, "orders"), where("userId", "==", user.uid));
              }
              
              unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
                const loadedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order);
                const uniqueOrders: Order[] = Array.from(new Map<string, Order>(loadedOrders.map(o => [o.id, o])).values());
                uniqueOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setOrders(uniqueOrders);
              }, (error) => {
                console.error("Error fetching orders:", error);
              });
            } catch (error) {
              console.error("Error setting up order snapshot:", error);
            }
          };
          loadOrders();
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setOrders([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, []);

  useEffect(() => {
    // Check session timeout periodically every 15 seconds
    const interval = setInterval(() => {
      if (auth.currentUser) {
        let lastLoginTime = 0;
        try {
          const lastLoginTimeStr = localStorage.getItem("lastLoginTime");
          lastLoginTime = lastLoginTimeStr ? parseInt(lastLoginTimeStr, 10) : 0;
        } catch (e) {
          console.warn("localStorage access denied", e);
          return;
        }
        if (
          lastLoginTime > 0 &&
          Date.now() - lastLoginTime > SESSION_TIMEOUT_MS
        ) {
          try {
            localStorage.removeItem("lastLoginTime");
          } catch (e) {
            console.warn("localStorage access denied", e);
          }
          signOut(auth).then(() => {
            setIsAuthenticated(false);
          });
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (
    tab: "home" | "orders" | "support" | "profile" | "inbox" | "admin",
  ) => {
    setActiveTab(tab);
    // Always clear selectedGame so that clicking "Inicio" or any tab returns to the main view
    setSelectedGame(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setActiveTab("home"); // Ensure we are on home tab when viewing a game
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCheckoutSuccess = (order: Order) => {
    setSelectedGame(null);
    setActiveTab("orders"); // Jump to orders history after a successful purchase
  };

  const handleUpdateGames = async (updatedGames: Game[]) => {
    const oldGamesMap = new Map(games.map(g => [g.id, JSON.stringify(g)]));
    setGames(updatedGames);
    try {
      const batch = writeBatch(db);

      const gamesSnap = await getDocs(collection(db, "games"));
      const existingIds = gamesSnap.docs.map((d) => d.id);
      const newIds = updatedGames.map((g) => g.id);

      for (const id of existingIds) {
        if (!newIds.includes(id)) {
          batch.delete(doc(db, "games", id));
        }
      }

      for (const game of updatedGames) {
        const gameStr = JSON.stringify(game);
        if (oldGamesMap.get(game.id) !== gameStr || !existingIds.includes(game.id)) {
          const cleanGame = JSON.parse(gameStr);
          
          // Firestore has a 1MB limit per document. 
          // 800,000 characters is a safe threshold to strip oversized base64 images.
          if (cleanGame.bannerUrl && cleanGame.bannerUrl.length > 800000) {
            cleanGame.bannerUrl = "";
          }
          if (cleanGame.cardUrl && cleanGame.cardUrl.length > 800000) {
            cleanGame.cardUrl = "";
          }
          if (cleanGame.packages) {
            cleanGame.packages.forEach((pkg: any) => {
              if (pkg.iconUrl && pkg.iconUrl.length > 800000) {
                pkg.iconUrl = "";
              }
            });
          }

          batch.set(doc(db, "games", cleanGame.id), cleanGame);
        }
      }

      await batch.commit();
      return true;
    } catch (err: any) {
      console.error("Failed to save games update to backend", err);
      return false;
    }
  };

  const handleUpdatePromoCodes = async (updatedCodes: PromoCode[]) => {
    const oldCodesMap = new Map(promoCodes.map(c => [c.id, JSON.stringify(c)]));
    setPromoCodes(updatedCodes);
    try {
      const batch = writeBatch(db);
      const snap = await getDocs(collection(db, "promoCodes"));
      const existingIds = snap.docs.map((d) => d.id);
      const newIds = updatedCodes.map((c) => c.id);

      for (const id of existingIds) {
        if (!newIds.includes(id)) {
          batch.delete(doc(db, "promoCodes", id));
        }
      }

      for (const code of updatedCodes) {
        const codeStr = JSON.stringify(code);
        if (oldCodesMap.get(code.id) !== codeStr || !existingIds.includes(code.id)) {
          const cleanCode = JSON.parse(codeStr);
          batch.set(doc(db, "promoCodes", cleanCode.id), cleanCode);
        }
      }

      await batch.commit();
      return true;
    } catch (err: any) {
      console.error("Failed to save promo codes to backend", err);
      return false;
    }
  };

  const handleUpdateSiteSettings = async (settings: SiteSettings) => {
    setSiteSettings(settings);
    try {
      const cleanSettings = JSON.parse(JSON.stringify(settings));
      if (cleanSettings.logoUrl && cleanSettings.logoUrl.length > 800000) {
        cleanSettings.logoUrl = "";
      }
      if (cleanSettings.heroBannerUrl && cleanSettings.heroBannerUrl.length > 800000) {
        cleanSettings.heroBannerUrl = "";
      }
      await setDoc(doc(db, "siteSettings", "general"), cleanSettings);
      return true;
    } catch (err: any) {
      console.error("Failed to save site settings", err);
      return false;
    }
  };

  const handleUpdateOrder = async (orderId: string, status: 'completed' | 'pending' | 'failed' | 'rejected') => {
    try {
      const orderToUpdate = (orders || []).find(o => o.id === orderId);
      if (!orderToUpdate) return false;
      const updatedOrder = { ...orderToUpdate, status };
      
      await setDoc(doc(db, 'orders', orderId), updatedOrder);
      
      if (status === 'completed' || status === 'rejected') {
        let apiUrl = import.meta.env.VITE_API_URL || '';
        if (apiUrl.includes('<AQUI')) apiUrl = '';
        apiUrl = apiUrl.replace(/\/+$/, '');
        fetch(`/api/notify-order-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: updatedOrder,
            customerEmail: updatedOrder.userEmail,
            status
          })
        }).then(async (response) => {
          if (response.ok) {
            const resData = await response.json();
            const apiResult = resData.hankGamesResult;
            if (apiResult) {
              // Update order in Firestore with the API result
              try {
                await updateDoc(doc(db, 'orders', updatedOrder.id), {
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
                type: 'notify-order-status',
                orderId: updatedOrder.id,
                customerEmail: updatedOrder.userEmail,
                error: errorData,
                status: response.status,
                timestamp: new Date().toISOString()
              });
            } catch (logErr) {
              console.error('Failed to log email error to Firestore', logErr);
            }
          }
        }).catch(async (e) => {
          console.error("Failed to trigger email notification", e);
          try {
            await addDoc(collection(db, 'email_errors'), {
              type: 'notify-order-status',
              orderId: updatedOrder.id,
              customerEmail: updatedOrder.userEmail,
              error: e instanceof Error ? e.message : String(e),
              timestamp: new Date().toISOString()
            });
          } catch (logErr) {
            console.error('Failed to log email error to Firestore', logErr);
          }
        });
      }
      
      // Removed setOrders as onSnapshot will handle it automatically
      // setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      return true;
    } catch (err) {
      console.error("Failed to update order", err);
      return false;
    }
  };

  const renderContent = () => {
    if (loadingGames)
      return (
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    if (activeTab === "inbox") return <GmailInbox />;
    if (activeTab === "orders") return <OrdersHistory orders={orders} />;
    if (activeTab === "support")
      return (
        <Support
          siteSettings={siteSettings}
          onOpenHermes={() => window.dispatchEvent(new CustomEvent("open-hermes-agent"))}
        />
      );
    if (activeTab === "profile") return <Profile orders={orders} />;
    if (activeTab === "admin" && isAdmin)
      return (
        <AdminPanel
          games={games}
          promoCodes={promoCodes}
          siteSettings={siteSettings}
          orders={orders}
          onUpdateGames={handleUpdateGames}
          onUpdatePromoCodes={handleUpdatePromoCodes}
          onUpdateSiteSettings={handleUpdateSiteSettings}
          onUpdateOrder={handleUpdateOrder}
        />
      );

    // Default to 'home' tab
    if (selectedGame) {
      return (
        <GameRecharge
          game={selectedGame}
          siteSettings={siteSettings}
          paymentMethods={siteSettings?.paymentMethods || PAYMENT_METHODS}
          promoCodes={promoCodes}
          onBack={() => setSelectedGame(null)}
          onCheckoutSuccess={handleCheckoutSuccess}
          onOpenLegal={handleOpenLegal}
        />
      );
    }

    return (
      <Home
        games={games}
        onSelectGame={handleSelectGame}
        siteSettings={siteSettings}
        onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
      />
    );
  };

  const [bypassDeactivatedForAdmin, setBypassDeactivatedForAdmin] = useState(false);

  const isInControlPanel = () => {
    try {
      const inIframe = window.self !== window.top;
      const isDevHost =
        window.location.hostname.startsWith("ais-dev-") ||
        window.location.hostname.includes("localhost") ||
        window.location.hostname.includes("127.0.0.1");
      const params = new URLSearchParams(window.location.search);
      const isPanelParam =
        params.get("control_panel") === "true" || params.get("panel") === "true";

      return inIframe || isDevHost || isPanelParam;
    } catch (e) {
      return false;
    }
  };

  const isPublicDeactivated = siteSettings?.publicSiteDisabled === true;

  if (isPublicDeactivated && !isInControlPanel() && !bypassDeactivatedForAdmin) {
    return (
      <DeactivatedSite
        onAdminLoginClick={() => setBypassDeactivatedForAdmin(true)}
      />
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login
          onLoginSuccess={() => setIsAuthenticated(true)}
          siteSettings={siteSettings}
          onOpenLegal={handleOpenLegal}
        />
        <LegalModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={legalModalTab}
          onOpenCookieSettings={() => window.dispatchEvent(new CustomEvent("open-cookie-settings"))}
        />
        <CookieConsentBanner onOpenLegalTab={handleOpenLegal} />
        <HermesAgent
          games={games}
          onSelectGame={(game) => {
            setSelectedGame(game);
          }}
          onOpenLegal={handleOpenLegal}
          supportPhone={siteSettings?.supportPhone || "+584142943532"}
          exchangeRate={siteSettings?.exchangeRate}
        />
      </>
    );
  }

  if (!isAuthorized) {
    return (
      <AccessDenied
        userEmail={auth.currentUser?.email}
        onSignOut={() => {
          setIsAuthenticated(false);
          setIsAuthorized(true);
        }}
      />
    );
  }

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        onOpenHermes={() => window.dispatchEvent(new CustomEvent("open-hermes-agent"))}
        onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
        logoUrl={siteSettings?.siteLogoUrl}
      />

      <main className="pt-16 flex-grow flex flex-col justify-start w-full relative">
        {renderContent()}
      </main>

      <Footer
        onOpenLegal={handleOpenLegal}
        onOpenCookieSettings={() => window.dispatchEvent(new CustomEvent("open-cookie-settings"))}
        logoUrl={siteSettings?.siteLogoUrl}
        onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
      />
      <MobileNav
        activeTab={selectedGame ? "game" : activeTab}
        onNavigate={handleNavigate as any}
      />

      {/* Hermes Virtual Assistant */}
      <HermesAgent
        games={games}
        onSelectGame={(game) => {
          setSelectedGame(game);
          setActiveTab("home");
        }}
        onOpenLegal={handleOpenLegal}
        supportPhone={siteSettings?.supportPhone || "+584142943532"}
        exchangeRate={siteSettings?.exchangeRate}
      />

      {/* Support WhatsApp FAB - Visible and accessible */}
      {activeTab !== "support" && (
        <a
          href={`https://wa.me/${(siteSettings?.supportPhone || "+584142943532").replace(/[^0-9]/g, '')}?text=${encodeURIComponent("¡Hola Raidexs! Quisiera consultar sobre una recarga o información del servicio.")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar soporte por WhatsApp 24/7"
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.45)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group cursor-pointer"
        >
          <MessageCircle className="text-white fill-current" size={30} />
          <div className="absolute right-full mr-4 bg-[#030a1b] text-white text-xs font-bold py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-cyan-500/30 shadow-lg">
            Soporte WhatsApp 24/7
          </div>
        </a>
      )}

      {/* Global Legal Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
        onOpenCookieSettings={() => window.dispatchEvent(new CustomEvent("open-cookie-settings"))}
      />

      {/* Global Download App / APK Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        siteSettings={siteSettings}
        isAdmin={isAdmin}
      />

      {/* Global Cookie Consent Banner */}
      <CookieConsentBanner onOpenLegalTab={handleOpenLegal} />
    </div>
  );
}
