import { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Github, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles,
  Layers,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  FolderArchive,
  ArrowRight,
  Activity,
  Eye,
  Settings
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { SiteSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  siteSettings?: SiteSettings | null;
  isAdmin?: boolean;
}

export default function DownloadAppModal({ isOpen, onClose, siteSettings, isAdmin = false }: Props) {
  // PWA hook
  const { isInstallable, isInstalled, triggerInstall } = usePwaInstall();

  // Navigation and admin view toggles
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa' | 'zip' | 'github'>('apk');
  const [adminViewAsUser, setAdminViewAsUser] = useState(false);

  // States
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedApkUrl, setCopiedApkUrl] = useState(false);
  const [repoUrlInput, setRepoUrlInput] = useState(siteSettings?.githubRepoUrl || 'https://github.com/alex2323-droid/raidexs-app');
  const [tokenInput, setTokenInput] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [pushResult, setPushResult] = useState<{ 
    success: boolean; 
    message: string; 
    actionsUrl?: string;
    repoUrl?: string;
    workflowMissing?: boolean;
    details?: string;
    newFileUrl?: string;
  } | null>(null);

  // GitHub live release and action run tracking
  const [releaseAssetUrl, setReleaseAssetUrl] = useState<string | null>(null);
  const [isCheckingRelease, setIsCheckingRelease] = useState(false);
  const [latestWorkflowRun, setLatestWorkflowRun] = useState<{
    status: string;
    conclusion: string | null;
    html_url: string;
    name: string;
  } | null>(null);

  const effectiveRepoUrl = siteSettings?.githubRepoUrl || repoUrlInput.trim() || 'https://github.com/alex2323-droid/raidexs-app';
  const releasesUrl = `${effectiveRepoUrl.replace(/\/+$/, '')}/releases`;
  const defaultDirectApkUrl = `${releasesUrl}/download/v1.0.0/Raidexs-v1.0-debug.apk`;
  const finalApkUrl = siteSettings?.apkDownloadUrl || releaseAssetUrl || defaultDirectApkUrl;
  const actionsUrl = `${effectiveRepoUrl.replace(/\/+$/, '')}/actions`;
  const editWorkflowUrl = `${effectiveRepoUrl.replace(/\/+$/, '')}/edit/main/.github/workflows/build-apk.yml`;

  // Always fetch GitHub status unconditionally
  useEffect(() => {
    if (!isOpen) return;
    const match = effectiveRepoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return;
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    setIsCheckingRelease(true);
    fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].assets)) {
          const apk = data[0].assets.find((a: any) => a.name && a.name.endsWith('.apk'));
          if (apk && apk.browser_download_url) {
            setReleaseAssetUrl(apk.browser_download_url);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsCheckingRelease(false));

    fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.workflow_runs) && data.workflow_runs.length > 0) {
          const run = data.workflow_runs[0];
          setLatestWorkflowRun({
            status: run.status,
            conclusion: run.conclusion,
            html_url: run.html_url,
            name: run.name || 'Build Android APK'
          });
        }
      })
      .catch(() => {});
  }, [isOpen, effectiveRepoUrl]);

  const gitCommands = `# En tu consola o terminal (o en Codespaces de GitHub):
git remote add origin ${effectiveRepoUrl}.git
git branch -M main
git push -u origin main`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleCopyApkUrl = () => {
    const urlToCopy = finalApkUrl || releasesUrl;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedApkUrl(true);
    setTimeout(() => setCopiedApkUrl(false), 2500);
  };

  const handleCopyWorkflowYaml = async () => {
    try {
      const res = await fetch('/api/github-workflow-content');
      const data = await res.json();
      if (data.content) {
        navigator.clipboard.writeText(data.content);
        setCopiedWorkflow(true);
        setTimeout(() => setCopiedWorkflow(false), 3000);
      }
    } catch {
      setPushResult({
        success: false,
        message: 'No se pudo copiar el archivo automáticamente. Puedes crearlo manualmente en GitHub.'
      });
    }
  };

  const handleAutoPush = async () => {
    if (!repoUrlInput.trim() || repoUrlInput.trim() === 'https://github.com/alex2323-droid/') {
      setPushResult({
        success: false,
        message: 'Por favor escribe la URL completa de tu repositorio (ejemplo: https://github.com/alex2323-droid/raidexs-app)'
      });
      return;
    }
    if (!tokenInput.trim()) {
      setPushResult({
        success: false,
        message: 'Por favor ingresa tu GitHub Personal Access Token con permisos de "repo" y "workflow".'
      });
      return;
    }

    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/push-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: repoUrlInput.trim(),
          token: tokenInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPushResult({
          success: true,
          message: data.message,
          actionsUrl: data.actionsUrl,
          repoUrl: data.repoUrl,
          workflowMissing: data.workflowMissing,
          details: data.details,
          newFileUrl: data.newFileUrl,
        });
      } else {
        setPushResult({
          success: false,
          message: data.error || 'No se pudo subir a GitHub. Revisa la URL y el Token.',
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: 'Error de conexión: ' + (err.message || 'Intenta de nuevo'),
      });
    } finally {
      setIsPushing(false);
    }
  };

  // Safe early exit AFTER all hooks are called
  if (!isOpen) return null;

  // Determine whether to display the regular user view or the admin suite
  const showUserView = !isAdmin || adminViewAsUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#0b1528] border border-cyan-500/30 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/15 via-blue-500/5 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#071120] rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {showUserView ? 'Descargar App Oficial (APK)' : 'Descargar App & Centro de Despliegue'}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {showUserView ? 'OFICIAL' : 'ADMIN'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {showUserView 
                  ? 'Instala la aplicación oficial de Raidexs para Android' 
                  : 'Gestión de APK, PWA, ZIP y Sincronización GitHub'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Admin toggle to preview user view */}
            {isAdmin && (
              <button
                onClick={() => setAdminViewAsUser(!adminViewAsUser)}
                title={adminViewAsUser ? "Volver a vista de Administrador" : "Probar vista de Usuario normal"}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {adminViewAsUser ? (
                  <>
                    <Settings size={13} className="text-amber-400" />
                    <span className="hidden sm:inline">Ver como Admin</span>
                  </>
                ) : (
                  <>
                    <Eye size={13} className="text-cyan-400" />
                    <span className="hidden sm:inline">Ver como Usuario</span>
                  </>
                )}
              </button>
            )}

            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Admin Tabs - ONLY visible when isAdmin is true and not simulating user view */}
        {isAdmin && !adminViewAsUser && (
          <div className="flex border-b border-white/10 bg-[#070e1c] p-1.5 gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('apk')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'apk'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone size={14} />
              <span>Descargar APK</span>
            </button>
            <button
              onClick={() => setActiveTab('pwa')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'pwa'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={14} />
              <span>Instalar PWA (1 Clic)</span>
            </button>
            <button
              onClick={() => setActiveTab('zip')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'zip'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderArchive size={14} />
              <span>Descargar ZIP</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'github'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Github size={14} />
              <span>Sincronizar GitHub</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar text-sm">
          {/* ========================================================= */}
          {/* VISTA PARA USUARIOS NORMALES: SIMPLE, DIRECTO A GITHUB   */}
          {/* ========================================================= */}
          {showUserView ? (
            <div className="space-y-4 animate-fade-in">
              {/* Tarjeta Hero de Descarga */}
              <div className="bg-gradient-to-br from-[#0e2447] via-[#091830] to-[#050f20] p-5 sm:p-6 rounded-2xl border border-cyan-500/40 shadow-xl space-y-4 relative overflow-hidden text-center sm:text-left">
                <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 p-0.5 shadow-xl shadow-cyan-500/25 shrink-0 flex items-center justify-center">
                    <div className="w-full h-full bg-[#071120] rounded-[14px] flex items-center justify-center">
                      <Smartphone className="w-9 h-9 text-emerald-400" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-lg font-black text-white">Raidexs Móvil Oficial</h4>
                      <span className="text-[10px] bg-emerald-400 text-black px-2 py-0.5 rounded font-black tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={11} /> ANDROID (.APK)
                      </span>
                    </div>
                    <p className="text-xs text-cyan-300 font-medium">
                      Compatible con Android 7.0 o superior • Recargas con entrega inmediata
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed pt-1">
                      Descarga el archivo instalador oficial directamente desde nuestro repositorio en GitHub con total seguridad.
                    </p>
                  </div>
                </div>

                {/* BOTÓN PRINCIPAL: DESCARGAR APK EN GITHUB */}
                <div className="pt-2 space-y-2 relative z-10">
                  <a
                    href={finalApkUrl || releasesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm sm:text-base group"
                  >
                    <Download size={22} className="stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
                    <span className="tracking-wide uppercase">DESCARGAR APK EN GITHUB</span>
                    <ExternalLink size={17} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyApkUrl}
                      className="text-xs text-cyan-300 hover:text-white flex items-center gap-1.5 py-1 px-3 rounded-lg bg-black/40 hover:bg-black/60 border border-cyan-500/20 transition-colors cursor-pointer"
                    >
                      {copiedApkUrl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedApkUrl ? '¡Enlace Copiado!' : 'Copiar enlace directo'}</span>
                    </button>
                    <span className="text-[11px] text-gray-400">•</span>
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck size={13} /> 100% Libre de Virus
                    </span>
                  </div>
                </div>
              </div>

              {/* Guía Sencilla Paso a Paso */}
              <div className="bg-[#071120] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
                <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2 uppercase tracking-wide">
                  <ShieldCheck size={18} className="text-cyan-400" />
                  ¿Cómo instalarlo en tu teléfono? (Solo 3 pasos)
                </h5>

                <div className="space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                      1
                    </span>
                    <div>
                      <strong className="text-white block font-bold mb-0.5">Toca el botón verde "Descargar APK en GitHub"</strong>
                      Se abrirá automáticamente la página oficial del proyecto en GitHub.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                      2
                    </span>
                    <div>
                      <strong className="text-white block font-bold mb-0.5">Toca el archivo .apk</strong>
                      En la página de GitHub, baja a la sección de archivos (Assets) y pulsa sobre <code className="text-cyan-300 bg-black/80 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">Raidexs-v1.0-debug.apk</code> para que comience la descarga.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
                      3
                    </span>
                    <div>
                      <strong className="text-white block font-bold mb-0.5">Abre el archivo e Instala</strong>
                      Al finalizar la descarga, abre el archivo en tu teléfono y selecciona <strong>"Instalar"</strong>. Si Android te solicita permiso, activa <em>"Permitir desde esta fuente"</em>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie de seguridad */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-3 px-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 size={14} /> Aplicación Oficial Verificada
                </span>
                <span>Entrega inmediata por ID de jugador</span>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* VISTA DE ADMINISTRADOR: HERRAMIENTAS COMPLETAS            */
            /* ========================================================= */
            <div className="space-y-4">
              {/* TAB 1: SUBIR A GITHUB (ADMIN) */}
              {activeTab === 'github' && (
                <div className="space-y-4">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-200">
                      <span className="font-bold text-white block mb-0.5">Sincronización Automática con GitHub (Solo Administrador)</span>
                      Sube todo el código, el proyecto Android Capacitor y el workflow CI/CD para que GitHub Actions compile el APK automáticamente.
                    </div>
                  </div>

                  {/* FORMULARIO AUTOMÁTICO CON TOKEN */}
                  <div className="bg-gradient-to-br from-[#0c1f3d] to-[#071326] p-4 rounded-xl border border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Sparkles size={16} className="text-cyan-400" />
                        Subir Automáticamente con Personal Access Token
                      </h4>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded">
                        Admin Tool
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        1. URL del repositorio en GitHub:
                      </label>
                      <input
                        type="text"
                        value={repoUrlInput}
                        onChange={(e) => setRepoUrlInput(e.target.value)}
                        placeholder="Ej: https://github.com/alex2323-droid/raidexs-app"
                        className="w-full bg-black/60 border border-cyan-500/40 rounded-lg py-2 px-3 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-300">
                          2. GitHub Personal Access Token (PAT):
                        </label>
                        <a
                          href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=Raidexs+Deploy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                        >
                          <span>Crear Token en GitHub</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <input
                        type="password"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-black/60 border border-cyan-500/40 rounded-lg py-2 px-3 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Asegúrate de marcar los permisos <strong className="text-white">"repo"</strong> y <strong className="text-cyan-400">"workflow"</strong>.
                      </p>
                    </div>

                    <button
                      onClick={handleAutoPush}
                      disabled={isPushing}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-black font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-[0.99] cursor-pointer text-xs"
                    >
                      {isPushing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Subiendo proyecto a GitHub...</span>
                        </>
                      ) : (
                        <>
                          <Github size={16} />
                          <span>Subir Proyecto a GitHub Ahora</span>
                        </>
                      )}
                    </button>

                    {pushResult && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          pushResult.success
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                            : 'bg-red-950/40 border-red-500/40 text-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {pushResult.success ? (
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <span className="font-bold block">{pushResult.message}</span>
                            {pushResult.details && <p className="text-gray-300 mt-1">{pushResult.details}</p>}
                          </div>
                        </div>

                        {pushResult.actionsUrl && (
                          <div className="pt-1 flex gap-2">
                            <a
                              href={pushResult.actionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-cyan-300 hover:text-white underline"
                            >
                              <span>Ver GitHub Actions en vivo</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* COMANDOS GIT MANUALES */}
                  <div className="bg-[#071120] p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Comandos Git Manuales:</span>
                      <button
                        onClick={handleCopyCommands}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCmd ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedCmd ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <pre className="bg-black/70 p-3 rounded-lg text-cyan-300 font-mono text-[11px] overflow-x-auto border border-cyan-500/20">
                      {gitCommands}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 2: PWA INSTALLER (ADMIN) */}
              {activeTab === 'pwa' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#0c1f3d] via-[#091830] to-[#050f20] p-5 rounded-2xl border border-cyan-500/40 shadow-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-black" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">Instalador PWA (WebAPK)</h4>
                        <p className="text-xs text-cyan-300/80 font-medium mt-0.5">
                          Prueba la versión instalable web en Android, iOS o Computadora
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={triggerInstall}
                        disabled={isInstalled}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-black font-black flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer text-sm"
                      >
                        <Sparkles size={20} className="stroke-[2.5]" />
                        <span>{isInstalled ? 'APP YA INSTALADA' : 'INSTALAR PWA EN ESTE DISPOSITIVO'}</span>
                      </button>
                    </div>

                    <div className="bg-[#071120] p-3.5 rounded-xl border border-white/10 text-xs text-gray-300 space-y-1.5">
                      <span className="font-bold text-white block">Nota de Administrador:</span>
                      <p>
                        Esta opción está oculta para los usuarios normales tal como solicitaste, para que ellos solo vean la descarga del archivo APK oficial.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DESCARGAR ZIP COMPLETO (ADMIN) */}
              {activeTab === 'zip' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#0c1f3d] via-[#091830] to-[#050f20] p-5 rounded-2xl border border-cyan-500/40 shadow-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
                        <FolderArchive className="w-7 h-7 text-black" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">Código Fuente Completo (.ZIP)</h4>
                        <p className="text-xs text-cyan-300/80 font-medium mt-0.5">
                          Frontend React, Servidor Node.js, Capacitor Android y Workflows
                        </p>
                      </div>
                    </div>

                    <a
                      href="/api/download-project-zip"
                      download="raidexs-proyecto-completo.zip"
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-black font-black flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer text-sm"
                    >
                      <Download size={20} className="stroke-[2.5]" />
                      <span>DESCARGAR CÓDIGO COMPLETO (.ZIP)</span>
                    </a>

                    <p className="text-xs text-gray-400 text-center">
                      Exclusivo para el administrador: Permite abrir el proyecto localmente en Android Studio.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: APK ANDROID CON DIAGNÓSTICOS PARA ADMIN */}
              {activeTab === 'apk' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#0c1f3d] via-[#091830] to-[#050f20] p-5 rounded-2xl border border-cyan-500/40 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
                          <Smartphone className="w-7 h-7 text-black" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-white">APK Android (Panel Admin)</h4>
                            {releaseAssetUrl ? (
                              <span className="text-[10px] bg-emerald-400 text-black px-2 py-0.5 rounded font-black flex items-center gap-1">
                                <CheckCircle2 size={11} /> APK LISTO
                              </span>
                            ) : latestWorkflowRun?.status === 'in_progress' ? (
                              <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded font-black flex items-center gap-1 animate-pulse">
                                <Loader2 size={11} className="animate-spin" /> COMPILANDO EN GITHUB
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-black flex items-center gap-1">
                                <AlertCircle size={11} /> EN RELEASES
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-cyan-300/80 font-medium mt-0.5">
                            Destino de descarga de usuarios: <span className="text-white font-mono">{finalApkUrl || releasesUrl}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botón Principal para descargar o probar */}
                    <div className="space-y-2 pt-1">
                      <a
                        href={finalApkUrl || releasesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-black flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer text-sm"
                      >
                        <Download size={20} className="stroke-[2.5]" />
                        <span>ABRIR ENLACE DE DESCARGA EN GITHUB</span>
                      </a>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={releasesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-colors cursor-pointer"
                        >
                          <Github size={14} className="text-cyan-400" />
                          <span>Ver Releases</span>
                          <ExternalLink size={12} />
                        </a>
                        <a
                          href={actionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-colors cursor-pointer"
                        >
                          <Layers size={14} className="text-blue-400" />
                          <span>Ver Actions</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Estado en vivo de GitHub Actions para el admin */}
                    {latestWorkflowRun && (
                      <div className="bg-black/50 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Activity size={14} className={latestWorkflowRun.status === 'in_progress' ? 'text-amber-400 animate-pulse' : latestWorkflowRun.conclusion === 'failure' ? 'text-red-400' : 'text-cyan-400'} />
                          <span>
                            GitHub Actions:{' '}
                            <strong className="text-white">
                              {latestWorkflowRun.status === 'in_progress' 
                                ? 'Compilando APK en GitHub (~2 min)...' 
                                : latestWorkflowRun.conclusion === 'success' 
                                  ? 'Compilación Exitosa' 
                                  : 'Último estado: ' + (latestWorkflowRun.conclusion || latestWorkflowRun.status)}
                            </strong>
                          </span>
                        </div>
                        <a
                          href={latestWorkflowRun.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold"
                        >
                          <span>Consola</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}

                    {/* Herramientas de corrección de workflow para el admin */}
                    <div className="bg-[#071120] p-3.5 rounded-xl border border-white/10 space-y-2 text-xs">
                      <span className="font-bold text-white block">Herramientas de Workflow CI/CD (.github/workflows/build-apk.yml):</span>
                      <div className="flex gap-2">
                        <a
                          href={editWorkflowUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold flex items-center justify-center gap-1.5 border border-white/20 text-xs transition-colors"
                        >
                          <ExternalLink size={13} className="text-cyan-400" />
                          <span>Editar en GitHub</span>
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyWorkflowYaml}
                          className="flex-1 py-2 px-3 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 font-bold flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
                        >
                          {copiedWorkflow ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          <span>{copiedWorkflow ? '¡Copiado!' : 'Copiar YAML'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#070e1c] flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" /> 100% Oficial y Seguro
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
