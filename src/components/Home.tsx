import { useState, useMemo } from "react";
import {
  Search,
  Gamepad2,
  Smartphone,
  Monitor,
  Zap,
  ShieldCheck,
  Headset,
  ArrowRight,
  Gift,
  Sparkles,
  Radio,
  X,
  ChevronRight,
  Download
} from "lucide-react";
import { Game, SiteSettings, isGameGiftCard, isGameService } from "../types";
import mascotImg from "../assets/images/mascot_1782343593124.jpg";

interface Props {
  games: Game[];
  siteSettings?: SiteSettings | null;
  onSelectGame: (game: Game) => void;
  onOpenDownloadApp?: () => void;
}

type SectionTab = "all" | "mobile" | "pc" | "giftcards" | "services";

export default function Home({ games, siteSettings, onSelectGame, onOpenDownloadApp }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<SectionTab>("all");

  const showMascot = siteSettings ? siteSettings.showMascotHome : true;
  const currentMascotUrl = siteSettings?.mascotHomeUrl || mascotImg;

  // Split all products into distinct groups
  const mobileRechargeGames = useMemo(() => {
    return (games || []).filter(
      (item) => item.category === "mobile" && !isGameGiftCard(item) && !isGameService(item)
    );
  }, [games]);

  const pcRechargeGames = useMemo(() => {
    return (games || []).filter(
      (item) => (item.category === "pc" || item.category === "console") && !isGameGiftCard(item) && !isGameService(item)
    );
  }, [games]);

  const giftCards = useMemo(() => {
    return (games || []).filter((item) => isGameGiftCard(item));
  }, [games]);

  const otherServices = useMemo(() => {
    return (games || []).filter((item) => isGameService(item));
  }, [games]);

  // Helper to strip internal provider names like "HankGames" from display
  const cleanPublisher = (pub?: string) => {
    if (!pub) return "";
    const lower = pub.toLowerCase();
    if (lower.includes("hank") || lower.includes("reseller")) return "";
    return pub;
  };

  // Filtered Mobile Games
  const filteredMobileGames = useMemo(() => {
    return mobileRechargeGames.filter((game) => {
      return (
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleanPublisher(game.publisher).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.region || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [mobileRechargeGames, searchTerm]);

  // Filtered PC Games
  const filteredPcGames = useMemo(() => {
    return pcRechargeGames.filter((game) => {
      return (
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleanPublisher(game.publisher).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.region || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [pcRechargeGames, searchTerm]);

  // Filtered Gift Cards
  const filteredGiftCards = useMemo(() => {
    return giftCards.filter((card) => {
      return (
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleanPublisher(card.publisher).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.region || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [giftCards, searchTerm]);

  // Filtered Other Services
  const filteredOtherServices = useMemo(() => {
    return otherServices.filter((service) => {
      return (
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleanPublisher(service.publisher).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.region || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [otherServices, searchTerm]);

  const scrollToSection = (section: SectionTab) => {
    setActiveSection(section);
    const element = document.getElementById("catalogs-container");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Reusable Product Card Component (Matches NexPlay Cyber Cyan aesthetic)
  const renderProductCard = (item: Game, index: number) => {
    const discount = item.discountBadge;
    const pub = cleanPublisher(item.publisher);
    const regionText = item.region || pub || "GLOBAL";

    return (
      <div
        key={`${item.id || "item"}-${index}`}
        id={`product-card-${item.id}`}
        onClick={() => onSelectGame(item)}
        className="group cursor-pointer bg-[#050f26]/90 hover:bg-[#09183d] rounded-2xl overflow-hidden transition-all duration-300 border border-cyan-500/15 hover:border-cyan-400/60 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_-8px_rgba(0,210,255,0.25)] flex flex-col relative"
      >
        {/* Top Image Container */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#030917] flex items-center justify-center">
          <img
            src={item.cardUrl || item.bannerUrl || undefined}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Top Right Discount Badge (Only displayed if explicitly configured) */}
          {discount && discount.trim() !== '' && (
            <div className="absolute top-2.5 right-2.5 z-20">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-[0_2px_10px_rgba(0,210,255,0.5)] tracking-tight">
                {discount}
              </span>
            </div>
          )}

          {/* Subtle bottom gradient on image */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#050f26] to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="p-3 md:p-3.5 bg-[#030a1b] flex flex-col justify-center border-t border-cyan-500/10 flex-grow">
          {/* Region / Category Subtitle */}
          <span className="text-[10px] md:text-[11px] font-bold text-cyan-400/80 uppercase tracking-wider truncate mb-0.5">
            {regionText}
          </span>

          {/* Product Name */}
          <h3 className="font-display text-sm md:text-base font-bold text-white leading-tight truncate group-hover:text-cyan-300 transition-colors">
            {item.name}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full animation-fade-in pb-24 md:pb-8 text-on-surface">
      {/* Hero Section */}
      <section className="relative w-full aspect-[21/9] min-h-[380px] md:min-h-[420px] flex items-center justify-center overflow-hidden mb-8 md:mb-12">
        <div className="absolute inset-0 z-0">
          {siteSettings?.siteBannerUrl ? (
            <img
              src={siteSettings.siteBannerUrl}
              alt="Raidexs Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#020716] relative flex items-center justify-center overflow-hidden">
              {/* Tech grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1a3d_1px,transparent_1px),linear-gradient(to_bottom,#0b1a3d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35"></div>
              {/* Radial gradient glow spheres */}
              <div className="absolute -top-1/4 -left-1/4 w-[60%] h-[80%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse"></div>
              <div className="absolute -bottom-1/4 -right-1/4 w-[60%] h-[80%] rounded-full bg-blue-600/5 blur-[120px]"></div>
              {/* Diagonal laser swipe lines */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-20 shadow-[0_0_15px_rgba(0,210,255,0.4)]"></div>
              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-10"></div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent"></div>
        </div>

        <div className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 backdrop-blur-sm shadow-[0_0_12px_rgba(0,210,255,0.2)]">
              <Sparkles size={14} /> Recargas Directas, Gift Cards & Servicios
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight uppercase tracking-tight">
              RAID<span className="text-cyan-400 drop-shadow-[0_0_16px_rgba(0,210,255,0.6)]">EXS</span>
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-md font-medium">
              Tu tienda favorita de recargas directas por ID, tarjetas de regalo digitales y servicios con entrega inmediata.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                id="hero-btn-recharge-mobile"
                onClick={() => scrollToSection("mobile")}
                className="btn-primary text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 group transition-all text-sm"
              >
                <Smartphone size={18} />
                Recargas Móviles
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <button
                id="hero-btn-recharge-pc"
                onClick={() => scrollToSection("pc")}
                className="px-5 py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 transition-colors flex items-center gap-2 text-sm"
              >
                <Monitor size={18} className="text-cyan-400" />
                Recargas PC
              </button>
              <button
                id="hero-btn-giftcards"
                onClick={() => scrollToSection("giftcards")}
                className="px-5 py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 transition-colors flex items-center gap-2 text-sm"
              >
                <Gift size={18} className="text-cyan-400" />
                Gift Cards
              </button>
              <button
                id="hero-btn-services"
                onClick={() => scrollToSection("services")}
                className="px-5 py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 transition-colors flex items-center gap-2 text-sm"
              >
                <Radio size={18} className="text-cyan-400" />
                Otros Servicios
              </button>
              {onOpenDownloadApp && (
                <button
                  id="hero-btn-download-app"
                  onClick={onOpenDownloadApp}
                  className="px-5 py-3 rounded-xl font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 transition-colors flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  <Download size={18} className="text-cyan-400" />
                  Descargar App (APK)
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#050f26]/80 p-3.5 rounded-2xl border border-cyan-500/20 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,210,255,0.2)]">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Entrega Instantánea</h4>
              <p className="text-xs text-gray-400">Directo a tu ID o contacto</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Seguro & Oficial</h4>
              <p className="text-xs text-gray-400">Sin contraseñas ni riesgos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
              <Headset size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Soporte 24/7</h4>
              <p className="text-xs text-gray-400">Atención personalizada WhatsApp</p>
            </div>
          </div>
          <div 
            onClick={onOpenDownloadApp}
            className="flex items-center gap-3 p-2 bg-gradient-to-r from-cyan-950/40 to-blue-950/30 hover:from-cyan-900/50 hover:to-blue-900/40 rounded-xl border border-cyan-500/40 cursor-pointer transition-all active:scale-95 group shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,210,255,0.3)] group-hover:scale-105 transition-transform">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-cyan-300 flex items-center gap-1.5">
                <span>Descargar App</span>
                <span className="text-[9px] bg-cyan-400 text-black px-1.5 py-0.5 rounded font-black tracking-wider">APK</span>
              </h4>
              <p className="text-xs text-gray-300 group-hover:text-white transition-colors">Android & Web Directo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalogs Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full" id="catalogs-container">
        {/* Top Control Bar: Category Switcher & Search Bar */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-500/15">
            {/* Category Filter Pills */}
            <div className="flex bg-[#050f26] rounded-xl p-1.5 border border-cyan-500/20 shadow-md overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
              <button
                id="filter-tab-all"
                onClick={() => setActiveSection("all")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSection === "all"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.4)] font-black"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sparkles size={15} />
                Todos ({mobileRechargeGames.length + pcRechargeGames.length + giftCards.length + otherServices.length})
              </button>
              <button
                id="filter-tab-mobile-recharge"
                onClick={() => setActiveSection("mobile")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSection === "mobile"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.4)] font-black"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Smartphone size={15} />
                Recargas Móviles ({mobileRechargeGames.length})
              </button>
              <button
                id="filter-tab-pc-recharge"
                onClick={() => setActiveSection("pc")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSection === "pc"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.4)] font-black"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Monitor size={15} />
                Recargas PC ({pcRechargeGames.length})
              </button>
              <button
                id="filter-tab-giftcards"
                onClick={() => setActiveSection("giftcards")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSection === "giftcards"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.4)] font-black"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Gift size={15} />
                Gift Cards ({giftCards.length})
              </button>
              <button
                id="filter-tab-services"
                onClick={() => setActiveSection("services")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSection === "services"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.4)] font-black"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Radio size={15} />
                Otros Servicios ({otherServices.length})
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70"
                size={18}
              />
              <input
                id="catalog-search-input"
                type="text"
                placeholder={
                  activeSection === "mobile"
                    ? "Buscar recargas móviles..."
                    : activeSection === "pc"
                    ? "Buscar recargas para PC..."
                    : activeSection === "giftcards"
                    ? "Buscar tarjeta de regalo..."
                    : activeSection === "services"
                    ? "Buscar servicio..."
                    : "Buscar en todo el catálogo..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#050f26] border border-cyan-500/20 rounded-xl py-2.5 pl-10 pr-9 text-sm font-medium text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors placeholder:text-gray-400 shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                  title="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: RECARGAS MÓVILES */}
        {/* ========================================================================= */}
        {(activeSection === "all" || activeSection === "mobile") && (
          <section className="mb-12" id="section-recargas-moviles">
            {/* Header: "Recargas Móviles" + "Ver todos" */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl md:text-2xl font-black text-white flex items-center gap-1.5 tracking-tight">
                Recargas <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,210,255,0.4)]">Móviles</span>
              </h2>

              <button
                id="btn-ver-todos-mobile"
                onClick={() => {
                  if (activeSection === "mobile") {
                    setActiveSection("all");
                  } else {
                    setActiveSection("mobile");
                  }
                }}
                className="bg-[#050f26] hover:bg-[#0a1b42] active:scale-95 text-gray-200 hover:text-cyan-300 border border-cyan-500/20 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>{activeSection === "mobile" ? "Ver todos los catálogos" : "Ver todos"}</span>
                <ChevronRight size={14} className="text-cyan-400" />
              </button>
            </div>

            {/* Grid of Mobile Games */}
            {filteredMobileGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {filteredMobileGames.map((game, index) =>
                  renderProductCard(game, index)
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-[#050f26]/50 rounded-2xl border border-cyan-500/10 border-dashed">
                <Smartphone size={36} className="text-gray-500 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">
                  No se encontraron juegos para móviles
                </h4>
                <p className="text-xs text-gray-400">
                  Prueba cambiando el término de búsqueda.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: RECARGAS PC */}
        {/* ========================================================================= */}
        {(activeSection === "all" || activeSection === "pc") && (
          <section className="mb-12" id="section-recargas-pc">
            {/* Header: "Recargas PC" + "Ver todos" */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl md:text-2xl font-black text-white flex items-center gap-1.5 tracking-tight">
                Recargas <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,210,255,0.4)]">PC & Consolas</span>
              </h2>

              <button
                id="btn-ver-todos-pc"
                onClick={() => {
                  if (activeSection === "pc") {
                    setActiveSection("all");
                  } else {
                    setActiveSection("pc");
                  }
                }}
                className="bg-[#050f26] hover:bg-[#0a1b42] active:scale-95 text-gray-200 hover:text-cyan-300 border border-cyan-500/20 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>{activeSection === "pc" ? "Ver todos los catálogos" : "Ver todos"}</span>
                <ChevronRight size={14} className="text-cyan-400" />
              </button>
            </div>

            {/* Grid of PC Games */}
            {filteredPcGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {filteredPcGames.map((game, index) =>
                  renderProductCard(game, index)
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-[#050f26]/50 rounded-2xl border border-cyan-500/10 border-dashed">
                <Monitor size={36} className="text-gray-500 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">
                  No se encontraron juegos para PC o Consolas
                </h4>
                <p className="text-xs text-gray-400">
                  Prueba cambiando el término de búsqueda.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: GIFT CARDS */}
        {/* ========================================================================= */}
        {(activeSection === "all" || activeSection === "giftcards") && (
          <section className="mb-12" id="section-gift-cards">
            {/* Header: "Gift Cards" + "Ver todos" */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl md:text-2xl font-black text-white flex items-center gap-1.5 tracking-tight">
                Gift <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,210,255,0.4)]">Cards</span>
              </h2>

              <button
                id="btn-ver-todos-giftcards"
                onClick={() => {
                  if (activeSection === "giftcards") {
                    setActiveSection("all");
                  } else {
                    setActiveSection("giftcards");
                  }
                }}
                className="bg-[#050f26] hover:bg-[#0a1b42] active:scale-95 text-gray-200 hover:text-cyan-300 border border-cyan-500/20 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>{activeSection === "giftcards" ? "Ver todos los catálogos" : "Ver todos"}</span>
                <ChevronRight size={14} className="text-cyan-400" />
              </button>
            </div>

            {/* Grid of Gift Cards */}
            {filteredGiftCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {filteredGiftCards.map((card, index) =>
                  renderProductCard(card, index)
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-[#050f26]/50 rounded-2xl border border-cyan-500/10 border-dashed">
                <Gift size={36} className="text-gray-500 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">
                  No se encontraron gift cards
                </h4>
                <p className="text-xs text-gray-400">
                  Prueba con términos como Apple, Xbox, Steam, PlayStation o Roblox.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: OTROS SERVICIOS */}
        {/* ========================================================================= */}
        {(activeSection === "all" || activeSection === "services") && (
          <section className="mb-14" id="section-otros-servicios">
            {/* Header: "Otros Servicios" + "Ver todos" */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl md:text-2xl font-black text-white flex items-center gap-1.5 tracking-tight">
                Otros <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,210,255,0.4)]">Servicios</span>
              </h2>

              <button
                id="btn-ver-todos-services"
                onClick={() => {
                  if (activeSection === "services") {
                    setActiveSection("all");
                  } else {
                    setActiveSection("services");
                  }
                }}
                className="bg-[#050f26] hover:bg-[#0a1b42] active:scale-95 text-gray-200 hover:text-cyan-300 border border-cyan-500/20 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>{activeSection === "services" ? "Ver todos los catálogos" : "Ver todos"}</span>
                <ChevronRight size={14} className="text-cyan-400" />
              </button>
            </div>

            {/* Grid of Other Services */}
            {filteredOtherServices.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {filteredOtherServices.map((service, index) =>
                  renderProductCard(service, index)
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-[#050f26]/50 rounded-2xl border border-cyan-500/10 border-dashed">
                <Radio size={36} className="text-gray-500 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">
                  No se encontraron servicios
                </h4>
                <p className="text-xs text-gray-400">
                  Prueba con términos como Telegram, Poppo Live, Bigo Live o Mico.
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Mascot & About Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-[#020714] mb-12 border-t border-cyan-500/15">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1 flex justify-center">
              {showMascot && (
                <>
                  <div className="absolute inset-4 bg-cyan-500/20 blur-3xl rounded-full"></div>
                  <img
                    src={currentMascotUrl}
                    alt="Raidexs Mascot"
                    className="relative w-full max-w-md mx-auto drop-shadow-2xl z-10 rounded-3xl object-cover mask-image-bottom"
                  />
                </>
              )}
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-2">
                <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs">
                  Seguridad y Rapidez Garantizada
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">
                  Tu plataforma confiable para Recargas, Gift Cards y Servicios
                </h2>
                <p className="text-gray-300 text-sm font-medium leading-relaxed">
                  En Raidexs conectamos a los usuarios con los mejores métodos de pago locales e internacionales. Recarga tus títulos favoritos, adquiere códigos digitales oficiales o recarga servicios de streaming con entrega inmediata garantizada.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3.5 items-start p-4 rounded-xl bg-[#050f26] border border-cyan-500/15">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                    <Gamepad2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white mb-0.5">
                      Recargas por ID
                    </h3>
                    <p className="text-gray-400 text-xs font-medium">
                      Directamente a tu cuenta del juego. Solo necesitas tu ID, sin contraseñas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-4 rounded-xl bg-[#050f26] border border-cyan-500/15">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white mb-0.5">
                      Gift Cards Digitales
                    </h3>
                    <p className="text-gray-400 text-xs font-medium">
                      Códigos oficiales de PlayStation, Steam, Xbox, Apple y Google Play.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-4 rounded-xl bg-[#050f26] border border-cyan-500/15">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white mb-0.5">
                      Acreditación en Minutos
                    </h3>
                    <p className="text-gray-400 text-xs font-medium">
                      Sistemas automatizados para procesar tu orden en cuanto se confirma el pago.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-4 rounded-xl bg-[#050f26] border border-cyan-500/15">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                    <Headset size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white mb-0.5">
                      Atención Personalizada
                    </h3>
                    <p className="text-gray-400 text-xs font-medium">
                      Canal de soporte directo para atender cualquier solicitud en tiempo real.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
