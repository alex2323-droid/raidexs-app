import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  FileText,
  Lock,
  Cookie,
  RotateCcw,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Mail,
  ExternalLink,
  ChevronRight,
  Scale,
  Sparkles,
} from "lucide-react";

export type LegalTab = "notice" | "terms" | "privacy" | "cookies" | "refunds";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
  onOpenCookieSettings?: () => void;
}

export default function LegalModal({
  isOpen,
  onClose,
  initialTab = "terms",
  onOpenCookieSettings,
}: Props) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#040e22] border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(0,210,255,0.25)] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-900/60 bg-[#030a1b]/95 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_12px_rgba(0,210,255,0.25)]">
              <Scale size={20} />
            </div>
            <div>
              <h2
                id="legal-modal-title"
                className="text-lg sm:text-xl font-bold font-display text-white"
              >
                Información Legal y Términos de Servicio
              </h2>
              <p className="text-xs text-slate-400">
                Raidexs • Compromiso de transparencia, seguridad y privacidad
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-slate-700 transition cursor-pointer"
            aria-label="Cerrar ventana legal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#020712] border-b border-cyan-900/40 px-3 py-2 gap-1 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "terms"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <FileText size={15} />
            <span>Términos y Condiciones</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "privacy"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Lock size={15} />
            <span>Política de Privacidad</span>
          </button>

          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "refunds"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <RotateCcw size={15} />
            <span>Política de Reembolsos</span>
          </button>

          <button
            onClick={() => setActiveTab("cookies")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "cookies"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Cookie size={15} />
            <span>Política de Cookies</span>
          </button>

          <button
            onClick={() => setActiveTab("notice")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "notice"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Building2 size={15} />
            <span>Aviso Legal & Marcas</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 text-sm text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
          {/* TAB 1: TÉRMINOS Y CONDICIONES */}
          {activeTab === "terms" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 flex items-start gap-3">
                <Shield size={20} className="shrink-0 mt-0.5 text-cyan-400" />
                <p className="text-xs sm:text-sm">
                  Al utilizar la plataforma <strong>Raidexs</strong> o realizar una orden de recarga digital, aceptas plenamente los presentes Términos y Condiciones. Te invitamos a leerlos con atención antes de efectuar cualquier pago.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
                  Naturaleza del Servicio
                </h3>
                <p>
                  <strong>Raidexs</strong> es una plataforma de servicios digitales e intermediación comercial dedicada a la provisión y recarga de monedas virtuales para videojuegos (ej. Diamantes, UC, Gold, Pases de Batalla), tarjetas de regalo electrónicas (Gift Cards) y suscripciones digitales. Las recargas se ejecutan mediante canales oficiales autorizados y sistemas de distribución electrónica reconocidos.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">2</span>
                  Responsabilidad sobre el Player ID y Datos de Entrega
                </h3>
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs sm:text-sm space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle size={16} /> Importante: Responsabilidad del Usuario
                  </p>
                  <p>
                    Es responsabilidad exclusiva del cliente verificar y proporcionar con total exactitud su identificador de jugador (Player ID, Server ID o correo asociado) en el formulario de compra. Las recargas enviadas a un Player ID suministrado erróneamente por el cliente son aplicadas de forma inmediata e irrevocable por los servidores del juego y <strong>no pueden ser revertidas técnicamente</strong> ni reembolsadas una vez consumidas por la plataforma de destino.
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
                  Métodos de Pago y Validación Antifraude
                </h3>
                <p>
                  Raidexs admite pagos mediante criptomonedas (Binance Pay / USDT), Pago Móvil en Bolívares conforme a tasas de referencia oficiales y transferencias bancarias directas. Para proteger a la comunidad frente a transacciones no autorizadas o suplantación, el sistema puede solicitar comprobantes verificables (número de referencia, hash de transacción o captura bancaria). Nos reservamos el derecho de cancelar cualquier pedido que presente indicios razonables de fraude.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">4</span>
                  Tiempos de Entrega
                </h3>
                <p>
                  El tiempo estándar de entrega oscila entre <strong>1 y 15 minutos</strong> una vez confirmado y conciliado el pago en nuestro sistema en horario operativo. En casos excepcionales debidos a mantenimiento oficial de los servidores de un videojuego o saturación de red bancaria, el procesamiento puede demorar hasta un máximo de 24 horas, manteniéndote informado a través de soporte.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">5</span>
                  Conducta del Usuario y Prohibición de Uso Indebido
                </h3>
                <p>
                  Queda estrictamente prohibido intentar vulnerar la seguridad de la plataforma, utilizar métodos de pago obtenidos ilícitamente, ejecutar ataques de denegación de servicio o intentar alterar precios y paquetes. El incumplimiento causará el bloqueo permanente de la cuenta y las acciones legales pertinentes.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: POLÍTICA DE PRIVACIDAD */}
          {activeTab === "privacy" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 flex items-start gap-3">
                <Lock size={20} className="shrink-0 mt-0.5 text-cyan-400" />
                <p className="text-xs sm:text-sm">
                  En <strong>Raidexs</strong> aplicamos el principio de <em>Privacidad por Diseño</em> y <em>Minimización de Datos</em> conforme al Reglamento General de Protección de Datos (RGPD) y leyes aplicables de protección al consumidor digital.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  Solo los Datos Estrictamente Necesarios
                </h3>
                <p>
                  Recopilamos única y exclusivamente la información indispensable para procesar y entregar tu recarga digital:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><strong>Correo Electrónico:</strong> Para autenticar tu cuenta, enviar el comprobante de compra y las actualizaciones de estado de tus pedidos.</li>
                  <li><strong>Player ID / Identificador de Juego:</strong> Para acreditar los diamantes, monedas o saldo en el servidor del videojuego seleccionado.</li>
                  <li><strong>Referencia de Pago:</strong> Para conciliar la transferencia bancaria o transacción de Binance.</li>
                </ul>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs sm:text-sm mt-2">
                  <strong>🔒 Garantía de Seguridad:</strong> Raidexs <strong>NUNCA</strong> te solicitará la contraseña de tu cuenta de Google, correo o juego, ni almacenamos números de tarjeta de crédito (PAN/CVV) en nuestros servidores.
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  Finalidad y Base Legal del Tratamiento
                </h3>
                <p>
                  Tus datos son tratados bajo la base jurídica del consentimiento expreso y la ejecución del contrato de compraventa digital (gestión del pedido, emisión de recibos y atención de soporte posventa). No vendemos, transferimos ni alquilamos tus datos personales a empresas de publicidad ni a terceros con fines de prospección comercial.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  Almacenamiento Seguro y Protección SSL
                </h3>
                <p>
                  Todas las comunicaciones entre tu navegador y nuestra plataforma se realizan bajo cifrado estricto <strong>HTTPS (SSL/TLS de 256 bits)</strong>. Las bases de datos en la nube de Google Cloud Firestore implementan reglas de control de acceso a nivel de fila (Row-Level Security), garantizando que solo tú y los operadores autorizados puedan visualizar tus pedidos.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  Tus Derechos (Acceso, Rectificación y Supresión)
                </h3>
                <p>
                  Tienes derecho en cualquier momento a solicitar una copia de los datos que conservamos sobre ti, solicitar la rectificación de datos inexactos o la eliminación definitiva de tu cuenta y registros asociados enviando una solicitud a nuestro correo oficial de privacidad:{" "}
                  <a
                    href="mailto:nexplay2307@gmail.com"
                    className="text-cyan-400 font-bold hover:underline"
                  >
                    nexplay2307@gmail.com
                  </a>.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: POLÍTICA DE REEMBOLSOS */}
          {activeTab === "refunds" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 flex items-start gap-3">
                <RotateCcw size={20} className="shrink-0 mt-0.5 text-cyan-400" />
                <p className="text-xs sm:text-sm">
                  Transparencia ante todo: te explicamos de manera clara cuándo procede un reembolso y cuándo no, de acuerdo con la naturaleza de los productos virtuales y consumibles.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  Casos en los que SÍ aplica Reembolso
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li>
                    <strong>Orden en estado Pendiente:</strong> Si solicitas la cancelación antes de que el equipo o el servidor externo haya procesado y enviado la recarga al juego.
                  </li>
                  <li>
                    <strong>Falla técnica comprobada:</strong> Si por una interrupción técnica de nuestro proveedor oficial o indisponibilidad del servicio resulta imposible acreditar el paquete adquirido en un plazo de 24 horas hábiles.
                  </li>
                  <li>
                    <strong>Cobro Duplicado:</strong> Si por un error bancario comprobable se debitó dos veces el importe de una misma orden.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  Casos en los que NO aplica Reembolso
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li>
                    <strong>Orden Completada con Éxito:</strong> Una vez que los diamantes, monedas o pases han sido depositados en el Player ID indicado, el bien digital queda consumido en los servidores de juego y no puede ser devuelto ni revocado por nosotros.
                  </li>
                  <li>
                    <strong>Error de Player ID cometido por el usuario:</strong> Si introdujiste un ID equivocado que pertenece a otra cuenta activa y los servidores del juego acreditaron los recursos en dicha cuenta.
                  </li>
                  <li>
                    <strong>Códigos de Gift Cards revelados o canjeados:</strong> Las tarjetas de regalo con código digital no admiten devolución una vez entregado o visualizado el código.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">¿Cómo solicitar una revisión o reembolso?</h3>
                <p>
                  Comunícate de inmediato con nuestro canal de soporte por WhatsApp o al correo{" "}
                  <span className="text-cyan-400 font-mono">nexplay2307@gmail.com</span> indicando tu número de orden (ej. ORD-123456) y el comprobante de pago. Atendemos todas las solicitudes en un plazo máximo de 24 horas.
                </p>
              </section>
            </div>
          )}

          {/* TAB 4: POLÍTICA DE COOKIES */}
          {activeTab === "cookies" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 flex items-start gap-3">
                <Cookie size={20} className="shrink-0 mt-0.5 text-cyan-400" />
                <p className="text-xs sm:text-sm">
                  Utilizamos cookies y almacenamiento local exclusivamente para garantizar la seguridad, mantener tu sesión activa y mejorar tu experiencia de compra en <strong>Raidexs</strong>.
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">Tipos de Cookies que empleamos</h3>

                <div className="p-3.5 bg-[#030a1b] border border-cyan-500/20 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">1. Cookies Técnicas y Esenciales (Obligatorias)</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Siempre Activas</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Necesarias para la autenticación segura con Firebase Auth, el carrito de recarga, la prevención de ataques CSRF y la navegación fluida. Sin ellas la plataforma no puede funcionar.
                  </p>
                </div>

                <div className="p-3.5 bg-[#030a1b] border border-cyan-500/20 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">2. Cookies de Preferencias</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Opcionales</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Permiten recordar tu elección de recordar correo para inicio rápido de sesión y tus preferencias visuales.
                  </p>
                </div>

                <div className="p-3.5 bg-[#030a1b] border border-cyan-500/20 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">3. Cookies Analíticas y Rendimiento</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Opcionales</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Métricas de uso anónimas para evaluar tiempos de respuesta de servidores y prevenir errores de carga. No rastrean tu navegación externa.
                  </p>
                </div>
              </section>

              {onOpenCookieSettings && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCookieSettings();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Cookie size={16} />
                    <span>Configurar Mis Preferencias de Cookies</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AVISO LEGAL & MARCAS */}
          {activeTab === "notice" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 flex items-start gap-3">
                <Building2 size={20} className="shrink-0 mt-0.5 text-cyan-400" />
                <p className="text-xs sm:text-sm">
                  Cumplimiento del deber de información comercial, identificación del responsable de la plataforma y descargo de marcas registradas.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">Identificación del Titular</h3>
                <div className="p-4 bg-[#030a1b] border border-cyan-500/20 rounded-xl text-xs sm:text-sm space-y-1.5">
                  <p><strong>Denominación de la Plataforma:</strong> Raidexs – Tienda Digital de Recargas & Gift Cards</p>
                  <p><strong>Titular Responsable:</strong> Raidexs Servicios Digitales / Alex Parababi</p>
                  <p><strong>Correo Electrónico de Contacto:</strong> <a href="mailto:nexplay2307@gmail.com" className="text-cyan-400 hover:underline">nexplay2307@gmail.com</a></p>
                  <p><strong>Atención al Cliente:</strong> Soporte vía WhatsApp 24/7 disponible directamente en la plataforma.</p>
                  <p><strong>Finalidad del Sitio:</strong> Comercialización e intermediación de créditos virtuales, membresías y tarjetas de regalo digitales de entretenimiento interactivo.</p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale size={18} className="text-cyan-400" />
                  Descargo de Marcas y Propiedad Intelectual de Terceros
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Todos los nombres de videojuegos, logotipos, carátulas, marcas comerciales y activos registrados mencionados en este sitio web (incluidos, sin limitación, <em>Free Fire® de Garena, Mobile Legends: Bang Bang® de Moonton, PUBG Mobile® de Tencent Games/Krafton, Roblox® de Roblox Corporation, Brawl Stars® de Supercell, Valorant® de Riot Games, Call of Duty: Mobile® de Activision</em>, entre otros) son propiedad exclusiva de sus respectivos desarrolladores, distribuidores y titulares de derechos de autor.
                </p>
                <p className="text-xs sm:text-sm leading-relaxed">
                  <strong>Raidexs</strong> actúa como proveedor de servicios de intermediación y distribución digital independiente. La mención de dichas marcas tiene un propósito meramente informativo para identificar los servicios compatibles con cada videojuego, sin que ello implique patrocinio, aprobación directa o asociación exclusiva por parte de los propietarios de tales marcas comerciales.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">Propiedad Intelectual del Software</h3>
                <p className="text-xs sm:text-sm">
                  El diseño visual, código fuente, logotipos y elementos distintivos de la marca <strong>Raidexs</strong> están protegidos por las leyes de propiedad intelectual correspondientes. Queda prohibida su reproducción o explotación no autorizada.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-cyan-900/60 bg-[#030a1b]/95 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            Última actualización: {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(0,210,255,0.4)] transition cursor-pointer"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
