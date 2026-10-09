import React, { useState, useEffect, useRef } from "react";
import {
  PromoCode,
  Game,
  GamePackage,
  SiteSettings,
  Order,
  PaymentMethod,
  isGameGiftCard,
} from "../types";
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  Gamepad2,
  Gift,
  X,
  Check,
  Tag,
  Settings,
  CreditCard,
  ShoppingCart,
  Eye,
  EyeOff,
  Mail,
  Bitcoin,
  ShieldCheck,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  QrCode,
  ImageIcon,
  Upload,
  Info,
  Copy,
  Palette,
  ChevronDown,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Loader2,
  Smartphone,
} from "lucide-react";
import { PAYMENT_METHODS } from "../data";
import EmailComposer from "./EmailComposer";

interface Props {
  games: Game[];
  promoCodes?: PromoCode[];
  siteSettings?: SiteSettings | null;
  orders?: Order[];
  onUpdateGames: (games: Game[]) => Promise<boolean> | void;
  onUpdatePromoCodes?: (codes: PromoCode[]) => Promise<boolean> | void;
  onUpdateSiteSettings?: (settings: SiteSettings) => Promise<boolean> | void;
  onUpdateOrder?: (
    orderId: string,
    status: "completed" | "pending" | "failed" | "rejected",
  ) => Promise<boolean> | void;
}

