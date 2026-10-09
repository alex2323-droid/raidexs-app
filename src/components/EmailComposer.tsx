import React, { useState, useEffect } from 'react';
import { Mail, Send, Loader2, Save, Trash2, Users, User } from 'lucide-react';
import { Order } from '../types';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  wrapperHtml: string;
}

interface Props {
  orders?: Order[];
}

const DEFAULT_WRAPPER = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050f26; color: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid rgba(0, 210, 255, 0.22);">
  <div style="background-color: #030a1b; padding: 24px; text-align: center; border-bottom: 1px solid rgba(0, 210, 255, 0.22);">
    <h1 style="margin: 0; color: #00d2ff; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Raidexs</h1>
  </div>
  <div style="padding: 32px 24px;">
    {{CONTENT}}
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://raidexs.com" style="display: inline-block; background-color: #00d2ff; color: #020617; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Visita Raidexs</a>
    </div>
  </div>
  <div style="background-color: #030a1b; padding: 16px; text-align: center; border-top: 1px solid rgba(0, 210, 255, 0.22);">
    <p style="margin: 0; color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} Raidexs. Todos los derechos reservados.</p>
  </div>
</div>`;

export default function EmailComposer({ orders = [] }: Props) {
  const [recipientMode, setRecipientMode] = useState<'single' | 'all'>('single');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{type: 'success'|'error', message: string} | null>(null);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const uniqueEmails = Array.from(new Set(orders.map(o => o.userEmail).filter(Boolean)));

  useEffect(() => {
    const defaultTemplate: EmailTemplate = {
      id: 'default-1',
      name: 'Plantilla por Defecto',
      subject: 'Comunicado Importante - Raidexs',
      wrapperHtml: DEFAULT_WRAPPER
    };

    const savedTemplates = localStorage.getItem('emailTemplatesV2');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        if (parsed.length > 0) {
          setTemplates(parsed);
        } else {
          setTemplates([defaultTemplate]);
        }
      } catch (e) {
        setTemplates([defaultTemplate]);
      }
    } else {
      setTemplates([defaultTemplate]);
      setSelectedTemplateId('default-1');
      setSubject(defaultTemplate.subject);
    }
  }, []);

  const saveTemplates = (newTemplates: EmailTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('emailTemplatesV2', JSON.stringify(newTemplates));
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !subject) return;
    
    const activeWrapper = templates.find(t => t.id === selectedTemplateId)?.wrapperHtml || DEFAULT_WRAPPER;
    
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      subject,
      wrapperHtml: activeWrapper
    };
    saveTemplates([...templates, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
    setNewTemplateName('');
    setIsSaving(false);
  };

  const handleDeleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplateId === id) {
      setSelectedTemplateId('');
      setSubject('');
    }
  };

  const handleSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    if (id) {
      const template = templates.find(t => t.id === id);
      if (template) {
        setSubject(template.subject);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientMode === 'single' && !to) return;
    if (recipientMode === 'all' && uniqueEmails.length === 0) {
      setStatus({ type: 'error', message: 'No hay usuarios registrados con correos válidos' });
      return;
    }
    if (!subject || !content) return;

    setIsSending(true);
    setStatus(null);

    const activeWrapper = templates.find(t => t.id === selectedTemplateId)?.wrapperHtml || DEFAULT_WRAPPER;
    
    // Convertir saltos de línea a <br> y envolver en el wrapper
    const formattedContent = content.split('\n').map(p => `<p style="margin: 0 0 16px 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">${p}</p>`).join('');
    const finalHtml = activeWrapper.replace('{{CONTENT}}', formattedContent);
    
    const finalRecipients = recipientMode === 'all' ? uniqueEmails.join(',') : to;

    try {
      let apiUrl = import.meta.env.VITE_API_URL || '';
      if (apiUrl.includes('<AQUI')) apiUrl = '';
      apiUrl = apiUrl.replace(/\/+$/, '');

      const response = await fetch(`/api/admin-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: finalRecipients, subject, html: finalHtml })
      });
      
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Error del servidor (${response.status}): ${text.substring(0, 50)}...`);
      }

      if (response.ok) {
        setStatus({ type: 'success', message: 'Correo enviado correctamente' });
        if (recipientMode === 'single') setTo('');
        setContent('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Error al enviar el correo' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Error de conexión' });
    }
    setIsSending(false);
  };

  return (
    <div className="bg-surface-container border border-glass-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
          <Mail size={24} />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">Enviar Comunicado</h2>
          <p className="text-on-surface-variant text-sm font-medium">Envía correos electrónicos directamente a la comunidad.</p>
        </div>
        
        {templates.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={selectedTemplateId}
              onChange={handleSelectTemplate}
              className="bg-surface border border-glass-border rounded-lg py-2 px-3 text-sm text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="">Plantilla base...</option>
              {templates.map((t, index) => (
                <option key={`${t.id || 'tmpl'}-${index}`} value={t.id}>{t.name}</option>
              ))}
            </select>
            {selectedTemplateId && selectedTemplateId !== 'default-1' && (
              <button
                onClick={() => handleDeleteTemplate(selectedTemplateId)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Eliminar plantilla"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm font-bold ${
          status.type === 'success' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-6">
        
        {/* Recipient Mode Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-on-surface-variant uppercase">Destinatarios</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${recipientMode === 'single' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-glass-border text-on-surface-variant hover:bg-white/5'}`}>
              <input 
                type="radio" 
                name="recipientMode" 
                value="single" 
                checked={recipientMode === 'single'} 
                onChange={() => setRecipientMode('single')}
                className="hidden" 
              />
              <User size={20} />
              <div className="flex flex-col">
                <span className="font-bold text-sm">Usuario Específico</span>
                <span className="text-xs opacity-80">Enviar a un solo correo electrónico</span>
              </div>
            </label>
            
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${recipientMode === 'all' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-glass-border text-on-surface-variant hover:bg-white/5'}`}>
              <input 
                type="radio" 
                name="recipientMode" 
                value="all" 
                checked={recipientMode === 'all'} 
                onChange={() => setRecipientMode('all')}
                className="hidden" 
              />
              <Users size={20} />
              <div className="flex flex-col">
                <span className="font-bold text-sm">Todos los Usuarios</span>
                <span className="text-xs opacity-80">Enviar a {uniqueEmails.length} usuario(s) registrado(s)</span>
              </div>
            </label>
          </div>
        </div>

        {recipientMode === 'single' && (
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="ejemplo@correo.com (Para múltiples separar con coma)"
              required={recipientMode === 'single'}
              className="w-full bg-surface border border-glass-border rounded-lg py-3 px-4 text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Asunto del correo"
            required
            className="w-full bg-surface border border-glass-border rounded-lg py-3 px-4 text-on-surface focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Contenido del Mensaje</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escribe el contenido de tu mensaje aquí. La plantilla visual se aplicará automáticamente al enviarlo..."
            required
            rows={8}
            className="w-full bg-surface border border-glass-border rounded-lg py-3 px-4 text-on-surface focus:border-primary focus:outline-none text-sm resize-y"
          ></textarea>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={isSending || (recipientMode === 'single' && !to) || !subject || !content}
            className="w-full sm:w-auto btn-primary py-3 px-8 rounded-lg text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
          >
            {isSending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={18} />
                Enviar Correo
              </>
            )}
          </button>
          
          <div className="flex w-full sm:w-auto items-center gap-2">
            {!isSaving ? (
              <button
                type="button"
                onClick={() => setIsSaving(true)}
                disabled={!subject}
                className="w-full sm:w-auto py-3 px-6 rounded-lg text-on-surface-variant bg-surface border border-glass-border font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <Save size={18} />
                Guardar Plantilla
              </button>
            ) : (
              <div className="flex w-full sm:w-auto items-center gap-2">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={e => setNewTemplateName(e.target.value)}
                  placeholder="Nombre de la plantilla"
                  className="w-full sm:w-48 bg-surface border border-glass-border rounded-lg py-3 px-4 text-sm text-on-surface focus:border-primary focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={!newTemplateName.trim()}
                  className="py-3 px-4 bg-primary text-on-surface rounded-lg font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:pointer-events-none"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaving(false)}
                  className="py-3 px-4 bg-surface border border-glass-border text-on-surface rounded-lg font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
