import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { Game } from "../types";

export interface ChatMessage {
  id: string;
  sender: "user" | "hermes";
  text: string;
  timestamp: number;
  suggestions?: string[];
  action?: {
    type: "select_game" | "open_whatsapp" | "open_legal";
    target?: string;
    label?: string;
  };
}

interface Props {
  games?: Game[];
  onSelectGame?: (game: Game) => void;
  onOpenLegal?: (tab?: any) => void;
  supportPhone?: string;
  exchangeRate?: number;
}

// Hermes Avatar component with divine cyber wings
export const HermesAvatar: React.FC<{ size?: "sm" | "md" | "lg"; glow?: boolean }> = ({
  size = "md",
  glow = true,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28,
  };

  return (
    <div
      className={`relative rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#051336] via-[#09265e] to-[#00d2ff] p-0.5 ${
        glow ? "shadow-[0_0_20px_rgba(0,210,255,0.45)]" : ""
      } ${sizeClasses[size]}`}
    >
      <div className="w-full h-full bg-[#030919] rounded-[14px] flex items-center justify-center relative overflow-hidden">
        {/* Neon aura inside */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-amber-500/10 pointer-events-none" />
        
        {/* Hermes Winged Helmet Custom Vector */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cyan-400 relative z-10 filter drop-shadow-[0_0_6px_rgba(0,210,255,0.8)]"
          style={{ width: iconSizes[size], height: iconSizes[size] }}
        >
          {/* Wing Left */}
          <path d="M4 14C2 11 2 7 5 5C7 3 10 4 10 6C8 7 6 9 6 12C6 13 5 14 4 14Z" fill="#00d2ff" fillOpacity="0.25" />
          {/* Wing Right */}
          <path d="M20 14C22 11 22 7 19 5C17 3 14 4 14 6C16 7 18 9 18 12C18 13 19 14 20 14Z" fill="#00d2ff" fillOpacity="0.25" />
          {/* Central Helmet / Visor */}
          <path d="M12 3L14 8H10L12 3Z" fill="#fbbf24" stroke="#fbbf24" />
          <path d="M8 9C8 6.5 9.8 5 12 5C14.2 5 16 6.5 16 9V14C16 16.5 14.2 19 12 19C9.8 19 8 16.5 8 14V9Z" />
          {/* Cyber Visor Slit */}
          <line x1="9.5" y1="12" x2="14.5" y2="12" stroke="#00d2ff" strokeWidth="2" />
          <circle cx="12" cy="12" r="1" fill="#fff" />
          {/* Chin strap/crest */}
          <path d="M10 19L12 21L14 19" />
        </svg>
      </div>

      {/* Online indicator dot */}
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#030919] rounded-full shadow-[0_0_8px_#34d399]" />
    </div>
  );
};

export default function HermesAgent({
  games = [],
  onSelectGame,
  onOpenLegal,
  supportPhone = "+584142943532",
  exchangeRate,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialWelcomeText =
    "¡Hola, gamer! ⚡ Soy **Hermes Agent**, el asistente virtual gamer e inteligente de **Raidexs**.\n\nEstoy aquí 24/7 para ayudarte a recargar tus juegos favoritos (Free Fire, Mobile Legends, Roblox y más), explicarte métodos de pago (Pago Móvil, Binance, Zinli) y responder cualquier duda.\n\n¿En qué te puedo asesorar hoy?";

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "msg_welcome",
        sender: "hermes",
        text: initialWelcomeText,
        timestamp: Date.now(),
        suggestions: [
          "⚡ ¿Cómo recargo paso a paso?",
          "💎 Precios de Free Fire",
          "💳 Métodos de pago aceptados",
          "⏱️ ¿Cuánto tardan las entregas?",
          "🛡️ ¿Es seguro? ¿Piden contraseña?",
        ],
      },
    ];
  });

  // Synthesize soft futuristic chime with Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Listen for global custom events to open Hermes Agent
  useEffect(() => {
    const handleOpenHermes = (event: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      setShowWelcomeTooltip(false);
      if (event?.detail?.prompt) {
        handleSendMessage(event.detail.prompt);
      } else {
        setTimeout(() => inputRef.current?.focus(), 250);
      }
    };

    window.addEventListener("open-hermes-agent", handleOpenHermes);
    return () => window.removeEventListener("open-hermes-agent", handleOpenHermes);
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      setShowWelcomeTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage("");

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Context for Hermes
    const chatHistory = messages.map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("model" as const),
      text: m.text,
    }));

    try {
      const response = await fetch("/api/hermes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: chatHistory,
          context: {
            exchangeRate,
            availableGames: games.map((g) => g.name).slice(0, 8),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || "⚡ En Raidexs estamos a tu servicio para cualquier recarga o consulta gamer.";

      // Detect smart action links
      let smartAction: ChatMessage["action"] = undefined;
      const lowerReply = replyText.toLowerCase();

      if (lowerReply.includes("free fire") && games.some((g) => g.id === "free_fire")) {
        smartAction = {
          type: "select_game",
          target: "free_fire",
          label: "🎮 Ir a recargar Free Fire",
        };
      } else if (lowerReply.includes("mobile legends") && games.some((g) => g.id === "mobile_legends")) {
        smartAction = {
          type: "select_game",
          target: "mobile_legends",
          label: "⚔️ Ir a recargar Mobile Legends",
        };
      } else if (lowerReply.includes("roblox") && games.some((g) => g.id === "roblox")) {
        smartAction = {
          type: "select_game",
          target: "roblox",
          label: "🧱 Ir a recargar Roblox",
        };
      } else if (lowerReply.includes("whatsapp") || lowerReply.includes("soporte humano")) {
        smartAction = {
          type: "open_whatsapp",
          label: "💬 Abrir WhatsApp Soporte Oficial",
        };
      }

      const hermesMessage: ChatMessage = {
        id: `msg_hermes_${Date.now()}`,
        sender: "hermes",
        text: replyText,
        timestamp: Date.now(),
        suggestions: data.suggestions && data.suggestions.length > 0 ? data.suggestions : undefined,
        action: smartAction,
      };

      setMessages((prev) => [...prev, hermesMessage]);
      playChime();

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (err: any) {
      console.error("Error communicating with Hermes Agent:", err);
      // Friendly in-app answer if fetch completely fails
      const fallbackMsg: ChatMessage = {
        id: `msg_hermes_err_${Date.now()}`,
        sender: "hermes",
        text:
          "⚡ En **Raidexs** tus recargas son 100% oficiales y seguras directo a tu ID de Jugador.\n\nPuedes pagar con **Pago Móvil** (a tasa BCV), **Binance Pay USDT** o **Zinli**.\n\n¿Deseas que te oriente en algún juego o paquete en específico?",
        timestamp: Date.now(),
        suggestions: ["⚡ ¿Cómo recargo?", "💳 Métodos de pago", "💎 Precios Free Fire"],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: "hermes",
        text: initialWelcomeText,
        timestamp: Date.now(),
        suggestions: [
          "⚡ ¿Cómo recargo paso a paso?",
          "💎 Precios de Free Fire",
          "💳 Métodos de pago aceptados",
          "⏱️ ¿Cuánto tardan las entregas?",
        ],
      },
    ]);
  };

  const handleActionClick = (action: ChatMessage["action"]) => {
    if (!action) return;
    if (action.type === "select_game" && action.target) {
      const foundGame = games.find((g) => g.id === action.target);
      if (foundGame && onSelectGame) {
        onSelectGame(foundGame);
        setIsMinimized(true);
      }
    } else if (action.type === "open_whatsapp") {
      const cleanPhone = supportPhone.replace(/[^0-9]/g, "");
      const msg = encodeURIComponent(
        "¡Hola! Vengo desde el chat de Hermes Agent en Raidexs y necesito asistencia con una recarga."
      );
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
    } else if (action.type === "open_legal" && onOpenLegal) {
      onOpenLegal(action.target || "terms");
    }
  };

  // Helper to format text with basic bolding and bullet highlights
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      // Process bold markers (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="text-cyan-300 font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
      const isNumbered = /^\d+\./.test(line.trim());

      return (
        <p
          key={idx}
          className={`${
            isBullet || isNumbered ? "pl-2 text-sm my-0.5" : "text-sm my-1"
          } leading-relaxed`}
        >
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating launcher trigger - Placed seamlessly beside WhatsApp button */}
      <div className="fixed bottom-24 md:bottom-8 right-20 md:right-28 z-40 flex items-center">
        {/* Welcome greeting pill for first visit */}
        {showWelcomeTooltip && !isOpen && (
          <div className="hidden sm:flex items-center gap-2 mr-3 bg-[#030a1b]/95 backdrop-blur-md text-white text-xs font-medium py-2 px-3.5 rounded-2xl border border-cyan-500/40 shadow-[0_4px_25px_rgba(0,210,255,0.25)] animate-fade-in group">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span>
              ¡Hola! Soy <strong className="text-cyan-400">Hermes</strong>, tu asistente virtual ⚡
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcomeTooltip(false);
              }}
              className="text-on-surface-variant hover:text-white ml-1 p-0.5 rounded-full"
              aria-label="Cerrar sugerencia"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* The Hermes Launcher Button */}
        <button
          onClick={() => {
            setIsOpen((prev) => !prev);
            setIsMinimized(false);
          }}
          aria-label="Abrir asistente virtual Hermes Agent"
          title="Hermes Agent - Asistente Virtual Raidexs"
          className="relative group p-1 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-400 shadow-[0_4px_25px_rgba(0,210,255,0.4)] hover:shadow-[0_6px_30px_rgba(0,210,255,0.65)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 bg-[#030919] rounded-full flex items-center justify-center relative overflow-hidden">
            <HermesAvatar size="md" glow={false} />
          </div>

          {/* Unread badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#030919] animate-bounce">
              {unreadCount}
            </span>
          )}

          {/* Floating label on hover */}
          <div className="absolute right-full mr-3 bg-[#030a1b] text-white text-xs font-bold py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-cyan-500/30 shadow-lg hidden md:block">
            Hermes Agent • Asistente IA
          </div>
        </button>
      </div>

      {/* Virtual Assistant Window Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col ${
            isMinimized
              ? "bottom-24 md:bottom-8 right-4 md:right-8 w-72 h-14 rounded-2xl shadow-2xl overflow-hidden bg-[#030a1b] border border-cyan-500/40"
              : "bottom-0 md:bottom-8 right-0 md:right-8 w-full md:w-[410px] h-[92vh] md:h-[600px] max-h-[95vh] rounded-t-3xl md:rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.85)] border-t md:border border-cyan-500/30 bg-[#030a1b]/95 backdrop-blur-xl overflow-hidden"
          }`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#030a1b] via-[#05163a] to-[#030a1b] p-3.5 border-b border-cyan-500/20 flex items-center justify-between select-none">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <HermesAvatar size="sm" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-white font-display text-sm font-bold tracking-wide flex items-center gap-1">
                    Hermes Agent
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    IA Raidexs
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En línea 24/7
                </p>
              </div>
            </div>

            {/* Window control buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled((prev) => !prev)}
                title={soundEnabled ? "Silenciar notificaciones" : "Activar sonido"}
                aria-label={soundEnabled ? "Silenciar notificaciones" : "Activar sonido"}
                className="p-1.5 text-on-surface-variant hover:text-cyan-400 hover:bg-surface-container rounded-lg transition-colors"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-rose-400" />}
              </button>

              {!isMinimized && (
                <button
                  onClick={handleClearHistory}
                  title="Reiniciar conversación"
                  aria-label="Reiniciar conversación"
                  className="p-1.5 text-on-surface-variant hover:text-amber-400 hover:bg-surface-container rounded-lg transition-colors"
                >
                  <RefreshCw size={15} />
                </button>
              )}

              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                title={isMinimized ? "Expandir" : "Minimizar"}
                aria-label={isMinimized ? "Expandir" : "Minimizar"}
                className="p-1.5 text-on-surface-variant hover:text-white hover:bg-surface-container rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar asistente"
                aria-label="Cerrar asistente"
                className="p-1.5 text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Content - Hidden if minimized */}
          {!isMinimized && (
            <>
              {/* Message scroll thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-cyan-500/20">
                {/* Intro banner */}
                <div className="bg-gradient-to-r from-cyan-950/40 via-[#07193b]/60 to-purple-950/30 p-3 rounded-2xl border border-cyan-500/20 text-center">
                  <p className="text-[11px] text-cyan-200/90 font-medium">
                    ⚡ <strong>Hermes Agent</strong> responde al instante sobre recargas, precios, métodos de pago y
                    seguridad en Raidexs.
                  </p>
                </div>

                {/* Message bubbles */}
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1.5`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%]">
                        {!isUser && (
                          <div className="flex-shrink-0 mb-1">
                            <HermesAvatar size="sm" glow={false} />
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-md ${
                            isUser
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none"
                              : "bg-[#071533]/90 text-on-surface border border-cyan-500/25 rounded-bl-none shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
                          }`}
                        >
                          {isUser ? (
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          ) : (
                            <div className="text-on-surface">{renderFormattedText(msg.text)}</div>
                          )}
                        </div>
                      </div>

                      {/* Smart Action Button if available */}
                      {msg.action && (
                        <div className="ml-10">
                          <button
                            onClick={() => handleActionClick(msg.action)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm active:scale-95 transition-all"
                          >
                            <span>{msg.action.label || "Ver detalles"}</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}

                      {/* Suggestion Chips */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="ml-10 flex flex-wrap gap-1.5 pt-1">
                          {msg.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(suggestion)}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-surface-container hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 text-on-surface-variant border border-glass-border transition-all active:scale-95 text-left cursor-pointer"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <span className="text-[10px] text-on-surface-variant/60 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <HermesAvatar size="sm" glow={false} />
                    <div className="bg-[#071533]/90 border border-cyan-500/30 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                      <span
                        className="w-2 h-2 rounded-full bg-cyan-300 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-cyan-200 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                      <span className="text-xs text-cyan-300 ml-1.5 font-medium">Hermes pensando...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-cyan-500/20 bg-[#020716]/95">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Pregúntale a Hermes... (ej. cómo recargar)"
                    disabled={isLoading}
                    className="flex-1 bg-surface-container text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-cyan-500/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-on-surface-variant/60"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    aria-label="Enviar mensaje a Hermes"
                    className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md active:scale-95 flex-shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </form>

                <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-on-surface-variant/70">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={11} className="text-cyan-400" />
                    Asistente Oficial Raidexs
                  </span>
                  <span>⚡ Presiona Enter para enviar</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