export default function AdminPanel({
  games,
  promoCodes = [],
  siteSettings,
  orders = [],
  onUpdateGames,
  onUpdatePromoCodes,
  onUpdateSiteSettings,
  onUpdateOrder,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "games" | "promos" | "settings" | "payments" | "orders" | "emails"
  >("games");
  const [localGames, setLocalGames] = useState<Game[]>(
    JSON.parse(JSON.stringify(games)),
  );
  const [localPromoCodes, setLocalPromoCodes] = useState<PromoCode[]>(
    JSON.parse(JSON.stringify(promoCodes)),
  );
  
  const [availableHgProducts, setAvailableHgProducts] = useState<any[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSearchTerm, setImportSearchTerm] = useState("");

  const defaultSettings: SiteSettings = {
    publicSiteDisabled: true,
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
  const [localSettings, setLocalSettings] = useState<SiteSettings>(
    siteSettings || defaultSettings,
  );

  const [isTestingBinance, setIsTestingBinance] = useState(false);
  const [binanceTestResult, setBinanceTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    accountType?: string;
    usdtBalance?: string;
    permissions?: string[];
    error?: string;
  } | null>(null);
  const [showBinanceApiKey, setShowBinanceApiKey] = useState(false);
  const [showBinanceSecret, setShowBinanceSecret] = useState(false);

  // Hank Games Reseller Integration State
  const [showHankGamesSecret, setShowHankGamesSecret] = useState(false);
  const [hankGamesBalance, setHankGamesBalance] = useState<number | null>(null);
  const [isCheckingHankGamesBalance, setIsCheckingHankGamesBalance] = useState(false);
  const [hankGamesServerIp, setHankGamesServerIp] = useState<string | null>(null);
  const [hankGamesTestResult, setHankGamesTestResult] = useState<{
    success: boolean;
    message: string;
    balance?: number;
    error?: string;
  } | null>(null);
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false);
  const [webhookRegisterResult, setWebhookRegisterResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isCheckingLiveOrder, setIsCheckingLiveOrder] = useState(false);
  const [liveOrderResult, setLiveOrderResult] = useState<any | null>(null);

  const handleFetchServerIp = async () => {
    try {
      const res = await fetch('/api/hankgames/server-info');
      const data = await res.json();
      if (data.outboundIp) {
        setHankGamesServerIp(data.outboundIp);
      }
    } catch {}
  };

  const handleCheckHankGamesBalance = async () => {
    setIsCheckingHankGamesBalance(true);
    setHankGamesTestResult(null);
    try {
      const headers: Record<string, string> = {};
      if (localSettings.hankGamesClientId) headers['x-hg-client-id'] = localSettings.hankGamesClientId;
      if (localSettings.hankGamesClientSecret) headers['x-hg-client-secret'] = localSettings.hankGamesClientSecret;

      const res = await fetch('/api/hankgames/balance', { headers });
      const data = await res.json();
      if (res.ok && data.balance !== undefined) {
        setHankGamesBalance(data.balance);
        setHankGamesTestResult({
          success: true,
          message: `Conexión exitosa con Hank Games. Saldo disponible: $${data.balance}`,
          balance: data.balance
        });
      } else {
        setHankGamesTestResult({
          success: false,
          message: 'Error al consultar saldo de Hank Games',
          error: data.error || data.message || 'Credenciales inválidas o IP no autorizada'
        });
      }
    } catch (e: any) {
      setHankGamesTestResult({
        success: false,
        message: 'Fallo de conexión con Hank Games',
        error: e.message
      });
    } finally {
      setIsCheckingHankGamesBalance(false);
    }
  };

  const handleRegisterWebhook = async () => {
    setIsRegisteringWebhook(true);
    setWebhookRegisterResult(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (localSettings.hankGamesClientId) headers['x-hg-client-id'] = localSettings.hankGamesClientId;
      if (localSettings.hankGamesClientSecret) headers['x-hg-client-secret'] = localSettings.hankGamesClientSecret;

      const res = await fetch('/api/hankgames/register-callback', {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookRegisterResult({
          success: true,
          message: 'Webhook registrado exitosamente en Hank Games. Las actualizaciones de órdenes llegarán automáticamente.'
        });
      } else {
        setWebhookRegisterResult({
          success: false,
          message: data.error || data.message || 'Error registrando webhook en Hank Games'
        });
      }
    } catch (e: any) {
      setWebhookRegisterResult({
        success: false,
        message: e.message || 'Error de red registrando webhook'
      });
    } finally {
      setIsRegisteringWebhook(false);
    }
  };

  const handleCheckLiveOrder = async (externalOrderId: string) => {
    setIsCheckingLiveOrder(true);
    setLiveOrderResult(null);
    try {
      const headers: Record<string, string> = {};
      if (localSettings.hankGamesClientId) headers['x-hg-client-id'] = localSettings.hankGamesClientId;
      if (localSettings.hankGamesClientSecret) headers['x-hg-client-secret'] = localSettings.hankGamesClientSecret;

      const res = await fetch(`/api/hankgames/order/${encodeURIComponent(externalOrderId)}`, { headers });
      const data = await res.json();
      setLiveOrderResult(data);
    } catch (e: any) {
      setLiveOrderResult({ error: e.message });
    } finally {
      setIsCheckingLiveOrder(false);
    }
  };


  const syncHankGamesCatalog = async (silent = false) => {
    try {
      const btn = document.getElementById('sync-hankgames-btn');
      if (btn) btn.innerHTML = '<div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>';
      
      const headers: Record<string, string> = {};
      if (localSettings.hankGamesClientId) headers['x-hg-client-id'] = localSettings.hankGamesClientId;
      if (localSettings.hankGamesClientSecret) headers['x-hg-client-secret'] = localSettings.hankGamesClientSecret;

      const res = await fetch('/api/hankgames/catalog', { headers });
      const data = await res.json();
      
      const apiGames = Array.isArray(data) ? data : (data.success && data.data ? data.data : (data.games ? data.games : null));

      if (apiGames && apiGames.length > 0) {
        // Guardar el catálogo para poder importarlo electivamente
        setAvailableHgProducts(apiGames);

        const newGames = [...localGames];
        
        let updated = 0;
        
        apiGames.forEach((apiGame: any) => {
          const existingIdx = newGames.findIndex((g: any) => g.id === apiGame.productId || g.name.toLowerCase() === apiGame.name.toLowerCase());
          
          const packages = (apiGame.packages || []).map((p: any) => ({
            id: String(p.packageId || p.id),
            amount: parseFloat(p.name.replace(/[^0-9.]/g, '')) || 0,
            currency: p.name.replace(/[0-9.]/g, '').trim() || 'Coins',
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price || '0'),
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/2850/2850785.png'
          }));

          if (existingIdx >= 0) {
            const existingGame = newGames[existingIdx];
            if (existingGame.syncWithHankGames === true) {
              existingGame.id = apiGame.productId;
              if (packages.length > 0) {
                existingGame.packages = packages;
              }
              if (existingGame.publisher && existingGame.publisher.toLowerCase().includes('hank')) {
                existingGame.publisher = '';
              }
              updated++;
            }
          }
        });
        
        setLocalGames(newGames);
        if (onUpdateGames && updated > 0) {
           await onUpdateGames(newGames);
        }
        if (!silent) {
           alert('Sincronización con Hank Games exitosa. Precios y paquetes actualizados en tu tienda para ' + updated + ' juegos habilitados para sincronización.');
        }
      } else {
        if (!silent) alert(data.error || 'No se pudo sincronizar el catálogo de Hank Games (verifica tus credenciales en servidor)');
      }
    } catch (e: any) {
      console.error(e);
      if (!silent) alert('Error: ' + e.message);
    } finally {
      const btn = document.getElementById('sync-hankgames-btn');
      if (btn) btn.innerHTML = 'Sync Hank Games';
    }
  };

  const handleImportHgProduct = async (apiGame: any) => {
    const packages = (apiGame.packages || []).map((p: any) => ({
      id: String(p.packageId || p.id),
      amount: parseFloat(p.name.replace(/[^0-9.]/g, '')) || 0,
      currency: p.name.replace(/[0-9.]/g, '').trim() || 'Coins',
      price: typeof p.price === 'number' ? p.price : parseFloat(p.price || '0'),
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2850/2850785.png'
    }));

    const newGame: Game = {
      id: apiGame.productId,
      name: apiGame.name,
      publisher: '',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
      cardUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600&h=800',
      currencyName: packages[0]?.currency || 'Monedas',
      category: 'mobile',
      packages: packages,
      syncWithHankGames: true
    };

    const updatedGames = [...localGames, newGame];
    setLocalGames(updatedGames);
    setSelectedGameId(newGame.id);
    if (onUpdateGames) {
      await onUpdateGames(updatedGames);
    }
    alert(`¡"${apiGame.name}" se ha agregado con éxito a tu tienda!`);
  };

  useEffect(() => {
    handleFetchServerIp();
    if (localSettings.hankGamesClientId && localSettings.hankGamesClientSecret) {
      const timeoutId = setTimeout(() => {
        syncHankGamesCatalog(true);
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [localSettings.hankGamesClientId, localSettings.hankGamesClientSecret]);

  const handleTestBinanceConnection = async () => {
    setIsTestingBinance(true);
    setBinanceTestResult(null);

    try {
      let apiUrl = import.meta.env.VITE_API_URL || "";
      if (apiUrl.includes("<AQUI")) apiUrl = "";
      apiUrl = apiUrl.replace(/\/+$/, "");

      const res = await fetch(`/api/binance/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: localSettings.binanceApiKey,
          apiSecret: localSettings.binanceApiSecret,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setBinanceTestResult({
          success: true,
          message: data.message || "Conexión exitosa con Binance API",
          latencyMs: data.latencyMs,
          accountType: data.accountType,
          usdtBalance: data.usdtBalance,
          permissions: data.permissions,
        });
      } else {
        setBinanceTestResult({
          success: false,
          message: data.error || "No se pudo autenticar con Binance API.",
          error: data.error,
        });
      }
    } catch (err: any) {
      setBinanceTestResult({
        success: false,
        message: err.message || "Error de red al conectar con el servidor.",
        error: err.message,
      });
    } finally {
      setIsTestingBinance(false);
    }
  };

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const selectedGame = localGames.find((g) => g.id === selectedGameId);

  const handlePackageChange = (
    packageId: string,
    field: keyof GamePackage,
    value: any,
  ) => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          return {
            ...game,
            packages: (game.packages || []).map((pkg) =>
              pkg.id === packageId ? { ...pkg, [field]: value } : pkg,
            ),
          };
        }
        return game;
      }),
    );
  };

  const handleGameChange = (field: keyof Game, value: any) => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          return { ...game, [field]: value };
        }
        return game;
      }),
    );
  };

  const compressImage = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/webp", 0.6); // 0.6 quality for lower size
        callback(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "bannerUrl" | "cardUrl",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (dataUrl) => {
        handleGameChange(field, dataUrl);
      });
    }
  };

  const handlePackageImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    packageId: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (dataUrl) => {
        handlePackageChange(packageId, "iconUrl", dataUrl);
      });
    }
  };

  const handleDeletePackage = (packageId: string) => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          return {
            ...game,
            packages: (game.packages || []).filter((pkg) => pkg.id !== packageId),
          };
        }
        return game;
      }),
    );
  };

  const handleMovePackage = (packageId: string, direction: "up" | "down") => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          const pkgs = [...(game.packages || [])];
          const idx = pkgs.findIndex((p) => p.id === packageId);
          if (idx === -1) return game;
          const targetIdx = direction === "up" ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= pkgs.length) return game;
          const [moved] = pkgs.splice(idx, 1);
          pkgs.splice(targetIdx, 0, moved);
          return {
            ...game,
            packages: pkgs,
          };
        }
        return game;
      })
    );
  };

  const handleDuplicatePackage = (packageId: string) => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          const pkgs = [...(game.packages || [])];
          const idx = pkgs.findIndex((p) => p.id === packageId);
          if (idx === -1) return game;
          const orig = pkgs[idx];
          const cloned: GamePackage = {
            ...orig,
            id: `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: orig.title ? `${orig.title} (Copia)` : undefined,
          };
          pkgs.splice(idx + 1, 0, cloned);
          return {
            ...game,
            packages: pkgs,
          };
        }
        return game;
      })
    );
  };

  const handleSortPackages = () => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          const sorted = [...(game.packages || [])].sort((a, b) => a.price - b.price);
          return {
            ...game,
            packages: sorted,
          };
        }
        return game;
      })
    );
  };

  const handleAdjustAllPrices = (percentage: number) => {
    if (!selectedGameId) return;
    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGameId) {
          const adjusted = (game.packages || []).map((pkg) => {
            const newPrice = Number((pkg.price * (1 + percentage / 100)).toFixed(2));
            return {
              ...pkg,
              price: newPrice,
            };
          });
          return {
            ...game,
            packages: adjusted,
          };
        }
        return game;
      })
    );
  };

  const handleAddPackage = () => {
    if (!selectedGame) return;
    const newPackage: GamePackage = {
      id: `pkg_${Date.now()}`,
      amount: 100,
      currency: selectedGame.currencyName,
      price: 1.0,
      iconUrl: selectedGame.packages[0]?.iconUrl || "",
    };

    setLocalGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === selectedGame.id) {
          return {
            ...game,
            packages: [...(game.packages || []), newPackage],
          };
        }
        return game;
      }),
    );
  };

  const handleAddGame = () => {
    const newGame: Game = {
      id: `game_${Date.now()}`,
      name: "Nuevo Juego",
      publisher: "",
      category: "mobile",
      isGiftCard: false,
      currencyName: "Monedas",
      bannerUrl: "",
      cardUrl: "",
      syncWithHankGames: false,
      packages: [],
    };
    setLocalGames((prev) => [...prev, newGame]);
    setSelectedGameId(newGame.id);
  };

  const handleAddGiftCard = () => {
    const newGiftCard: Game = {
      id: `giftcard_${Date.now()}`,
      name: "Nueva Tarjeta de Regalo",
      publisher: "Digital",
      category: "giftcard",
      isGiftCard: true,
      currencyName: "USD",
      bannerUrl: "",
      cardUrl: "",
      syncWithHankGames: false,
      packages: [],
    };
    setLocalGames((prev) => [...prev, newGiftCard]);
    setSelectedGameId(newGiftCard.id);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const handleDeleteGame = () => {
    if (!selectedGameId) return;
    setShowDeleteModal(true);
  };

  const confirmDeleteGame = () => {
    setLocalGames((prev) => prev.filter((game) => game.id !== selectedGameId));
    setSelectedGameId(null);
    setShowDeleteModal(false);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async (isAutoSave: boolean | React.MouseEvent = false) => {
    const autoSave = isAutoSave === true;
    setIsSaving(true);
    setErrorMessage("");
    const resGames = await onUpdateGames(localGames);
    const resPromos = onUpdatePromoCodes
      ? await onUpdatePromoCodes(localPromoCodes)
      : true;
    const resSettings = onUpdateSiteSettings
      ? await onUpdateSiteSettings(localSettings)
      : true;

    if (resGames !== false && resPromos !== false && resSettings !== false) {
      if (!autoSave) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } else {
      setErrorMessage("Error al guardar. Verifica los permisos.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
    setIsSaving(false);
  };

  const handleAddPromoCode = () => {
    const newCode: PromoCode = {
      id: `promo_${Date.now()}`,
      code: "NUEVO_CODIGO",
      discountPercentage: 10,
      active: true,
      usageCount: 0,
    };
    setLocalPromoCodes([...localPromoCodes, newCode]);
  };

  const handlePromoCodeChange = (
    id: string,
    field: keyof PromoCode,
    value: any,
  ) => {
    setLocalPromoCodes((prev) =>
      prev.map((code) => (code.id === id ? { ...code, [field]: value } : code)),
    );
  };

  const handleDeletePromoCode = (id: string) => {
    setLocalPromoCodes((prev) => prev.filter((code) => code.id !== id));
  };

  const handleSettingsChange = (field: keyof SiteSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingsImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof SiteSettings,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const isBanner = field === "siteBannerUrl";
          const MAX_WIDTH = isBanner ? 1200 : 600;
          const MAX_HEIGHT = isBanner ? 512 : 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/webp", 0.8);
          handleSettingsChange(field, dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full pb-24 md:pb-8 animation-fade-in relative">
      {/* Toast Notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="bg-green-500/20 rounded-full p-1">
            <Check size={16} />
          </div>
          <span className="font-medium font-display tracking-tight">
            Cambios guardados con éxito
          </span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/20 rounded-full p-1">
            <X size={16} />
          </div>
          <span className="font-medium font-display tracking-tight">
            {errorMessage}
          </span>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface mb-2">
            Panel de Administración
          </h1>
          <p className="text-on-surface-variant font-medium">
            Gestiona los precios, paquetes y códigos de descuento.
          </p>
        </div>
        <div className="flex bg-surface-elevated rounded-lg p-1 border border-glass-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("games")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "games" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Gamepad2 size={16} className="inline-block mr-2" />
            Juegos
          </button>
          <button
            onClick={() => setActiveTab("promos")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "promos" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Tag size={16} className="inline-block mr-2" />
            Códigos Promo
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "settings" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Settings size={16} className="inline-block mr-2" />
            Config. Web
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "payments" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <CreditCard size={16} className="inline-block mr-2" />
            Métodos de Pago
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "orders" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <ShoppingCart size={16} className="inline-block mr-2" />
            Órdenes
          </button>
          <button
            onClick={() => setActiveTab("emails")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === "emails" ? "bg-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Mail size={16} className="inline-block mr-2" />
            Correos
          </button>
        </div>
      </div>

      {activeTab === "games" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game List */}
          <div className="col-span-1 border border-glass-border rounded-xl bg-surface-container overflow-hidden h-[fit-content]">
            <div className="bg-surface-elevated p-4 border-b border-glass-border flex justify-between items-center">
              <h3 className="font-bold text-on-surface uppercase text-sm tracking-wider">
                Juegos
              </h3>
              <button
                onClick={() => syncHankGamesCatalog(false)}
                id="sync-hankgames-btn"
                className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded hover:bg-primary/30 transition-colors"
                title="Sincronizar precios y paquetes desde Hank Games"
              >
                Sync Hank Games
              </button>
            </div>
            <div className="flex flex-col max-h-[60vh] overflow-y-auto">
              {localGames.map((game, index) => (
                <button
                  key={`${game.id || 'game'}-${index}`}
                  onClick={() => setSelectedGameId(game.id)}
                  className={`p-4 text-left border-b border-glass-border transition-colors flex items-center gap-3 ${
                    selectedGameId === game.id
                      ? "bg-primary/20 border-l-4 border-l-primary"
                      : "hover:bg-surface-elevated border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-surface items-center justify-center flex border border-glass-border">
                    {game.cardUrl ? (
                      <img
                        src={game.cardUrl}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : isGameGiftCard(game) ? (
                      <Gift size={20} className="text-cyan-400" />
                    ) : (
                      <Gamepad2 size={20} className="text-on-surface-variant" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${isGameGiftCard(game) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-primary/20 text-primary'}`}>
                        {isGameGiftCard(game) ? 'Gift Card' : 'Juego'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-on-surface truncate">
                      {game.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      {game.packages.length} paquetes
                    </p>
                  </div>
                </button>
              ))}
              <div className="flex flex-col gap-1.5 p-3 border-t border-glass-border">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddGame}
                    className="p-2.5 rounded-lg flex items-center justify-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-xs"
                  >
                    <Plus size={14} /> + Juego
                  </button>
                  <button
                    onClick={handleAddGiftCard}
                    className="p-2.5 rounded-lg flex items-center justify-center gap-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all font-bold text-xs"
                  >
                    <Gift size={14} /> + Gift Card
                  </button>
                </div>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="w-full p-2.5 rounded-lg flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-300 hover:from-cyan-500/25 hover:to-blue-500/25 border border-cyan-500/20 transition-all font-bold text-xs mt-1"
                >
                  <RefreshCw size={13} className="text-cyan-400 animate-pulse" /> Importar de Hank Games
                </button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="col-span-1 lg:col-span-3">
            {selectedGame ? (
              <div className="bg-surface-container border border-glass-border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded overflow-hidden shrink-0 shadow-lg relative group cursor-pointer">
                      <img
                        src={selectedGame.cardUrl || undefined}
                        alt={selectedGame.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Edit2 size={16} className="text-on-surface" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "cardUrl")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div>
                      <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                        {selectedGame.name}
                      </h2>
                      <p className="text-sm text-primary uppercase tracking-widest font-bold">
                        Moneda: {selectedGame.currencyName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`btn-primary shrink-0 py-2.5 px-6 rounded-lg text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <Save size={18} />{" "}
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>

                <div className="mb-6 bg-surface-elevated p-4 rounded-xl border border-glass-border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-on-surface text-sm">
                      Información del Producto
                    </h3>
                    <button
                      onClick={handleDeleteGame}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-bold"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={selectedGame.name}
                        onChange={(e) =>
                          handleGameChange("name", e.target.value)
                        }
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Nombre de la moneda o denominación
                      </label>
                      <input
                        type="text"
                        value={selectedGame.currencyName}
                        onChange={(e) =>
                          handleGameChange("currencyName", e.target.value)
                        }
                        placeholder="Ej: Diamantes, UC, USD, Puntos"
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Tipo de Producto
                      </label>
                      <select
                        value={selectedGame.isGiftCard || selectedGame.category === 'giftcard' ? 'giftcard' : 'game'}
                        onChange={(e) => {
                          const isGift = e.target.value === 'giftcard';
                          handleGameChange('isGiftCard', isGift);
                          if (isGift) {
                            handleGameChange('category', 'giftcard');
                          } else if (selectedGame.category === 'giftcard') {
                            handleGameChange('category', 'mobile');
                          }
                        }}
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="game">🎮 Juego (Recarga Directa por ID)</option>
                        <option value="giftcard">🎁 Tarjeta de Regalo (Gift Card)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Categoría / Plataforma
                      </label>
                      <select
                        value={selectedGame.category}
                        onChange={(e) =>
                          handleGameChange("category", e.target.value)
                        }
                        className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="mobile">Móvil</option>
                        <option value="pc">PC</option>
                        <option value="console">Consola</option>
                        <option value="giftcard">Gift Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Sincronización Hank Games
                      </label>
                      <div className="flex items-center gap-2.5 h-[42px] bg-surface/40 border border-glass-border rounded-lg px-3.5">
                        <input
                          type="checkbox"
                          id="sync-with-hank-games"
                          checked={selectedGame.syncWithHankGames === true}
                          onChange={(e) =>
                            handleGameChange("syncWithHankGames", e.target.checked)
                          }
                          className="w-4.5 h-4.5 text-cyan-500 bg-[#030917] border-cyan-500/30 rounded focus:ring-cyan-500/50 cursor-pointer"
                        />
                        <label htmlFor="sync-with-hank-games" className="text-xs font-bold text-on-surface-variant cursor-pointer select-none">
                          Sincronizar precios y paquetes automáticamente
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6 bg-surface-elevated p-4 rounded-xl border border-glass-border">
                  <h3 className="font-bold text-on-surface text-sm mb-4">
                    Imágenes del Juego
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                        Banner (Portada)
                      </label>
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-glass-border bg-surface-container group cursor-pointer w-full">
                        {selectedGame.bannerUrl ? (
                          <img
                            src={selectedGame.bannerUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            Sin banner
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="bg-primary px-3 py-1.5 rounded text-on-surface text-xs font-bold flex items-center gap-2">
                            <Edit2 size={14} /> Cambiar Banner
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "bannerUrl")}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 mt-2">
                          URL del Banner
                        </label>
                        <input
                          type="text"
                          value={selectedGame.bannerUrl || ""}
                          placeholder="https://ejemplo.com/banner.png"
                          onChange={(e) =>
                            handleGameChange("bannerUrl", e.target.value)
                          }
                          className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                        Card (Miniatura)
                      </label>
                      <div className="relative aspect-[3/4] max-w-[150px] rounded-lg overflow-hidden border border-glass-border bg-surface-container group cursor-pointer">
                        {selectedGame.cardUrl ? (
                          <img
                            src={selectedGame.cardUrl}
                            alt="Card"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            Sin card
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="bg-primary px-3 py-1.5 rounded text-on-surface text-xs font-bold flex items-center gap-2">
                            <Edit2 size={14} /> Cambiar
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "cardUrl")}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 mt-2">
                          URL de la Miniatura
                        </label>
                        <input
                          type="text"
                          value={selectedGame.cardUrl || ""}
                          placeholder="https://ejemplo.com/card.png"
                          onChange={(e) =>
                            handleGameChange("cardUrl", e.target.value)
                          }
                          className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Panel de Personalización de Paquetes (Herramientas Rápidas) */}
                  <div className="bg-[#050f26]/80 p-4 rounded-xl border border-cyan-500/20 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Sparkles size={14} /> Personalización Inteligente de Paquetes
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Gestiona y reajusta todos los paquetes de este juego con herramientas rápidas de un solo clic.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <button
                        type="button"
                        onClick={handleSortPackages}
                        className="py-1.5 px-3 text-xs bg-[#0b1b3d] hover:bg-[#122b5e] border border-cyan-500/30 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronDown size={14} /> Ordenar (Menor a Mayor Precio)
                      </button>

                      <div className="flex items-center gap-1.5 bg-[#030a1b] px-2 py-1 rounded-lg border border-glass-border">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Precios:</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustAllPrices(5)}
                          className="py-0.5 px-1.5 text-[10px] bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold rounded transition-colors cursor-pointer"
                          title="Incrementar precios en 5%"
                        >
                          +5%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustAllPrices(10)}
                          className="py-0.5 px-1.5 text-[10px] bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold rounded transition-colors cursor-pointer"
                          title="Incrementar precios en 10%"
                        >
                          +10%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustAllPrices(-5)}
                          className="py-0.5 px-1.5 text-[10px] bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold rounded transition-colors cursor-pointer"
                          title="Disminuir precios en 5%"
                        >
                          -5%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustAllPrices(-10)}
                          className="py-0.5 px-1.5 text-[10px] bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold rounded transition-colors cursor-pointer"
                          title="Disminuir precios en 10%"
                        >
                          -10%
                        </button>
                      </div>
                    </div>
                  </div>

                  {(selectedGame.packages || []).map((pkg, index) => {
                    const originalPriceVal = pkg.originalPrice || (pkg.discountPercentage ? Number((pkg.price / (1 - pkg.discountPercentage / 100)).toFixed(2)) : undefined);
                    const savingsVal = originalPriceVal && originalPriceVal > pkg.price ? Number((originalPriceVal - pkg.price).toFixed(2)) : undefined;

                    return (
                      <div
                        key={`${pkg.id || 'pkg'}-${index}`}
                        className="bg-surface-elevated p-4 sm:p-5 rounded-2xl border border-glass-border/70 hover:border-cyan-500/30 transition-all flex flex-col gap-4 shadow-md relative group"
                      >
                        {/* Header bar with order index and quick action buttons */}
                        <div className="flex items-center justify-between border-b border-glass-border/40 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 flex items-center justify-center bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-black rounded-lg text-xs">
                              #{index + 1}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {pkg.title || `${pkg.amount} ${pkg.currency || selectedGame.currencyName}`}
                            </span>
                            {pkg.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 uppercase tracking-tight">
                                {pkg.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Move Up */}
                            <button
                              type="button"
                              onClick={() => handleMovePackage(pkg.id, "up")}
                              disabled={index === 0}
                              className="p-1.5 rounded-lg bg-surface hover:bg-cyan-500/10 text-on-surface-variant hover:text-cyan-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Mover arriba"
                            >
                              <ArrowUp size={15} />
                            </button>
                            {/* Move Down */}
                            <button
                              type="button"
                              onClick={() => handleMovePackage(pkg.id, "down")}
                              disabled={index === (selectedGame.packages || []).length - 1}
                              className="p-1.5 rounded-lg bg-surface hover:bg-cyan-500/10 text-on-surface-variant hover:text-cyan-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Mover abajo"
                            >
                              <ArrowDown size={15} />
                            </button>
                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicatePackage(pkg.id)}
                              className="p-1.5 rounded-lg bg-surface hover:bg-cyan-500/10 text-on-surface-variant hover:text-cyan-300 transition-colors"
                              title="Duplicar paquete"
                            >
                              <Copy size={15} />
                            </button>
                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="p-1.5 rounded-lg bg-surface hover:bg-red-500/10 text-on-surface-variant hover:text-red-400 transition-colors ml-1"
                              title="Eliminar paquete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Main fields row */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                              Cantidad ({pkg.currency || selectedGame.currencyName})
                            </label>
                            <input
                              type="number"
                              value={pkg.amount}
                              onChange={(e) =>
                                handlePackageChange(
                                  pkg.id,
                                  "amount",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-sm focus:border-primary focus:outline-none font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                              Precio Venta (USD)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={pkg.price}
                              onChange={(e) =>
                                handlePackageChange(
                                  pkg.id,
                                  "price",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-sm focus:border-primary focus:outline-none font-bold text-cyan-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                              Precio Original (Tachado)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={pkg.originalPrice ?? ""}
                              placeholder="Ej: 2.50"
                              onChange={(e) =>
                                handlePackageChange(
                                  pkg.id,
                                  "originalPrice",
                                  e.target.value === "" ? undefined : Number(e.target.value),
                                )
                              }
                              className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-sm focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                              Bonus Extra (Opcional)
                            </label>
                            <input
                              type="number"
                              value={pkg.bonus ?? ""}
                              placeholder="Ej: 50"
                              onChange={(e) =>
                                handlePackageChange(
                                  pkg.id,
                                  "bonus",
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                              className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-sm focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Savings calculation tag if applicable */}
                        {savingsVal && savingsVal > 0 && (
                          <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between">
                            <span>✨ Oferta activa: El cliente ve precio tachado de ${originalPriceVal?.toFixed(2)}</span>
                            <span className="font-bold">Ahorro: ${savingsVal.toFixed(2)} ({Math.round((savingsVal / (originalPriceVal || 1)) * 100)}% OFF)</span>
                          </div>
                        )}

                        {/* Title & Customization row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-1">
                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                              Título Personalizado
                            </label>
                            <input
                              type="text"
                              value={pkg.title || ""}
                              placeholder="Ej: Pase de Batalla, VIP"
                              onChange={(e) =>
                                handlePackageChange(
                                  pkg.id,
                                  "title",
                                  e.target.value === "" ? undefined : e.target.value,
                                )
                              }
                              className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-sm focus:border-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                              Categoría de Tienda
                            </label>
                            <input
                              type="text"
                              value={pkg.category || ""}
                              placeholder="Ej: Monedas, Pases, Especial"
                              onChange={(e) =>
                                handlePackageChange(
                                  pkg.id,
                                  "category",
                                  e.target.value === "" ? undefined : e.target.value,
                                )
                              }
                              className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-sm focus:border-primary focus:outline-none"
                            />
                            {/* Category Presets */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {["Monedas", "Pases", "Paquetes", "Suscripciones"].map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => handlePackageChange(pkg.id, "category", cat)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                                    pkg.category === cat
                                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                                      : "bg-surface text-slate-400 border-glass-border/40 hover:text-white"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                              Etiqueta / Badge Promocional
                            </label>
                            <input
                              type="text"
                              value={pkg.badge || ""}
                              placeholder="Ej: Más Popular, Oferta"
                              onChange={(e) =>
                                handlePackageChange(
                                  pkg.id,
                                  "badge",
                                  e.target.value === "" ? undefined : e.target.value,
                                )
                              }
                              className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-sm focus:border-primary focus:outline-none"
                            />
                            {/* Badge Presets */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {[
                                "🔥 Popular",
                                "⭐ Mejor Valor",
                                "⚡ Instantáneo",
                                "💎 Exclusivo",
                                "🏷️ Oferta",
                              ].map((b) => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => handlePackageChange(pkg.id, "badge", b)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                                    pkg.badge === b
                                      ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                                      : "bg-surface text-slate-400 border-glass-border/40 hover:text-white"
                                  }`}
                                >
                                  {b}
                                </button>
                              ))}
                              {pkg.badge && (
                                <button
                                  type="button"
                                  onClick={() => handlePackageChange(pkg.id, "badge", undefined)}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20"
                                >
                                  Quitar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Icon and Live Preview Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2 border-t border-glass-border/40">
                          {/* Icon selection */}
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-glass-border bg-[#030917] group cursor-pointer shrink-0 p-1 flex items-center justify-center shadow-inner">
                              {pkg.iconUrl ? (
                                <img
                                  src={pkg.iconUrl}
                                  alt="Icono"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-[10px] text-center text-slate-500 leading-tight">
                                  Sin icono
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Edit2 size={15} className="text-white" />
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handlePackageImageUpload(e, pkg.id)
                                }
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                            <div className="flex-grow">
                              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                                Icono (URL o Subir archivo)
                              </label>
                              <input
                                type="text"
                                value={pkg.iconUrl}
                                placeholder="https://ejemplo.com/icono.png"
                                onChange={(e) =>
                                  handlePackageChange(
                                    pkg.id,
                                    "iconUrl",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-xs focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Live Card Preview (Gamer Storefront simulation) */}
                          <div className="bg-[#030917] p-2.5 rounded-xl border border-cyan-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center p-1 border border-glass-border shrink-0">
                                {pkg.iconUrl ? (
                                  <img src={pkg.iconUrl} alt="Vista previa" className="w-full h-full object-contain" />
                                ) : (
                                  <Gamepad2 size={20} className="text-cyan-400" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-white">
                                    {pkg.title || `${pkg.amount} ${pkg.currency || selectedGame.currencyName}`}
                                  </span>
                                  {pkg.bonus ? (
                                    <span className="text-[9px] font-black bg-cyan-500/20 text-cyan-300 px-1 rounded">
                                      +{pkg.bonus} Extra
                                    </span>
                                  ) : null}
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  Vista previa en tienda
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              {originalPriceVal && originalPriceVal > pkg.price && (
                                <span className="block text-[10px] text-slate-500 line-through">
                                  ${originalPriceVal.toFixed(2)}
                                </span>
                              )}
                              <span className="text-xs font-black text-cyan-400">
                                ${pkg.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={handleAddPackage}
                    className="w-full border-2 border-dashed border-glass-border rounded-xl py-4 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors gap-2 font-bold"
                  >
                    <Plus size={24} />
                    Añadir Nuevo Paquete
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container border border-glass-border border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center text-on-surface-variant">
                <Gamepad2 size={48} className="mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-on-surface mb-2">
                  Selecciona un juego
                </h3>
                <p>
                  Elige un juego de la lista para editar sus paquetes y precios.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "promos" ? (
        <div className="bg-surface-container border border-glass-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                Códigos de Descuento
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Crea y gestiona códigos para embajadores.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary shrink-0 py-2.5 px-6 rounded-lg text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

          <div className="space-y-4">
            {localPromoCodes.map((code, index) => (
              <div
                key={`${code.id || 'code'}-${index}`}
                className="bg-surface-elevated p-4 rounded-xl border border-glass-border flex flex-col md:flex-row gap-4 items-center"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Código
                    </label>
                    <input
                      type="text"
                      value={code.code}
                      onChange={(e) =>
                        handlePromoCodeChange(
                          code.id,
                          "code",
                          e.target.value.toUpperCase(),
                        )
                      }
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      value={code.discountPercentage}
                      onChange={(e) =>
                        handlePromoCodeChange(
                          code.id,
                          "discountPercentage",
                          Number(e.target.value),
                        )
                      }
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Activo
                    </label>
                    <select
                      value={code.active ? "true" : "false"}
                      onChange={(e) =>
                        handlePromoCodeChange(
                          code.id,
                          "active",
                          e.target.value === "true",
                        )
                      }
                      className="w-full bg-surface border border-glass-border rounded-lg py-2.5 px-3 text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Usos
                    </label>
                    <input
                      type="number"
                      disabled
                      value={code.usageCount}
                      className="w-full bg-surface/50 border border-glass-border rounded-lg py-2 px-3 text-on-surface-variant opacity-70"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePromoCode(code.id)}
                  className="p-2.5 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg shrink-0 transition-colors w-full md:w-auto flex justify-center mt-2 md:mt-0"
                  title="Eliminar código"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddPromoCode}
              className="w-full border-2 border-dashed border-glass-border rounded-xl py-4 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors gap-2 font-bold"
            >
              <Plus size={24} />
              Añadir Nuevo Código
            </button>
          </div>
        </div>
      ) : activeTab === "settings" ? (
        <div className="bg-surface-container border border-glass-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                Configuración Web
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Personaliza las imágenes de la mascota.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary shrink-0 py-2.5 px-6 rounded-lg text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

          {/* Security & Access Restriction Toggle */}
          <div className="bg-surface-elevated p-6 rounded-xl border-2 border-red-500/30 bg-gradient-to-r from-red-950/20 via-surface-elevated to-surface-elevated mb-8 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl shrink-0">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-lg flex items-center gap-2">
                    Desactivar Página Pública (Modo Panel de Control Exclusivo)
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
                      Alta Seguridad
                    </span>
                  </h3>
                  <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
                    Al activar esta opción, la página estará completamente desactivada para cualquier visitante externo. Solo podrás ver e interactuar con la tienda desde este Panel de Control en AI Studio.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 self-end sm:self-center">
                <input
                  type="checkbox"
                  checked={localSettings.publicSiteDisabled !== false}
                  onChange={(e) =>
                    handleSettingsChange("publicSiteDisabled", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            {localSettings.publicSiteDisabled !== false && (
              <div className="mt-4 pt-3 border-t border-red-500/20 flex items-center gap-2 text-xs text-red-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>Página pública desactivada. Solamente visible dentro de tu panel de control.</span>
              </div>
            )}
          </div>

          {/* Logo & Banner Customization */}
          <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border mb-8 shadow-md">
            <h3 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
              <Palette size={20} className="text-cyan-400" />
              Identidad de Marca (Logo y Banner de Inicio)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Section */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-on-surface-variant text-sm">Logotipo de la Tienda</h4>
                <div className="flex items-center gap-4">
                  <div className="relative aspect-square w-24 rounded-2xl overflow-hidden border border-glass-border bg-[#030917] group cursor-pointer shrink-0 shadow-lg">
                    {localSettings.siteLogoUrl ? (
                      <img
                        src={localSettings.siteLogoUrl}
                        alt="Logo Tienda"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                        <Settings size={20} className="mb-1" />
                        <span className="text-[10px]">Predeterminado</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="bg-primary/95 text-on-surface text-[10px] font-bold px-2 py-1 rounded">
                        Subir
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleSettingsImageUpload(e, "siteLogoUrl")
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-grow">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      URL del Logotipo (URL o Base64)
                    </label>
                    <input
                      type="text"
                      value={localSettings.siteLogoUrl || ""}
                      placeholder="Dejar vacío para usar texto predeterminado"
                      onChange={(e) =>
                        handleSettingsChange("siteLogoUrl", e.target.value)
                      }
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-sm focus:border-primary focus:outline-none"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-slate-400">
                        Sube una imagen o ingresa una dirección URL.
                      </p>
                      {localSettings.siteLogoUrl ? (
                        <button
                          type="button"
                          onClick={() => handleSettingsChange("siteLogoUrl", "")}
                          className="text-[10px] text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
                        >
                          Quitar logotipo
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Section */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-on-surface-variant text-sm">Banner de Inicio</h4>
                <div className="flex flex-col gap-2">
                  <div className="relative aspect-[21/9] w-full max-w-sm rounded-xl overflow-hidden border border-glass-border bg-[#030917] group cursor-pointer shadow-lg mx-auto md:mx-0">
                    {localSettings.siteBannerUrl ? (
                      <img
                        src={localSettings.siteBannerUrl}
                        alt="Banner Tienda"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                        <Settings size={24} className="mb-1" />
                        <span className="text-xs">Predeterminado</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="bg-primary/95 text-on-surface text-xs font-bold px-3 py-1.5 rounded">
                        Subir Banner
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleSettingsImageUpload(e, "siteBannerUrl")
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      URL del Banner (21:9 recomendado)
                    </label>
                    <input
                      type="text"
                      value={localSettings.siteBannerUrl || ""}
                      placeholder="Dejar vacío para usar fondo cyber predeterminado"
                      onChange={(e) =>
                        handleSettingsChange("siteBannerUrl", e.target.value)
                      }
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface text-sm focus:border-primary focus:outline-none"
                    />
                    {localSettings.siteBannerUrl ? (
                      <div className="flex justify-end mt-1">
                        <button
                          type="button"
                          onClick={() => handleSettingsChange("siteBannerUrl", "")}
                          className="text-[10px] text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
                        >
                          Quitar banner personalizado
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border">
              <h3 className="font-bold text-on-surface text-lg mb-4">
                Mascota Principal (Inicio)
              </h3>
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square w-48 rounded-2xl overflow-hidden border border-glass-border bg-surface-container group cursor-pointer mx-auto">
                  {localSettings.mascotHomeUrl ? (
                    <img
                      src={localSettings.mascotHomeUrl}
                      alt="Mascota Inicio"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                      <Settings size={32} className="mb-2" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="bg-primary px-3 py-1.5 rounded text-on-surface text-xs font-bold flex items-center gap-2">
                      <Edit2 size={14} /> Cambiar
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleSettingsImageUpload(e, "mascotHomeUrl")
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    URL de la Imagen
                  </label>
                  <input
                    type="text"
                    value={localSettings.mascotHomeUrl || ""}
                    placeholder="Dejar vacío para usar la predeterminada"
                    onChange={(e) =>
                      handleSettingsChange("mascotHomeUrl", e.target.value)
                    }
                    className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showMascotHome}
                    onChange={(e) =>
                      handleSettingsChange("showMascotHome", e.target.checked)
                    }
                    className="w-4 h-4 text-primary bg-surface border-glass-border rounded focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">
                    Mostrar mascota en Inicio
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border">
              <h3 className="font-bold text-on-surface text-lg mb-4">
                Mascota de Soporte
              </h3>
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square w-48 rounded-full overflow-hidden border-4 border-surface shadow-xl group cursor-pointer mx-auto">
                  {localSettings.mascotSupportUrl ? (
                    <img
                      src={localSettings.mascotSupportUrl}
                      alt="Mascota Soporte"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant bg-surface-container">
                      <Settings size={32} className="mb-2" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="bg-primary px-3 py-1.5 rounded text-on-surface text-xs font-bold flex items-center gap-2">
                      <Edit2 size={14} /> Cambiar
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleSettingsImageUpload(e, "mascotSupportUrl")
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    URL de la Imagen
                  </label>
                  <input
                    type="text"
                    value={localSettings.mascotSupportUrl || ""}
                    placeholder="Dejar vacío para usar la predeterminada"
                    onChange={(e) =>
                      handleSettingsChange("mascotSupportUrl", e.target.value)
                    }
                    className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showMascotSupport}
                    onChange={(e) =>
                      handleSettingsChange(
                        "showMascotSupport",
                        e.target.checked,
                      )
                    }
                    className="w-4 h-4 text-primary bg-surface border-glass-border rounded focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">
                    Mostrar mascota en Soporte
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border">
              <h3 className="font-bold text-on-surface text-lg mb-4">
                Mascota de Login
              </h3>
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square w-32 rounded-full overflow-hidden border-4 border-surface shadow-lg group cursor-pointer mx-auto bg-surface-container">
                  {localSettings.mascotLoginUrl ? (
                    <img
                      src={localSettings.mascotLoginUrl}
                      alt="Mascota Login"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                      <Settings size={24} className="mb-1" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="bg-primary px-2 py-1 rounded text-on-surface text-[10px] font-bold flex items-center gap-1">
                      <Edit2 size={12} /> Cambiar
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleSettingsImageUpload(e, "mascotLoginUrl")
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    URL de la Imagen
                  </label>
                  <input
                    type="text"
                    value={localSettings.mascotLoginUrl || ""}
                    placeholder="Dejar vacío para usar predeterminada"
                    onChange={(e) =>
                      handleSettingsChange("mascotLoginUrl", e.target.value)
                    }
                    className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showMascotLogin}
                    onChange={(e) =>
                      handleSettingsChange("showMascotLogin", e.target.checked)
                    }
                    className="w-4 h-4 text-primary bg-surface border-glass-border rounded focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">
                    Mostrar mascota en Login
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "payments" ? (
        <div className="bg-surface-container border border-glass-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                Métodos de Pago
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Gestiona los métodos de pago y sus instrucciones.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary shrink-0 py-2.5 px-6 rounded-lg text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

          
          <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border mb-6">
            <h3 className="font-bold text-on-surface mb-4">Canales de Contacto y Soporte</h3>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                Número de Teléfono / WhatsApp de Soporte
              </label>
              <input
                type="text"
                value={localSettings.supportPhone || "+584142943532"}
                onChange={(e) => handleSettingsChange("supportPhone", e.target.value)}
                className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                placeholder="Ej: +584142943532"
              />
              <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
                Este número se utilizará en los botones directos de WhatsApp para atención y soporte 24/7.
              </p>
            </div>
          </div>

          {/* APLICACIÓN MÓVIL (APK) Y REPOSITORIO GITHUB */}
          <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Aplicación Móvil (APK) & Repositorio GitHub</h3>
                <p className="text-xs text-on-surface-variant">Configura las URLs para la descarga del APK y la integración con GitHub Actions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  URL de Descarga Directa del APK (.apk)
                </label>
                <input
                  type="url"
                  value={localSettings.apkDownloadUrl || ""}
                  onChange={(e) => handleSettingsChange("apkDownloadUrl", e.target.value)}
                  className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none text-sm"
                  placeholder="Ej: https://github.com/usuario/repo/releases/download/v1.0/Raidexs.apk"
                />
                <p className="text-xs text-on-surface-variant mt-1 font-medium">
                  Enlace que se abrirá cuando los usuarios pulsen "Descargar APK".
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  URL del Repositorio GitHub
                </label>
                <input
                  type="url"
                  value={localSettings.githubRepoUrl || ""}
                  onChange={(e) => handleSettingsChange("githubRepoUrl", e.target.value)}
                  className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none text-sm"
                  placeholder="Ej: https://github.com/usuario/raidexs-app"
                />
                <p className="text-xs text-on-surface-variant mt-1 font-medium">
                  Repositorio donde está alojado el proyecto con el workflow de CI/CD.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated p-6 rounded-xl border border-glass-border mb-6">
            <h3 className="font-bold text-on-surface mb-4">Tasa de Cambio (VES/USD)</h3>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Tasa Manual (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={localSettings.exchangeRate || ''}
                  onChange={(e) => handleSettingsChange("exchangeRate", parseFloat(e.target.value))}
                  disabled={localSettings.useAutomaticBcvRate}
                  className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none disabled:opacity-50"
                  placeholder="Ej: 36.50"
                />
              </div>
              <div className="flex-1 w-full flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.useAutomaticBcvRate || false}
                    onChange={(e) => handleSettingsChange("useAutomaticBcvRate", e.target.checked)}
                    className="w-4 h-4 text-primary bg-surface border-glass-border rounded focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">
                    Usar Tasa BCV Automática (DolarAPI)
                  </span>
                </label>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('https://ve.dolarapi.com/v1/dolares');
                    const data = await res.json();
                    const bcv = data.find((d: any) => d.fuente === 'oficial');
                    if (bcv && bcv.promedio) {
                      handleSettingsChange("exchangeRate", bcv.promedio);
                      alert('Tasa BCV actualizada: ' + bcv.promedio);
                    } else {
                      alert('No se pudo obtener la tasa BCV');
                    }
                  } catch (e) {
                    alert('Error obteniendo tasa BCV');
                  }
                }}
                className="btn-secondary py-2 px-4 rounded-lg font-bold text-sm h-10"
              >
                Obtener Tasa BCV Actual
              </button>
            </div>
          </div>

          {/* BINANCE API INTEGRATION & VALIDATION CARD */}
          <div className="bg-surface-elevated p-6 rounded-2xl border-2 border-amber-500/30 shadow-[0_4px_25px_rgba(240,185,11,0.1)] mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-glass-border pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/20 text-[#F0B90B] flex items-center justify-center border border-[#F0B90B]/40 shadow-[0_0_15px_rgba(240,185,11,0.25)]">
                  <Bitcoin size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-on-surface">
                      Autorización y Validación con <span className="text-[#F0B90B]">Binance API</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-[#F0B90B] border border-amber-500/30">
                      API v3 & Pay
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Verifica automáticamente los pagos de USDT y Binance Pay mediante tu Clave API y Clave Secreta.
                  </p>
                </div>
              </div>

              {/* Enable toggle */}
              <label className="flex items-center gap-3 cursor-pointer bg-surface px-4 py-2 rounded-xl border border-glass-border hover:border-amber-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.binanceEnabled || false}
                  onChange={(e) => handleSettingsChange("binanceEnabled", e.target.checked)}
                  className="w-5 h-5 text-amber-500 bg-surface-container border-glass-border rounded focus:ring-amber-400"
                />
                <span className="text-sm font-bold text-on-surface">
                  {localSettings.binanceEnabled ? "Validación Activa" : "Desactivado"}
                </span>
              </label>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* API Key Input */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5 flex items-center gap-1.5">
                    <Key size={14} className="text-[#F0B90B]" />
                    Clave API de Binance (API Key)
                  </label>
                  <div className="relative">
                    <input
                      type={showBinanceApiKey ? "text" : "password"}
                      value={localSettings.binanceApiKey || ""}
                      onChange={(e) => handleSettingsChange("binanceApiKey", e.target.value)}
                      placeholder="Pega aquí tu API Key de Binance..."
                      className="w-full bg-surface border border-glass-border rounded-xl py-2.5 pl-3 pr-10 text-on-surface text-sm font-mono focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBinanceApiKey(!showBinanceApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                      title={showBinanceApiKey ? "Ocultar" : "Mostrar"}
                    >
                      {showBinanceApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Secret Key Input */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#F0B90B]" />
                    Clave Secreta de Binance (Secret Key)
                  </label>
                  <div className="relative">
                    <input
                      type={showBinanceSecret ? "text" : "password"}
                      value={localSettings.binanceApiSecret || ""}
                      onChange={(e) => handleSettingsChange("binanceApiSecret", e.target.value)}
                      placeholder="Pega aquí tu Secret Key de Binance..."
                      className="w-full bg-surface border border-glass-border rounded-xl py-2.5 pl-3 pr-10 text-on-surface text-sm font-mono focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBinanceSecret(!showBinanceSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                      title={showBinanceSecret ? "Ocultar" : "Mostrar"}
                    >
                      {showBinanceSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Binance Pay ID / Merchant ID */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">
                    Binance Pay ID / Email de Cuenta (Opcional)
                  </label>
                  <input
                    type="text"
                    value={localSettings.binancePayId || ""}
                    onChange={(e) => handleSettingsChange("binancePayId", e.target.value)}
                    placeholder="Ej: 82938172 o tu email de Binance"
                    className="w-full bg-surface border border-glass-border rounded-xl py-2.5 px-3 text-on-surface text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Se mostrará a los clientes para facilitar sus pagos directos a tu cuenta.
                  </p>
                </div>

                {/* Custom Payment Link */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">
                    Link de Cobro Binance Pay (Opcional)
                  </label>
                  <input
                    type="text"
                    value={localSettings.binanceCustomPayUrl || ""}
                    onChange={(e) => handleSettingsChange("binanceCustomPayUrl", e.target.value)}
                    placeholder="https://pay.binance.com/..."
                    className="w-full bg-surface border border-glass-border rounded-xl py-2.5 px-3 text-on-surface text-sm focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Enlace directo de cobro creado en Binance si deseas abrirlo directamente.
                  </p>
                </div>

                {/* Validation Mode */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">
                    Modo de Validación Automática
                  </label>
                  <select
                    value={localSettings.binanceValidationMode || "auto"}
                    onChange={(e) => handleSettingsChange("binanceValidationMode", e.target.value)}
                    className="w-full bg-surface border border-glass-border rounded-xl py-2.5 px-3 text-on-surface text-sm focus:border-amber-400 focus:outline-none"
                  >
                    <option value="auto">Validación Inteligente Combinada (Pay & Depósitos)</option>
                    <option value="api_transactions">Historial de Transacciones Pay / C2C</option>
                    <option value="merchant_pay">Binance Pay Merchant Oficial (v2/v3)</option>
                  </select>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Revisa las transacciones registradas en tu Binance para validar al instante.
                  </p>
                </div>
              </div>

              {/* Action: Test Connection Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleTestBinanceConnection}
                  disabled={isTestingBinance || !localSettings.binanceApiKey || !localSettings.binanceApiSecret}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(240,185,11,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isTestingBinance ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Probando Conexión con Binance...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Probar Conexión con Binance API
                    </>
                  )}
                </button>

                <span className="text-xs text-on-surface-variant">
                  {localSettings.binanceApiKey && localSettings.binanceApiSecret
                    ? "✓ Credenciales listas para verificación"
                    : "⚠️ Ingresa tu API Key y Secret Key para probar"}
                </span>
              </div>

              {/* Test Result Banner */}
              {binanceTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm animate-in fade-in duration-300 ${
                    binanceTestResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {binanceTestResult.success ? (
                      <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 w-full">
                      <p className="font-bold text-sm">{binanceTestResult.message}</p>
                      {binanceTestResult.success && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-500/20 text-xs font-mono">
                          <div>
                            <span className="text-slate-400 block">Latencia:</span>
                            <span className="font-bold text-emerald-400">{binanceTestResult.latencyMs} ms</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Tipo de Cuenta:</span>
                            <span className="font-bold text-emerald-400">{binanceTestResult.accountType || "SPOT"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Saldo USDT Disponible:</span>
                            <span className="font-bold text-emerald-400">${binanceTestResult.usdtBalance} USDT</span>
                          </div>
                        </div>
                      )}
                      {binanceTestResult.error && (
                        <p className="text-xs text-red-300 mt-1">
                          Detalle: {binanceTestResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Informative Guidance Accordion */}
              <div className="p-3.5 rounded-xl bg-surface border border-glass-border text-xs text-on-surface-variant space-y-1.5">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Key size={13} />
                  ¿Cómo generar tus credenciales en Binance?
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Inicia sesión en tu cuenta de <strong className="text-white">Binance</strong> y ve a <strong className="text-white">Perfil → Gestión de API</strong>.</li>
                  <li>Haz clic en <strong className="text-white">Crear API</strong> (Generada por el sistema) y asigna un nombre (ej: "Raidexs").</li>
                  <li>Copia la <strong className="text-amber-300">API Key</strong> y la <strong className="text-amber-300">Secret Key</strong> (solo se muestra una vez).</li>
                  <li>En las restricciones de la API, asegúrate de tener marcado <strong className="text-white">"Habilitar lectura"</strong> (no requiere permisos de retiro).</li>
                </ol>
              </div>
            </div>
          </div>

          {/* ================= HANK GAMES INTEGRATION CARD ================= */}
          <div className="bg-surface-elevated p-6 rounded-xl border border-cyan-500/30 shadow-[0_4px_25px_rgba(0,210,255,0.06)] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-glass-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(0,210,255,0.3)]">
                  HG
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-on-surface">
                      Proveedor Hank Games API
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Reseller v1
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Automatización de recargas instantáneas y entrega de Gift Cards vía API oficial.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckHankGamesBalance}
                  disabled={isCheckingHankGamesBalance}
                  className="px-3 py-1.5 rounded-lg bg-surface border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isCheckingHankGamesBalance ? "animate-spin" : ""} />
                  {isCheckingHankGamesBalance ? "Consultando..." : "Consultar Saldo"}
                </button>
                <button
                  type="button"
                  onClick={() => syncHankGamesCatalog(false)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Sincronizar Catálogo
                </button>
              </div>
            </div>

            {/* Server IP Allowlist Notice (Essential for Hank Games) */}
            <div className="mb-5 p-3.5 rounded-xl bg-[#030919] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">
                    IP de Salida del Servidor (Lista Blanca / Allowlist)
                  </p>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Hank Games exige autorizar la IP de tu servidor para permitir consultas y entregas (error 401 si no está autorizada).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 bg-surface px-3 py-1.5 rounded-lg border border-glass-border">
                <span className="font-mono text-cyan-400 font-bold text-xs select-all">
                  {hankGamesServerIp || "Detectando IP..."}
                </span>
                {hankGamesServerIp && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(hankGamesServerIp);
                      alert(`IP copiada al portapapeles: ${hankGamesServerIp}`);
                    }}
                    className="p-1 hover:text-white text-on-surface-variant transition-colors"
                    title="Copiar IP"
                  >
                    <Copy size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Credential Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  x-client-id (Client ID)
                </label>
                <input
                  type="text"
                  value={localSettings.hankGamesClientId || ""}
                  onChange={(e) => handleSettingsChange("hankGamesClientId", e.target.value)}
                  placeholder="Ej: 3a271bd9d6510320 (o vía variable HANKGAMES_CLIENT_ID)"
                  className="w-full bg-surface border border-glass-border rounded-xl py-2 px-3 text-on-surface text-sm font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 flex justify-between items-center">
                  <span>x-client-secret (Client Secret)</span>
                  <button
                    type="button"
                    onClick={() => setShowHankGamesSecret(!showHankGamesSecret)}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    {showHankGamesSecret ? "Ocultar" : "Mostrar"}
                  </button>
                </label>
                <input
                  type={showHankGamesSecret ? "text" : "password"}
                  value={localSettings.hankGamesClientSecret || ""}
                  onChange={(e) => handleSettingsChange("hankGamesClientSecret", e.target.value)}
                  placeholder="Client Secret para generar Bearer Token"
                  className="w-full bg-surface border border-glass-border rounded-xl py-2 px-3 text-on-surface text-sm font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Test or Balance Result Feedback */}
            {hankGamesTestResult && (
              <div className={`p-3 rounded-xl mb-4 text-xs flex items-center justify-between border ${
                hankGamesTestResult.success 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}>
                <span>{hankGamesTestResult.message} {hankGamesTestResult.error && `(${hankGamesTestResult.error})`}</span>
                {hankGamesTestResult.balance !== undefined && (
                  <span className="font-bold text-sm font-mono text-emerald-400">
                    ${hankGamesTestResult.balance} USD
                  </span>
                )}
              </div>
            )}

            {/* Webhook Registration Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-glass-border">
              <div>
                <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-cyan-400" />
                  Webhook de Cambios de Estado (Callbacks)
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Recibe eventos en tiempo real (<code className="text-cyan-300">order.status_changed</code>) para completar órdenes automáticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRegisterWebhook}
                disabled={isRegisteringWebhook}
                className="px-3.5 py-1.5 rounded-lg bg-surface border border-glass-border hover:border-cyan-500/50 text-xs font-bold text-on-surface hover:text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Zap size={13} className="text-amber-400" />
                {isRegisteringWebhook ? "Registrando..." : "Registrar Webhook en Hank Games"}
              </button>
            </div>

            {webhookRegisterResult && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs border ${
                webhookRegisterResult.success 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}>
                {webhookRegisterResult.message}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {(localSettings.paymentMethods || []).map((method, index) => (
              <div
                key={`${method.id || 'pm'}-${index}`}
                className="bg-surface-elevated p-6 rounded-xl border border-glass-border relative group"
              >
                <button
                  onClick={() => {
                    const newMethods = (localSettings.paymentMethods || []).filter(
                      (_, i) => i !== index,
                    );
                    handleSettingsChange("paymentMethods", newMethods);
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
                  title="Eliminar Método"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex flex-col md:flex-row gap-4 mb-4 pr-12">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Nombre del Método
                    </label>
                    <input
                      type="text"
                      value={method.name}
                      onChange={(e) => {
                        const newMethods = [...(localSettings.paymentMethods || [])];
                        newMethods[index].name = e.target.value;
                        handleSettingsChange("paymentMethods", newMethods);
                      }}
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Tipo de Ícono
                    </label>
                    <select
                      value={method.iconType}
                      onChange={(e) => {
                        const newMethods = [...(localSettings.paymentMethods || [])];
                        newMethods[index].iconType = e.target.value as any;
                        handleSettingsChange("paymentMethods", newMethods);
                      }}
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="payments">Billetes (Pagos / Pago Móvil)</option>
                      <option value="account_balance">
                        Banco (Zelle/Transf)
                      </option>
                      <option value="credit_card">Tarjeta de Crédito</option>
                      <option value="binance">Binance / Crypto</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                      Moneda
                    </label>
                    <select
                      value={method.currency || 'USD'}
                      onChange={(e) => {
                        const newMethods = [...(localSettings.paymentMethods || [])];
                        newMethods[index].currency = e.target.value as any;
                        handleSettingsChange("paymentMethods", newMethods);
                      }}
                      className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="USD">USD (Dólares)</option>
                      <option value="VES">VES (Bolívares)</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    Instrucciones / Datos de Pago
                  </label>
                  <textarea
                    value={method.instructions || ""}
                    onChange={(e) => {
                      const newMethods = [...(localSettings.paymentMethods || [])];
                      newMethods[index].instructions = e.target.value;
                      handleSettingsChange("paymentMethods", newMethods);
                    }}
                    placeholder="Ej: Banco: Bancaribe\nCédula: 1234567\nTeléfono: 0412-1234567"
                    className="w-full bg-surface border border-glass-border rounded-lg py-2 px-3 text-on-surface focus:border-primary focus:outline-none min-h-[90px] resize-y font-mono text-sm"
                  />
                </div>

                {/* QR CODE CONFIGURATION FOR PAYMENT METHOD */}
                <div className="p-4 rounded-xl bg-surface/70 border border-glass-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 uppercase">
                      <QrCode size={15} className="text-cyan-400" />
                      Código QR para este Método (Opcional)
                    </label>
                    {method.qrCodeUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          const newMethods = [...(localSettings.paymentMethods || [])];
                          newMethods[index].qrCodeUrl = "";
                          newMethods[index].qrTitle = "";
                          handleSettingsChange("paymentMethods", newMethods);
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                      >
                        Quitar QR
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                          URL de la imagen del Código QR
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={method.qrCodeUrl || ""}
                            onChange={(e) => {
                              const newMethods = [...(localSettings.paymentMethods || [])];
                              newMethods[index].qrCodeUrl = e.target.value;
                              handleSettingsChange("paymentMethods", newMethods);
                            }}
                            placeholder="https://... o sube una imagen directa"
                            className="w-full bg-surface border border-glass-border rounded-lg py-1.5 px-3 text-on-surface text-xs focus:border-cyan-400 focus:outline-none font-mono"
                          />
                          <label className="shrink-0 bg-surface-container hover:bg-surface-elevated text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors">
                            <Upload size={13} />
                            Subir QR
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newMethods = [...(localSettings.paymentMethods || [])];
                                    newMethods[index].qrCodeUrl = reader.result as string;
                                    handleSettingsChange("paymentMethods", newMethods);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                          Texto / Título sobre el QR (Opcional)
                        </label>
                        <input
                          type="text"
                          value={method.qrTitle || ""}
                          onChange={(e) => {
                            const newMethods = [...(localSettings.paymentMethods || [])];
                            newMethods[index].qrTitle = e.target.value;
                            handleSettingsChange("paymentMethods", newMethods);
                          }}
                          placeholder={`Ej: Escanea para pagar con ${method.name}`}
                          className="w-full bg-surface border border-glass-border rounded-lg py-1.5 px-3 text-on-surface text-xs focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* QR Preview */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface border border-glass-border min-h-[100px]">
                      {method.qrCodeUrl ? (
                        <div className="w-24 h-24 bg-white p-1 rounded-md shadow flex items-center justify-center overflow-hidden">
                          <img
                            src={method.qrCodeUrl}
                            alt="Vista previa QR"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-2">
                          <QrCode size={28} className="mx-auto text-slate-600 mb-1" />
                          <span className="text-[10px] text-on-surface-variant block">Sin código QR</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                const newMethods = [
                  ...(localSettings.paymentMethods || []),
                  {
                    id: `pm_${Date.now()}`,
                    name: "Nuevo Método",
                    iconType: "payments" as any,
                  },
                ];
                handleSettingsChange("paymentMethods", newMethods);
              }}
              className="w-full py-4 border-2 border-dashed border-glass-border rounded-xl text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2 font-bold"
            >
              <Plus size={20} /> Agregar Método de Pago
            </button>
          </div>
        </div>
      ) : activeTab === "orders" ? (
        <div className="bg-surface-container border border-glass-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                Órdenes
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Gestiona y aprueba los pedidos de los usuarios.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">
                    ID Orden
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm hidden md:table-cell">
                    Fecha
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm hidden md:table-cell">
                    Usuario
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm hidden lg:table-cell">
                    Player ID
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">
                    Juego/Paquete
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm hidden sm:table-cell">
                    Referencia
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">
                    Total
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm text-center">
                    Estado
                  </th>
                  <th className="py-3 px-4 font-bold text-on-surface-variant text-sm text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-on-surface-variant"
                    >
                      No hay órdenes disponibles.
                    </td>
                  </tr>
                ) : (
                  (orders || []).map((order, index) => (
                    <tr
                      key={`${order.id || 'order'}-${index}`}
                      className="border-b border-glass-border/50 hover:bg-surface-elevated/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-mono whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 text-sm hidden md:table-cell">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm hidden md:table-cell">
                        <div className="truncate max-w-[150px]" title={order.userEmail}>
                          {order.userEmail}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm hidden lg:table-cell">
                        {order.playerId ? (
                          <div className="text-xs text-tertiary-container font-mono font-bold whitespace-nowrap">
                            {order.playerId}
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="font-bold truncate max-w-[120px] md:max-w-none">{order.gameName}</div>
                        <div className="text-on-surface-variant text-xs truncate max-w-[120px] md:max-w-none">
                          {order.packageName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono text-tertiary-container hidden sm:table-cell">
                        {order.referenceNumber || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-primary whitespace-nowrap">
                        Bs {order.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                            order.status === "completed"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : order.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {order.status === "completed"
                            ? "Completado"
                            : order.status === "pending"
                              ? "Pendiente"
                              : order.status === "rejected"
                                ? "Rechazado"
                                : "Fallido"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded border border-primary/50 transition-colors"
                            title="Ver Detalles"
                          >
                            <Eye size={16} />
                          </button>
                          {order.status === "pending" && onUpdateOrder && (
                            <>
                              <button
                                onClick={() =>
                                  onUpdateOrder(order.id, "completed")
                                }
                                className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded border border-green-500/50 transition-colors"
                                title="Aprobar Manualmente"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  onUpdateOrder(order.id, "rejected")
                                }
                                className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded border border-red-500/50 transition-colors"
                                title="Rechazar"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "emails" ? (
        <EmailComposer orders={orders || []} />
      ) : null}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-surface-container border border-glass-border rounded-2xl w-full max-w-sm overflow-hidden flex flex-col items-center justify-center text-center p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">
              ¿Eliminar Juego?
            </h3>
            <p className="text-on-surface-variant font-medium text-sm mb-6">
              Esta acción no se puede deshacer. Se eliminarán todos los paquetes
              asociados a este juego.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-surface border border-glass-border text-on-surface hover:bg-surface-elevated transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteGame}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600/30 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div 
            className="bg-surface-container border border-glass-border rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-glass-border sticky top-0 bg-surface-container z-10">
              <h3 className="text-xl font-bold text-on-surface">Detalles del Pago</h3>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors bg-surface-elevated p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">ID de Orden</p>
                  <p className="text-on-surface font-mono">{selectedOrderDetails.id}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Fecha</p>
                  <p className="text-on-surface">{new Date(selectedOrderDetails.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Usuario (Email)</p>
                  <p className="text-on-surface">{selectedOrderDetails.userEmail || "N/A"}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">ID de Jugador</p>
                  <p className="text-tertiary-container font-mono font-bold">{selectedOrderDetails.playerId || "N/A"}</p>
                </div>
                <div className="col-span-2 border-t border-glass-border pt-4 mt-2"></div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Juego</p>
                  <p className="text-on-surface font-bold">{selectedOrderDetails.gameName}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Paquete</p>
                  <p className="text-on-surface">{selectedOrderDetails.packageName}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Método de Pago</p>
                  <p className="text-on-surface">{selectedOrderDetails.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Referencia</p>
                  <p className="text-tertiary-container font-mono">{selectedOrderDetails.referenceNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Total a Pagar</p>
                  <p className="text-primary font-bold text-lg">Bs {selectedOrderDetails.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold mb-1">Estado</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      selectedOrderDetails.status === "completed"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : selectedOrderDetails.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {selectedOrderDetails.status === "completed"
                      ? "Completado"
                      : selectedOrderDetails.status === "pending"
                        ? "Pendiente"
                        : selectedOrderDetails.status === "rejected"
                          ? "Rechazado"
                          : "Fallido"}
                  </span>
                </div>
              </div>
              
              {selectedOrderDetails.hankGamesResult && (
                <div className="mt-4 border-t border-glass-border pt-4">
                  <p className="text-on-surface-variant font-bold mb-2">Resultado Hank Games</p>
                  <pre className="w-full bg-black/40 rounded-lg p-3 border border-glass-border text-xs text-on-surface whitespace-pre-wrap font-mono overflow-auto max-h-32">
                    {JSON.stringify(selectedOrderDetails.hankGamesResult, null, 2)}
                  </pre>
                </div>
              )}
{selectedOrderDetails.receiptUrl && (
                <div className="mt-4 border-t border-glass-border pt-4">
                  <p className="text-on-surface-variant font-bold mb-2">Comprobante Adjunto</p>
                  <div className="w-full bg-black/40 rounded-lg p-2 border border-glass-border flex justify-center">
                    <img 
                      src={selectedOrderDetails.receiptUrl} 
                      alt="Comprobante de pago" 
                      className="max-h-64 object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
            {selectedOrderDetails.status === "pending" && onUpdateOrder && (
              <div className="flex gap-3 w-full p-6 border-t border-glass-border bg-surface-elevated/50">
                <button
                  onClick={() => {
                    onUpdateOrder(selectedOrderDetails.id, "rejected");
                    setSelectedOrderDetails(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} /> Rechazar
                </button>
                <button
                  onClick={() => {
                    onUpdateOrder(selectedOrderDetails.id, "completed");
                    setSelectedOrderDetails(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Aprobar Pago
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Game Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#050f26]/95 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 text-left shadow-[0_0_30px_rgba(0,210,255,0.25)] relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
            
            <h3 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
              <RefreshCw size={18} className="text-cyan-400" />
              Importar Catálogo Hank Games
            </h3>
            
            <p className="text-xs text-gray-400 mb-4">
              A continuación se listan todos los juegos provistos por tu reseller de Hank Games. Selecciona únicamente los que desees ofrecer en tu tienda para importarlos.
            </p>

            {/* Modal Search Bar */}
            <div className="relative mb-4 shrink-0">
              <input
                type="text"
                value={importSearchTerm}
                onChange={(e) => setImportSearchTerm(e.target.value)}
                placeholder="Buscar juego en catálogo reseller..."
                className="w-full bg-[#030a1b] border border-cyan-500/25 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium text-white focus:outline-none focus:border-cyan-400 placeholder:text-gray-500 shadow-inner"
              />
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[250px]">
              {availableHgProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-xs text-gray-400">Cargando catálogo... Asegúrate de presionar el botón "Sync Hank Games" en la sección de juegos para conectar por primera vez.</p>
                </div>
              ) : (
                (() => {
                  // Filter out products already present in store
                  const nonAdded = availableHgProducts.filter(apiGame => {
                    return !localGames.some(g => g.id === apiGame.productId || g.name.toLowerCase() === apiGame.name.toLowerCase());
                  }).filter(apiGame => {
                    return apiGame.name.toLowerCase().includes(importSearchTerm.toLowerCase()) ||
                           String(apiGame.productId).toLowerCase().includes(importSearchTerm.toLowerCase());
                  });

                  if (nonAdded.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <p className="text-xs text-gray-400">No hay nuevos productos para importar que coincidan con la búsqueda.</p>
                      </div>
                    );
                  }

                  return nonAdded.map((apiGame, idx) => (
                    <div
                      key={`import-${apiGame.productId || idx}`}
                      className="p-3.5 bg-slate-950/60 hover:bg-slate-950/95 border border-cyan-500/10 rounded-xl flex items-center justify-between gap-4 transition-colors"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-white">{apiGame.name}</h4>
                        <p className="text-[10px] text-cyan-400 font-mono mt-0.5">ID: {apiGame.productId}</p>
                        <p className="text-xs text-gray-400 mt-1">{apiGame.packages?.length || 0} paquetes de recarga</p>
                      </div>
                      
                      <button
                        onClick={() => handleImportHgProduct(apiGame)}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-colors cursor-pointer shrink-0"
                      >
                        Importar
                      </button>
                    </div>
                  ));
                })()
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-glass-border flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/5 border border-white/10"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
