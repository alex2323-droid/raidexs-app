import React, { useState, useEffect } from 'react';
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
  FileArchive,
  Terminal,
  Activity
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { SiteSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  siteSettings?: SiteSettings | null;
}

export default function DownloadAppModal({ isOpen, onClose, siteSettings }: Props) {
  const { isInstallable, isInstalled, triggerInstall } = usePwaInstall();
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa' | 'zip' | 'github'>('apk');
  const [copiedCmd, setCopiedCmd] = useState(false);
  
  // Repo and Token for direct automated push
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
  const defaultApkUrl = `${effectiveRepoUrl}/releases/download/v1.0.0/Raidexs-v1.0-debug.apk`;
  const finalApkUrl = siteSettings?.apkDownloadUrl || releaseAssetUrl || defaultApkUrl;
  const releasesUrl = `${effectiveRepoUrl}/releases`;
  const actionsUrl = `${effectiveRepoUrl}/actions`;

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

  const handleCopyWorkflowYaml = async () => {
    try {
      const res = await fetch('/api/github-workflow-content');
      const data = await res.json();
      if (data.content) {
        navigator.clipboard.writeText(data.content);
        setCopiedWorkflow(true);
        setTimeout(() => setCopiedWorkflow(false), 3000);
      }
    } catch (e) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#0b1528] border border-cyan-500/30 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/15 via-blue-500/5 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#071120] rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Descargar App & Subir a GitHub</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  OFICIAL
                </span>
              </div>
              <p className="text-xs text-gray-400">Instala en tu teléfono Android o sube a tu repositorio</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
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
            <span>Instalar Móvil (1 Clic)</span>
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
            <span>GitHub</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar text-sm">
          {/* TAB 1: SUBIR A GITHUB (ACTIVO TRAS CREAR REPOSITORIO) */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-200">
                  <span className="font-bold text-white block mb-0.5">¡Excelente! Ya tienes tu repositorio listo en GitHub.</span>
                  Ahora solo falta subir los archivos del proyecto para que GitHub Actions empiece a compilar tu aplicación APK automáticamente.
                </div>
              </div>

              {/* OPCION AUTOMÁTICA EN 1 CLIC CON TOKEN */}
              <div className="bg-gradient-to-br from-[#0c1f3d] to-[#071326] p-4 rounded-xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Sparkles size={16} className="text-cyan-400" />
                    Opción 1: Subir Automáticamente desde aquí (Recomendado)
                  </h4>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded">
                    1 Clic
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    1. URL exacta de tu nuevo repositorio en GitHub:
                  </label>
                  <input
                    type="text"
                    value={repoUrlInput}
                    onChange={(e) => setRepoUrlInput(e.target.value)}
                    placeholder="Ej: https://github.com/alex2323-droid/tu-repo"
                    className="w-full bg-black/60 border border-cyan-500/40 rounded-lg py-2 px-3 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Copia la URL que aparece en la barra de tu navegador o en el botón de copiar de GitHub.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-300">
                      2. Tu GitHub Personal Access Token (PAT):
                    </label>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=Raidexs+Deploy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      <span>Crear Token en 30 seg</span>
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
                    GitHub requiere este token para autenticar la subida. Asegúrate de marcar los permisos <strong className="text-white">"repo"</strong> y <strong className="text-cyan-400">"workflow"</strong> (necesario para automatizar la creación del APK).
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
                      <span>Subiendo proyecto a tu GitHub...</span>
                    </>
                  ) : (
                    <>
                      <Github size={16} />
                      <span>Subir Todo el Proyecto a mi GitHub Ahora</span>
                    </>
                  )}
                </button>

                {/* Feedback */}
                {pushResult && (
                  <div className={`p-3.5 rounded-xl border text-xs space-y-2.5 ${
                    pushResult.success 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}>
                    <p className="font-bold flex items-center gap-1.5 text-xs">
                      {pushResult.success ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                      <span>{pushResult.message}</span>
                    </p>

                    {pushResult.success && pushResult.repoUrl && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <a
                          href={pushResult.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-colors"
                        >
                          <Github size={13} />
                          <span>Abrir mi repositorio en GitHub</span>
                          <ExternalLink size={12} />
                        </a>

                        {pushResult.actionsUrl && !pushResult.workflowMissing && (
                          <a
                            href={pushResult.actionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors"
                          >
                            <span>Ver compilación del APK en GitHub Actions</span>
                            <ArrowRight size={13} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Asistente si faltó el permiso de workflow */}
                    {pushResult.success && pushResult.workflowMissing && (
                      <div className="bg-[#0b172a] border border-amber-500/40 rounded-lg p-3 text-gray-200 space-y-2 mt-2">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold text-xs shrink-0">⚠️ Nota sobre el APK:</span>
                          <span className="text-[11px] text-gray-300">
                            Tu código ya está subido en GitHub. Para activar la compilación automática de APK, agrega el archivo de flujo con 1 de estos 2 métodos:
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          {pushResult.newFileUrl && (
                            <a
                              href={pushResult.newFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs transition-all shadow-sm"
                            >
                              <span>1. Abrir editor en GitHub</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={handleCopyWorkflowYaml}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                          >
                            {copiedWorkflow ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            <span>{copiedWorkflow ? '¡Copiado al portapapeles!' : '2. Copiar código de compilación APK'}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">
                          (Solo abres el enlace de GitHub y pegas el código copiado para que compile tu APK en 3 minutos).
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* OPCION 2: DESCARGAR ARCHIVO ZIP DEL PROYECTO COMPLETO */}
              <div className="bg-[#071120] p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <FolderArchive size={16} className="text-amber-400" />
                    Opción 2: Descargar el Código en ZIP y subirlo
                  </h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Puedes descargar todo el código del proyecto en un archivo comprimido .ZIP en tu teléfono o PC y subir los archivos a GitHub:
                </p>
                <a
                  href="/api/download-project-zip"
                  download="raidexs-proyecto-completo.zip"
                  className="w-full py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Descargar Proyecto Completo (.ZIP)</span>
                </a>
              </div>

              {/* OPCION 3: COMANDOS DE CONSOLA / TERMINAL */}
              <div className="bg-[#071120] p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Layers size={16} className="text-blue-400" />
                    Opción 3: Si usas Terminal o Codespaces
                  </h4>
                </div>
                <div className="bg-black/80 p-3 rounded-lg border border-white/10 relative">
                  <pre className="text-[11px] text-cyan-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {gitCommands}
                  </pre>
                  <button
                    onClick={handleCopyCommands}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                  >
                    {copiedCmd ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PWA DIRECT INSTALL */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-transparent p-4 rounded-xl border border-cyan-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 mt-0.5">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Instalación Inmediata en tu Teléfono</h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      ¡Tu teléfono ya puede tener la aplicación instalada sin esperar a compilar el APK! Abre en pantalla completa, tiene su icono oficial y funciona a máxima velocidad.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-500/20">
                  {isInstalled ? (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/30">
                      <CheckCircle2 size={20} />
                      <div>
                        <span className="font-bold text-xs block text-emerald-300">¡Raidexs ya está instalada en tu teléfono!</span>
                        <span className="text-[11px] text-gray-300">Búscala en tu menú de aplicaciones.</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={triggerInstall}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all transform active:scale-[0.99] cursor-pointer text-sm"
                    >
                      <Download size={18} />
                      <span>Instalar en este Dispositivo (1 Clic)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ZIP FULL PROJECT DOWNLOAD */}
          {activeTab === 'zip' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0c1f3d] via-[#091830] to-[#050f20] p-5 rounded-2xl border border-cyan-500/40 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
                      <FolderArchive className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white flex items-center gap-2">
                        <span>Código Completo de Raidexs</span>
                        <span className="text-[10px] bg-cyan-400 text-black px-2 py-0.5 rounded font-black tracking-wider">
                          ZIP • ~13 MB
                        </span>
                      </h4>
                      <p className="text-xs text-cyan-300/80 font-medium mt-0.5">
                        Frontend React, Servidor Node.js, Capacitor Android y Recursos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <a
                    href="/api/download-project-zip"
                    download="raidexs-proyecto-completo.zip"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-black font-black flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/30 transition-all transform active:scale-[0.99] cursor-pointer text-sm"
                  >
                    <Download size={20} className="stroke-[2.5]" />
                    <span>DESCARGAR PROYECTO COMPLETO (.ZIP)</span>
                  </a>

                  <p className="text-xs text-gray-300 text-center">
                    Descarga directa inmediata a tu dispositivo en 1 clic.
                  </p>
                </div>

                <div className="bg-[#071120] p-3.5 rounded-xl border border-white/10 space-y-2 text-xs">
                  <span className="font-bold text-white block text-[11px] uppercase tracking-wider text-cyan-400">
                    Contenido incluido en el archivo comprimido:
                  </span>
                  <ul className="space-y-2 text-gray-300 text-[11px]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Aplicación Web React + Vite:</strong> Todo el diseño, sistema de recargas, catálogo dinámico y panel de administración.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Servidor Node.js / Express:</strong> APIs de entrega automática, verificación de IDs y configuración.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Proyecto Android Capacitor (/android):</strong> Estructura completa de Gradle para compilar en Android Studio.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Flujos CI/CD (.github/workflows):</strong> Automatización para GitHub Actions.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APK DOWNLOAD */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              {/* Tarjeta Principal de Descarga del APK */}
              <div className="bg-gradient-to-br from-[#0c1f3d] via-[#091830] to-[#050f20] p-5 rounded-2xl border border-cyan-500/40 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
                      <Smartphone className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-white">Raidexs Móvil Oficial</h4>
                        {releaseAssetUrl ? (
                          <span className="text-[10px] bg-emerald-400 text-black px-2 py-0.5 rounded font-black tracking-wider flex items-center gap-1">
                            <CheckCircle2 size={11} /> APK LISTO
                          </span>
                        ) : latestWorkflowRun?.status === 'in_progress' ? (
                          <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded font-black tracking-wider flex items-center gap-1 animate-pulse">
                            <Loader2 size={11} className="animate-spin" /> COMPILANDO
                          </span>
                        ) : (
                          <span className="text-[10px] bg-cyan-400 text-black px-2 py-0.5 rounded font-black tracking-wider">
                            APK v1.0.0
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cyan-300/80 font-medium mt-0.5">
                        Compatible con Android 7.0 o superior • 100% Verificado
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banner de estado en vivo de GitHub si está disponible */}
                {latestWorkflowRun && (
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Activity size={14} className={latestWorkflowRun.status === 'in_progress' ? 'text-amber-400 animate-pulse' : 'text-cyan-400'} />
                      <span>
                        Estado en GitHub Actions: {' '}
                        <strong className="text-white">
                          {latestWorkflowRun.status === 'in_progress' 
                            ? 'Compilando APK en la nube...' 
                            : latestWorkflowRun.conclusion === 'success' 
                              ? 'Compilación Exitosa' 
                              : 'Finalizado'}
                        </strong>
                      </span>
                    </div>
                    <a
                      href={latestWorkflowRun.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <span>Ver consola</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                {/* Botón Principal de Descarga */}
                <div className="space-y-2 pt-1">
                  <a
                    href={finalApkUrl}
                    download="Raidexs-v1.0-debug.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-black font-black flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/30 transition-all transform active:scale-[0.99] cursor-pointer text-sm"
                  >
                    <Download size={20} className="stroke-[2.5]" />
                    <span>DESCARGAR APK OFICIAL DIRECTO</span>
                  </a>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={releasesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-colors cursor-pointer"
                    >
                      <Github size={14} className="text-cyan-400" />
                      <span>Ver en GitHub Releases</span>
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href={actionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-colors cursor-pointer"
                    >
                      <Layers size={14} className="text-blue-400" />
                      <span>Ver Artefactos en Actions</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Acceso rápido a alternativas instantáneas */}
                <div className="bg-gradient-to-r from-cyan-950/50 to-blue-950/40 p-3 rounded-xl border border-cyan-500/30 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-white block">¿Quieres la app al instante sin esperar la compilación?</span>
                    <span className="text-[11px] text-gray-300">Instala directo en tu móvil con 1 solo clic.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('pwa')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={13} />
                    <span>Instalar Ya</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={13} /> Libre de virus y malware
                  </span>
                  <span>Entrega inmediata de recargas por ID</span>
                </div>
              </div>

              {/* Guía Paso a Paso para Instalar en Android */}
              <div className="bg-[#071120] p-4 rounded-xl border border-white/10 space-y-3">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck size={16} className="text-cyan-400" />
                  Instrucciones de Instalación en Android
                </h5>

                <div className="grid grid-cols-1 gap-2.5 text-xs text-gray-300">
                  <div className="flex items-start gap-2.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Descarga el archivo APK:</strong> Pulsa el botón de arriba para descargar <code className="text-cyan-300 bg-black/60 px-1 py-0.5 rounded text-[11px]">Raidexs-v1.0-debug.apk</code> en tu teléfono.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Confirma la descarga:</strong> Si Chrome te advierte <em>"El archivo puede ser dañino"</em>, selecciona <strong>"Descargar de todos modos"</strong> (aviso estándar de seguridad de Android para apps descargadas fuera de la Play Store).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Habilita Fuentes Desconocidas:</strong> Al abrir el archivo descargado, si el sistema lo solicita, toca en <strong>"Configuración"</strong> y activa <strong>"Permitir desde esta fuente"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <strong className="text-white">Instala y Abre:</strong> Presiona <strong>"Instalar"</strong>. ¡Raidexs se agregará a tus aplicaciones listo para usar!
                    </div>
                  </div>
                </div>
              </div>

              {/* Acceso directo a PWA */}
              <div className="bg-gradient-to-r from-emerald-950/30 to-cyan-950/30 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-bold text-white block">¿Quieres tener la app en 5 segundos sin descargar archivos?</span>
                  <span className="text-[11px] text-gray-300">Instala directo en tu pantalla de inicio usando la versión PWA (WebAPK).</span>
                </div>
                <button
                  onClick={() => setActiveTab('pwa')}
                  className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Ver PWA</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#070e1c] flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" /> 100% Seguro y Oficial
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
