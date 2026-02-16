
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Cpu, QrCode, X, Copy, Check, AlertCircle, Wrench, ShieldCheck } from 'lucide-react';
import { AppMode, ProjectConfig, WorkspaceType } from '../../types';
import { buildFinalHtml } from '../../utils/previewBuilder';
import { useLanguage } from '../../i18n/LanguageContext';
import WorkspaceToggle from './WorkspaceToggle';
import PreviewFrame from './PreviewFrame';

interface MobilePreviewProps {
  projectFiles: Record<string, string>;
  setMode: (m: AppMode) => void;
  handleBuildAPK: () => void;
  mobileTab: 'chat' | 'preview';
  isGenerating?: boolean;
  projectConfig?: ProjectConfig;
  projectId?: string | null;
  runtimeError?: { message: string; line: number; source: string } | null;
  onAutoFix?: () => void;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ 
  projectFiles, setMode, handleBuildAPK, mobileTab, isGenerating, projectConfig, projectId,
  runtimeError, onAutoFix
}) => {
  const [workspace, setWorkspace] = useState<WorkspaceType>('app');
  const [showSplash, setShowSplash] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  
  const entryPath = workspace === 'app' ? 'app/index.html' : 'admin/index.html';
  const finalHtml = buildFinalHtml(projectFiles, entryPath, projectConfig);
  const hasFiles = !!projectFiles[entryPath];

  const previewUrl = projectId ? `${window.location.origin}/preview/${projectId}?workspace=${workspace}` : null;

  useEffect(() => {
    if (showQrModal && previewUrl) {
      import('https://esm.sh/qrcode').then(QRCode => {
        QRCode.toDataURL(previewUrl, {
          width: 250,
          margin: 1,
          color: { dark: '#ec4899', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        }).then(url => setQrDataUrl(url));
      });
    }
  }, [showQrModal, previewUrl]);

  useEffect(() => {
    if (hasFiles && !isGenerating) {
      setShowSplash(true);
      const timer = setTimeout(() => setShowSplash(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasFiles, isGenerating, workspace]);

  const copyLink = async () => {
    if (previewUrl) {
      try {
        await navigator.clipboard.writeText(previewUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = previewUrl; document.body.appendChild(textArea);
        textArea.select(); document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <section className={`flex-1 flex flex-col items-center justify-center p-6 relative h-full pt-20 lg:pt-6 overflow-hidden ${mobileTab === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
      
      {/* Workspace Switcher */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-[340px]">
        <WorkspaceToggle active={workspace} onChange={setWorkspace} />
      </div>

      {hasFiles && !isGenerating && projectId && (
        <div className="absolute top-10 right-10 z-30 group hidden lg:block">
          <button onClick={() => setShowQrModal(true)} className="flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-pink-600 text-zinc-400 hover:text-white rounded-2xl border border-white/5 backdrop-blur-xl transition-all shadow-xl active:scale-95 group">
            <QrCode size={18} className="group-hover:rotate-12 transition-transform"/>
            <span className="text-[10px] font-black uppercase tracking-widest">Share Preview</span>
          </button>
        </div>
      )}

      {/* PROFESSIONAL PREVIEW FRAME (The Core of Step 3) */}
      <PreviewFrame workspace={workspace} appName={projectConfig?.appName}>
        {hasFiles ? (
          <div className="w-full h-full relative">
            <iframe 
              srcDoc={finalHtml} 
              className="w-full h-full border-none bg-[#09090b]" 
              title="preview" 
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" 
            />
            
            {runtimeError && !isGenerating && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[250] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-500/30"><AlertCircle size={32}/></div>
                <h3 className="text-lg font-black text-white uppercase mb-2">Uplink Interrupted</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-6 leading-relaxed">Error Log: "{runtimeError.message}"</p>
                <button onClick={onAutoFix} className="px-8 py-4 bg-pink-600 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all active:scale-95"><Wrench size={14}/> Auto-Repair Engine</button>
              </div>
            )}
            
            {showSplash && (
              <div className="absolute inset-0 bg-[#09090b] z-[200] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300 fade-out slide-out-to-top-full fill-mode-forwards delay-1000">
                <div className="relative z-10 flex flex-col items-center gap-6">
                   <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-black">
                      {workspace === 'admin' ? (
                        <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500"><ShieldCheck size={40}/></div>
                      ) : (
                        projectConfig?.icon ? <img src={projectConfig.icon} className="w-full h-full object-cover" /> : <Sparkles size={32} className="text-pink-500"/>
                      )}
                   </div>
                   <div className="space-y-1 text-center">
                      <h1 className="text-xl font-black text-white uppercase tracking-[0.3em]">{workspace === 'admin' ? 'Admin Node' : (projectConfig?.appName || 'Studio App')}</h1>
                      <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-600">Initializing Workspace Components</p>
                   </div>
                   <div className="w-4 h-4 border-2 border-white/5 rounded-full animate-spin border-t-pink-500 mt-6"></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black text-center space-y-6">
             <Cpu size={48} className="text-zinc-800 relative z-10 animate-pulse" />
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Waiting for {workspace} Source Deployment...</p>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-[300] flex flex-col items-center justify-center text-center p-8">
             <div className="w-20 h-20 border border-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden bg-black mb-10"><Loader2 className="animate-spin text-pink-500" size={32}/></div>
             <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter shimmer-text">Compiling Workspace</h3>
                <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.4em]">Injecting Real-time Neural Logic</p>
             </div>
             <div className="w-full max-w-[200px] h-1 bg-white/5 rounded-full overflow-hidden mt-10"><div className="h-full bg-pink-500 w-full animate-[loading-bar_1.5s_infinite]"></div></div>
          </div>
        )}
      </PreviewFrame>

      {showQrModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6 animate-in fade-in duration-500">
          <div className="max-w-md w-full glass-tech p-10 rounded-[3rem] border-pink-500/20 flex flex-col items-center text-center relative animate-in zoom-in duration-700">
            <button onClick={() => { setShowQrModal(false); setQrDataUrl(null); }} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 transition-all"><X size={20}/></button>
            <div className="p-4 bg-white rounded-[2rem] mb-10 shadow-[0_0_80px_rgba(236,72,153,0.3)] w-[240px] h-[240px] flex items-center justify-center overflow-hidden border-[8px] border-white">
               {qrDataUrl ? <img src={qrDataUrl} className="w-full h-full object-contain" /> : <Loader2 className="animate-spin text-pink-500" size={24}/>}
            </div>
            <div className="space-y-6 w-full">
              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-inner">
                <span className="text-[10px] font-mono text-zinc-500 truncate">{previewUrl}</span>
                <button onClick={copyLink} className="p-2.5 bg-white/5 hover:bg-pink-600 rounded-xl transition-all shadow-xl">{copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}</button>
              </div>
              <button onClick={() => { setShowQrModal(false); setQrDataUrl(null); }} className="w-full py-5 bg-pink-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-pink-600/30 active:scale-95 transition-all">Dismiss Terminal</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .shimmer-text { background: linear-gradient(to right, #fff 20%, #ec4899 40%, #fff 60%, #fff 80%); background-size: 200% auto; background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shine 2s linear infinite; }
        @keyframes shine { to { background-position: 200% center; } }
      `}</style>
    </section>
  );
};

export default MobilePreview;
