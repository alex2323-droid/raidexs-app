import { useState, useEffect } from 'react';
import { Mail, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { googleSignIn, initAuth, logout } from '../firebase';
import { getEmails, parseEmailData } from '../gmailService';
import { User } from 'firebase/auth';

export default function GmailInbox() {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setToken(token);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (token) {
      loadEmails(token);
    }
  }, [token]);

  const loadEmails = async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const rawEmails = await getEmails(accessToken);
      const parsedEmails = (rawEmails || []).map(parseEmailData);
      setEmails(parsedEmails);
    } catch (err: any) {
      setError(err.message || 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/user-cancelled' || err.code === 'auth/cancelled-popup-request') {
        setError('El inicio de sesión fue cancelado. Si estás en GitHub Pages, asegúrate de haber agregado tu dominio a los "Dominios Autorizados" en Firebase Authentication.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Dominio no autorizado. Debes agregar tu dominio de GitHub Pages a los "Dominios Autorizados" en la consola de Firebase.');
      } else {
        setError(err.message || 'No se pudo iniciar sesión correctamente.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setEmails([]);
    setNeedsAuth(true);
  };

  if (needsAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center animation-fade-in text-center min-h-[50vh]">
        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <Mail size={40} className="text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Conecta tu Correo</h2>
        <p className="text-on-surface-variant mb-8 max-w-md">Para gestionar tus recibos de compra y notificaciones, inicia sesión con Gmail.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2 max-w-md text-sm">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-left">{error}</p>
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="bg-white text-gray-900 border border-gray-300 font-medium py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3 shadow-sm disabled:opacity-50"
        >
          {isLoggingIn ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <svg viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          )}
          {isLoggingIn ? 'Conectando...' : 'Sign in with Google'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full pb-24 md:pb-8 animation-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Mail size={28} className="text-primary" /> Recibos (Gmail)
          </h1>
          <p className="text-on-surface-variant font-medium mt-1 text-sm">
            Conectado como {user?.email}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => token && loadEmails(token)}
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-surface-container py-2 px-4 rounded-xl hover:bg-surface-dim transition-colors text-sm font-medium border border-glass-border"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-red-500/30 text-red-400 py-2 px-4 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            Desconectar
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12">
          <RefreshCw size={32} className="animate-spin text-primary" />
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center p-10 bg-surface-container-low rounded-xl border border-glass-border border-dashed">
          <p className="text-on-surface-variant">Tu bandeja de entrada está vacía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {emails.map((email, index) => (
            <div key={`${email.id || 'email'}-${index}`} className="glass-panel p-4 rounded-xl border border-glass-border hover:bg-surface-container transition-colors group cursor-pointer">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="font-medium text-on-surface flex-grow truncate mr-4">{email.subject}</h3>
                <span className="text-xs text-on-surface-variant whitespace-nowrap hidden sm:block shrink-0">
                  {new Date(email.date).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-on-surface-variant font-medium mb-1 truncate">{email.from}</div>
              <p className="text-xs text-on-surface-variant/70 truncate line-clamp-1">{email.snippet.replace(/&quot;/g, '"').replace(/&amp;/g, '&')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
