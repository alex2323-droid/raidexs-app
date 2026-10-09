import { MessageCircle, Mail, MapPin, ChevronDown, Sparkles, Bot } from "lucide-react";
import { useState } from "react";
import mascotSupportImg from "../assets/images/mascot_support_1782343607946.jpg";
import { SiteSettings } from "../types";
import { HermesAvatar } from "./HermesAgent";

interface Props {
  siteSettings?: SiteSettings | null;
  onOpenHermes?: () => void;
}

export default function Support({ siteSettings, onOpenHermes }: Props) {
  const faqs = [
    {
      q: "¿Cuánto tarda en reflejarse mi recarga?",
      a: "La mayoría de nuestras recargas son instantáneas. Sin embargo, en algunos métodos de pago como Zelle, puede tomar hasta 15 minutos en verificarse.",
    },
    {
      q: "¿Qué hacer si me equivoqué de ID de jugador?",
      a: "Comunícate inmediatamente con nuestro soporte a WhatsApp con tu número de orden. Si el saldo no ha sido procesado por el sistema automatizado, podremos cancelarlo.",
    },
    {
      q: "¿Qué métodos de pago aceptan?",
      a: "Aceptamos Pago Móvil, Zelle y tarjetas de crédito internacionales en un canal 100% seguro y encriptado.",
    },
    {
      q: "¿Cómo funciona el Bono Extra?",
      a: "Algunos paquetes incluyen un bono marcado con una etiqueta roja. Este monto extra se acreditará junto con tu recarga principal y sin costo adicional.",
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  const showMascot = siteSettings ? siteSettings.showMascotSupport : true;
  const currentMascotUrl = siteSettings?.mascotSupportUrl || mascotSupportImg;
  const rawPhone = siteSettings?.supportPhone || "+584142943532";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const formattedPhone = rawPhone.startsWith("+58") 
    ? `+58 ${rawPhone.slice(3, 6)}-${rawPhone.slice(6)}` 
    : rawPhone;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 w-full pb-24 md:pb-8 animation-fade-in">
      <div className="mb-8 flex flex-col md:flex-row items-center md:items-end gap-6 bg-surface/90 rounded-2xl p-6 border border-cyan-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none"></div>
        {showMascot && (
          <img
            src={currentMascotUrl}
            alt="Soporte Shark Mascot"
            className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-surface shadow-xl z-10"
          />
        )}
        <div className="z-10 text-center md:text-left">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
            Centro de <span className="text-cyan-400">Soporte</span>
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            Estamos aquí para ayudarte. Contáctanos a través de nuestros canales
            oficiales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Hermes Agent AI Channel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center gap-4 border border-cyan-500/40 bg-gradient-to-b from-[#030d24] to-[#04153d] shadow-[0_0_25px_rgba(0,210,255,0.15)] hover:border-cyan-400 transition-all group">
          <div className="relative">
            <HermesAvatar size="lg" glow={true} />
            <span className="absolute -top-1 -right-1 bg-cyan-500 text-[#030919] font-black text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              IA 24/7
            </span>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="font-display text-lg font-bold text-on-surface">
                Hermes Agent (IA Virtual)
              </h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-4 mt-2">
              Asistente gamer inteligente 24/7. Te guía en recargas paso a paso, verifica métodos de pago (Pago Móvil, Binance, Zinli) y resuelve tus dudas al instante.
            </p>
            <button 
              onClick={() => {
                if (onOpenHermes) onOpenHermes();
                else window.dispatchEvent(new CustomEvent('open-hermes-agent'));
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2.5 px-6 rounded-xl w-full hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] cursor-pointer"
            >
              <Sparkles size={18} /> Chatear con Hermes Agent
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center gap-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,210,255,0.08)] hover:border-cyan-400/60 transition-colors">
          <div className="w-16 h-16 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shadow-[0_0_15px_rgba(37,211,102,0.2)]">
            <MessageCircle size={32} className="fill-current" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-on-surface">
              Atención Vía WhatsApp
            </h3>
            <p className="text-sm text-on-surface-variant mb-4 mt-2">
              Respuestas rápidas 24/7 a través de nuestro canal de WhatsApp para
              problemas urgentes y verificación de pagos.
            </p>
            <a 
              href={`https://wa.me/${cleanPhone}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#25D366] text-white font-black py-2.5 px-6 rounded-xl w-full hover:opacity-90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)]"
            >
              <MessageCircle size={18} /> {formattedPhone}
            </a>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between gap-4 border border-glass-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 border border-glass-border">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="font-display font-bold text-on-surface">
                Soporte por Correo
              </h4>
              <p className="text-sm font-medium text-on-surface-variant mt-1">
                nexplay2307@gmail.com
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 mt-2">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 border border-glass-border">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-display font-bold text-on-surface">
                Ubicación
              </h4>
              <p className="text-sm font-medium text-on-surface-variant mt-1">
                Caracas, Venezuela
                <br />
                Disponible mundialmente
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-on-surface mb-6">
          Preguntas Frecuentes
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={`faq-${index}-${faq.q.substring(0, 10)}`}
                className="glass-panel rounded-xl overflow-hidden border border-glass-border transition-colors cursor-pointer hover:border-primary/30"
                onClick={() => setOpenFaq(isOpen ? null : index)}
              >
                <div className="p-4 flex items-center justify-between gap-4 bg-surface-container-low">
                  <h4 className="font-display font-bold text-sm md:text-base text-on-surface">
                    {faq.q}
                  </h4>
                  <ChevronDown
                    className={`shrink-0 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    size={20}
                  />
                </div>
                <div
                  className={`px-4 text-on-surface-variant font-medium text-sm transition-all duration-300 overflow-hidden ${isOpen ? "max-h-40 pb-4 pt-2 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
