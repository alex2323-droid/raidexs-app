import { useState, useMemo } from 'react';
import { Info, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck, Zap, HelpCircle, Grid, List } from 'lucide-react';
import { GamePackage } from '../types';
import { PackageIcon } from './PackageIcons';

interface Props {
  packages: GamePackage[];
  selectedPackage: GamePackage | null;
  onSelect: (pkg: GamePackage) => void;
  exchangeRate?: number;
  gameCurrency?: string;
  gameName?: string;
}

export default function PackageSelection({
  packages = [],
  selectedPackage,
  onSelect,
  exchangeRate = 1,
  gameCurrency = '',
  gameName = 'Juego'
}: Props) {
  const [showInfoModal, setShowInfoModal] = useState<GamePackage | null>(null);
  const [isProductInfoOpen, setIsProductInfoOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Group packages by category if available, or automatically by type (Currency vs Paquetes/Pases)
  const categories = useMemo(() => {
    const cats = new Set<string>();
    packages.forEach(p => {
      let catName = p.category;
      if (!catName) {
        if (p.title) {
          const titleLower = p.title.toLowerCase();
          if (titleLower.includes('pase') || titleLower.includes('pass') || titleLower.includes('membres')) {
            catName = 'Pases';
          } else {
            catName = 'Paquetes';
          }
        } else {
          catName = p.currency || gameCurrency || 'Monedas';
        }
      }
      cats.add(catName);
    });
    return Array.from(cats);
  }, [packages, gameCurrency]);

  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const getCategoryDisplayInfo = (cat: string) => {
    const catLower = cat.toLowerCase();
    if (catLower.includes('gold') || catLower.includes('oro')) {
      return { label: 'Recargas de Oro / Monedas', icon: '🟡' };
    }
    if (catLower.includes('diaman') || catLower.includes('diamond')) {
      return { label: 'Recargas de Diamantes', icon: '💎' };
    }
    if (catLower.includes('pase') || catLower.includes('pass') || catLower.includes('membres')) {
      return { label: 'Pases y Membresías', icon: '🎟️' };
    }
    if (catLower.includes('paquet') || catLower.includes('mejora') || catLower.includes('upgrade')) {
      return { label: 'Paquetes de Mejora Especiales', icon: '📦' };
    }
    return { label: cat, icon: '✨' };
  };

  const categoriesToRender = useMemo(() => {
    if (activeCategory === 'Todos') {
      return categories;
    }
    return [activeCategory];
  }, [activeCategory, categories]);

  const formatBs = (amount: number) => {
    return `Bs. ${(amount * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatUSD = (amount: number) => {
    return `$ ${amount.toFixed(2)}`;
  };

  return (
    <section className="bg-surface/90 rounded-2xl p-4 sm:p-6 border border-cyan-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header with Step Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/40 shadow-[0_0_12px_rgba(0,210,255,0.3)]">
              1
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-on-surface tracking-tight">
              Selecciona tu <span className="text-cyan-400">Paquete</span>
            </h2>
          </div>

          {/* Toggle View Mode for Mobile */}
          <div className="flex items-center bg-[#050f26] rounded-xl p-1 border border-cyan-500/20 ml-3">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_10px_rgba(0,210,255,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Vista de Cuadrícula"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_10px_rgba(0,210,255,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Vista de Lista (Ideal para Móviles)"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Currency / Exchange Rate Indicator */}
        {exchangeRate > 1 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-cyan-500/30 text-[11px] font-bold text-on-surface-variant self-start sm:self-auto shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Tasa BCV: <span className="text-cyan-400 font-extrabold">{exchangeRate.toFixed(2)} VES</span>
          </div>
        )}
      </div>

      {/* Category Tabs (e.g. [ Golds ] [ Paquetes ]) - Fix scroll cut-off on mobile by using justify-start and shrink-0 */}
      {categories.length > 1 && (
        <div className="flex items-center justify-start md:justify-center gap-1.5 mb-6 p-1.5 bg-[#050f26] rounded-2xl border border-cyan-500/20 w-full overflow-x-auto whitespace-nowrap scrollbar-none relative z-10 px-3">
          <button
            onClick={() => setActiveCategory('Todos')}
            className={`px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 capitalize flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeCategory === 'Todos'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>✨</span> Todos ({packages.length})
          </button>
          {categories.map((cat, idx) => {
            const isActive = activeCategory === cat;
            const displayInfo = getCategoryDisplayInfo(cat);
            return (
              <button
                key={`cat-${cat}-${idx}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 capitalize flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{displayInfo.icon}</span>
                <span>{displayInfo.label.replace('Recargas de ', '').replace('Recarga de ', '')}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Dynamic Grouped Category Sections */}
      {categoriesToRender.map((cat) => {
        // Filter packages for this category
        const catPackages = packages.filter(p => {
          let pCat = p.category;
          if (!pCat) {
            if (p.title) {
              const titleLower = p.title.toLowerCase();
              if (titleLower.includes('pase') || titleLower.includes('pass') || titleLower.includes('membres')) {
                pCat = 'Pases';
              } else {
                pCat = 'Paquetes';
              }
            } else {
              pCat = p.currency || gameCurrency || 'Monedas';
            }
          }
          return pCat === cat;
        });

        if (catPackages.length === 0) return null;
        const displayInfo = getCategoryDisplayInfo(cat);

        return (
          <div key={`section-${cat}`} className="mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300 last:mb-2">
            {/* Category Header with Neon Highlight */}
            <h3 className="font-display text-xs sm:text-sm font-black text-cyan-300 flex items-center gap-2 mb-4 border-b border-cyan-500/15 pb-2.5 uppercase tracking-wider">
              <span className="text-sm sm:text-base">{displayInfo.icon}</span>
              <span>{displayInfo.label}</span>
              <span className="text-[10px] text-gray-400 font-bold ml-auto px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/15">
                {catPackages.length} {catPackages.length === 1 ? 'Paquete' : 'Paquetes'}
              </span>
            </h3>

            {/* Grid or List of Packages */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
                {catPackages.map((pkg, index) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const currentPrice = pkg.price;
                  
                  // Calculate original price if discount is present
                  const originalPrice = pkg.originalPrice || (pkg.discountPercentage ? pkg.price / (1 - pkg.discountPercentage / 100) : null);

                  return (
                    <div
                      key={`${pkg.id || 'pkg'}-${index}`}
                      onClick={() => onSelect(pkg)}
                      className={`group relative rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#091d4a] to-[#040e26] border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.3)] scale-[1.01]'
                          : 'bg-surface-container-low border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-[#071536]'
                      }`}
                    >
                      {/* Selected Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 z-10 text-cyan-400 bg-slate-950/80 rounded-full p-0.5 shadow-[0_0_8px_rgba(0,210,255,0.5)]">
                          <CheckCircle2 size={13} className="fill-cyan-400 text-slate-950" />
                        </div>
                      )}

                      {/* Top Bar: Info Icon & Extra Badges */}
                      <div className="p-2 sm:p-3 pb-0 flex items-center justify-between w-full relative z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowInfoModal(pkg);
                          }}
                          className={`p-0.5 rounded-full text-on-surface-variant hover:text-cyan-400 transition-colors ${isSelected ? 'opacity-0 pointer-events-none' : ''}`}
                          title="Detalles del paquete"
                        >
                          <Info size={13} />
                        </button>

                        <div className="flex flex-col gap-0.5 items-end ml-auto">
                          {pkg.bonus ? (
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight shadow-[0_0_6px_rgba(0,210,255,0.3)] shrink-0">
                              +{pkg.bonus} Extra
                            </span>
                          ) : null}
                          {pkg.discountPercentage ? (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[7px] sm:text-[8px] font-black px-1 py-0.2 rounded uppercase shrink-0">
                              -{pkg.discountPercentage}%
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Center 3D Graphic Icon */}
                      <div className="py-1 px-2.5 flex flex-col items-center justify-center text-center">
                        <div className="transform transition-transform group-hover:scale-105 duration-200 flex items-center justify-center min-h-[50px] sm:min-h-[64px]">
                          <PackageIcon pkg={pkg} gameCurrency={gameCurrency} size={46} />
                        </div>

                        {/* Amount / Title */}
                        {pkg.title ? (
                          <h4 className="text-on-surface font-extrabold text-[10px] sm:text-xs mt-1 text-center line-clamp-2 px-1 min-h-[28px] sm:min-h-[34px] flex items-center justify-center leading-tight">
                            {pkg.title}
                          </h4>
                        ) : (
                          <div className="mt-1 text-center flex flex-col items-center justify-center">
                            <span className="text-white font-black text-xs sm:text-base tracking-tight leading-tight">
                              {pkg.amount}
                            </span>
                            <span className="text-cyan-400/80 text-[9px] sm:text-xs font-bold uppercase tracking-wider mt-0.5">
                              {pkg.currency || gameCurrency}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Price Bar (Matching NexPlay Cyan Theme) - Stacked vertically and tightly padded to avoid overflowing */}
                      <div className={`mt-2 border-t px-1 py-1.5 sm:py-2 flex flex-col items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-cyan-500/15 border-cyan-400/30' 
                          : 'bg-slate-950/40 border-cyan-500/10'
                      }`}>
                        {originalPrice && (
                          <span className="text-[9px] sm:text-[10px] text-gray-500 line-through font-semibold mb-0.5">
                            {exchangeRate > 1 ? formatBs(originalPrice) : formatUSD(originalPrice)}
                          </span>
                        )}
                        <span className={`font-black text-[11px] sm:text-xs leading-none ${isSelected ? 'text-cyan-300' : 'text-cyan-400'}`}>
                          {exchangeRate > 1 ? formatBs(currentPrice) : formatUSD(currentPrice)}
                        </span>
                        {exchangeRate > 1 && (
                          <span className="text-[9px] text-gray-400 font-medium mt-0.5">
                            ({formatUSD(currentPrice)})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW: Highly Optimized for Mobile Screen */
              <div className="flex flex-col gap-2.5">
                {catPackages.map((pkg, index) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const currentPrice = pkg.price;
                  const originalPrice = pkg.originalPrice || (pkg.discountPercentage ? pkg.price / (1 - pkg.discountPercentage / 100) : null);

                  return (
                    <div
                      key={`list-${pkg.id || 'pkg'}-${index}`}
                      onClick={() => onSelect(pkg)}
                      className={`flex items-center justify-between p-2.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#091d4a] to-[#040e26] border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.25)] scale-[1.01]'
                          : 'bg-surface-container-low border-cyan-500/10 hover:border-cyan-400/40 hover:bg-[#071536]'
                      }`}
                    >
                      {/* Left Side: Icon Container */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 overflow-hidden">
                        <div className="w-12 h-14 sm:w-16 h-16 shrink-0 bg-[#030917] rounded-xl flex items-center justify-center border border-cyan-500/15 relative overflow-hidden shadow-inner">
                          <div className="absolute inset-0 bg-cyan-500/5 blur-md"></div>
                          <PackageIcon pkg={pkg} gameCurrency={gameCurrency} size={40} className="relative z-10" />
                        </div>

                        {/* Middle Side: Title, Subtitle, and Badges */}
                        <div className="overflow-hidden flex flex-col justify-center">
                          {pkg.title ? (
                            <h4 className="text-white font-extrabold text-[11px] sm:text-sm leading-snug line-clamp-1 pr-2">
                              {pkg.title}
                            </h4>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-white font-black text-xs sm:text-lg tracking-tight">
                                {pkg.amount}
                              </span>
                              <span className="text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                {pkg.currency || gameCurrency}
                              </span>
                            </div>
                          )}

                          {/* Badges Container */}
                          <div className="flex flex-wrap gap-1.5 mt-0.5 sm:mt-1.5 items-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowInfoModal(pkg);
                              }}
                              className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-gray-400 hover:text-cyan-400 font-bold pr-1"
                              title="Ver detalles"
                            >
                              <Info size={10} /> Detalles
                            </button>

                            {pkg.bonus ? (
                              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                +{pkg.bonus} Extra
                              </span>
                            ) : null}
                            {pkg.discountPercentage ? (
                              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[7px] sm:text-[8px] font-black px-1 py-0.2 rounded uppercase">
                                -{pkg.discountPercentage}%
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Stacked Prices and Checkmark */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-right">
                        <div className="flex flex-col justify-center">
                          {originalPrice && (
                            <span className="text-[9px] sm:text-[10px] text-gray-500 line-through font-semibold">
                              {exchangeRate > 1 ? formatBs(originalPrice) : formatUSD(originalPrice)}
                            </span>
                          )}
                          <span className="font-black text-xs sm:text-base text-cyan-300">
                            {exchangeRate > 1 ? formatBs(currentPrice) : formatUSD(currentPrice)}
                          </span>
                          {exchangeRate > 1 && (
                            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">
                              {formatUSD(currentPrice)}
                            </span>
                          )}
                        </div>

                        {/* Selection Indicator Checkmark */}
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border transition-all duration-200 ${
                          isSelected
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(0,210,255,0.4)]'
                            : 'border-cyan-500/20 bg-[#030917]'
                        }`}>
                          {isSelected && <CheckCircle2 size={11} className="fill-cyan-400 text-slate-950" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Information Accordion (Información del Producto) */}
      <div className="mt-6 rounded-2xl bg-surface-container-low border border-cyan-500/20 overflow-hidden relative z-10">
        <button
          onClick={() => setIsProductInfoOpen(!isProductInfoOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-container/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Info size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">
                Información del <span className="text-cyan-400">Producto</span>
              </h4>
              <p className="text-xs text-on-surface-variant">Toca para ver detalles</p>
            </div>
          </div>
          <div className="text-cyan-400">
            {isProductInfoOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {isProductInfoOpen && (
          <div className="p-4 pt-2 border-t border-cyan-500/20 text-xs text-on-surface-variant space-y-3">
            <div className="flex items-start gap-2.5">
              <Zap size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-on-surface font-semibold">Entrega 100% Instantánea:</strong>
                <p className="text-on-surface-variant mt-0.5">Las recargas se procesan de manera inmediata una vez confirmado el pago.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-on-surface font-semibold">Garantía y Seguridad Oficial:</strong>
                <p className="text-on-surface-variant mt-0.5">Recargas realizadas a través de canales oficiales y autorizados con total seguridad.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <HelpCircle size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-on-surface font-semibold">Requisitos:</strong>
                <p className="text-on-surface-variant mt-0.5">Ingresa tu ID de jugador de {gameName} o correo para tarjetas de regalo en el paso anterior.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-cyan-500/40 rounded-2xl max-w-sm w-full p-6 text-center shadow-[0_0_30px_rgba(0,210,255,0.25)] relative animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center">
              <PackageIcon pkg={showInfoModal} gameCurrency={gameCurrency} size={54} />
            </div>
            <h3 className="text-on-surface font-black text-lg mb-1">
              {showInfoModal.title || `${showInfoModal.amount} ${showInfoModal.currency || gameCurrency}`}
            </h3>
            {showInfoModal.bonus ? (
              <p className="text-cyan-400 text-xs font-bold mb-3">
                Incluye +{showInfoModal.bonus} Extra de Bonificación
              </p>
            ) : null}

            <div className="bg-surface-container-low p-3.5 rounded-xl border border-cyan-500/20 mb-4 text-xs space-y-2 text-left text-on-surface-variant">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Precio en Bolívares (VES):</span>
                <span className="text-cyan-400 font-bold">
                  {formatBs(showInfoModal.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Precio en Dólares (USD):</span>
                <span className="text-on-surface font-bold">
                  {formatUSD(showInfoModal.price)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onSelect(showInfoModal);
                setShowInfoModal(null);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm transition-all shadow-[0_0_16px_rgba(0,210,255,0.4)] mb-2"
            >
              Seleccionar este Paquete
            </button>
            <button
              onClick={() => setShowInfoModal(null)}
              className="w-full py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

