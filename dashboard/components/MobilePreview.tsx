
import React, { useState, useEffect } from 'react';
import { Smartphone, Sparkles, Loader2, Cpu, QrCode, X, Copy, ExternalLink, SmartphoneNfc, Check, AlertCircle, Wrench } from 'lucide-react';
import { AppMode, ProjectConfig } from '../../types';
import { buildFinalHtml } from '../../utils/previewBuilder';
import { useLanguage } from '../../i18n/LanguageContext';

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
  const [showSplash, setShowSplash] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  
  const finalHtml = buildFinalHtml(projectFiles);
  const hasFiles = Object.keys(projectFiles).length > 0 && projectFiles['index.html'];

  const previewUrl = projectId ? `${window.location.origin}/preview/${projectId}` : null;

  useEffect(() => {
    if (showQrModal && previewUrl) {
      import('https://esm.sh/qrcode').then(QRCode => {
        QRCode.toDataURL(previewUrl, {
          width: 250,
          margin: 1,
          color: {
            dark: '#ec4899', // Pink theme
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        }).then(url => {
          setQrDataUrl(url);
        });
      });
    }
  }, [showQrModal, previewUrl]);

  useEffect(() => {
    if (hasFiles && !isGenerating) {
      setShowSplash(true);
      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasFiles, isGenerating]);

  const copyLink = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className={`flex-1 flex flex-col items-center justify-center p-6 relative h-full pt-20 lg:pt-6 ${mobileTab === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
      
      {/* Live Preview Floating Button */}
      {hasFiles && !isGenerating && projectId && (
        <div className="absolute top-10 right-10 z-30 group hidden lg:block">
          <button 
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-3 px-5 py-3 bg-pink-600/10 hover:bg-pink-600 text-pink-500 hover:text-white rounded-2xl border border-pink-500/20 backdrop-blur-xl transition-all shadow-xl active:scale-95 group"
          >
            <QrCode size={18} className="group-hover:rotate-12 transition-transform"/>
            <span className="text-[10px] font-black uppercase tracking-widest">{t('preview.live_link')}</span>
          </button>
        </div>
      )}

      <div className="relative z-10 w-full max-w-[280px] md:max-w-[340px] max-h-[70vh] md:h-[680px] aspect-[9/18.5] bg-black rounded-[3.5rem] border-[10px] border-[#18181b] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/5">
         <div className="h-7 w-full flex items-center justify-center relative bg-[#18181b] shrink-0">
            <div className="w-20 h-3 bg-black/40 rounded-b-xl shadow-sm"></div>
         </div>
         
         <div className="flex-1 w-full bg-[#09090b] relative overflow-hidden">
            {hasFiles ? (
              <div className="w-full h-full relative">
                <iframe 
                  srcDoc={finalHtml} 
                  className="w-full h-full border-none bg-[#09090b]" 
                  title="preview" 
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" 
                />

                {/* Runtime Error Overlay */}
                {runtimeError && !isGenerating && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[250] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-500/30">
                      <AlertCircle size={32}/>
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">Runtime Error Detected</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 px-4 leading-relaxed">
                      "{runtimeError.message}" in {runtimeError.source}
                    </p>
                    <button 
                      onClick={onAutoFix}
                      className="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl shadow-pink-600/30 transition-all active:scale-95 group"
                    >
                      <Wrench size={14} className="group-hover:rotate-45 transition-transform"/> Repair with AI
                    </button>
                  </div>
                )}
                
                {showSplash && (
                  <div className="absolute inset-0 bg-[#09090b] z-[200] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300 fade-out slide-out-to-top-full fill-mode-forwards delay-1000">
                    {projectConfig?.splash && (
                      <img src={projectConfig.splash} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="splash" />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-6">
                       <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 flex items-center justify-center bg-black">
                          {projectConfig?.icon ? (
                            <img src={projectConfig.icon} className="w-full h-full object-cover" alt="icon" />
                          ) : (
                            <div className="w-full h-full bg-pink-500/10 flex items-center justify-center text-pink-500"><Sparkles size={32}/></div>
                          )}
                       </div>
                       <h1 className="text-xl font-black text-white uppercase tracking-[0.3em] text-center">{projectConfig?.appName || 'Studio App'}</h1>
                       <div className="w-4 h-4 border-2 border-white/5 rounded-full animate-spin border-t-pink-500 mt-10"></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black text-center space-y-6">
                 <div className="relative">
                    <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full animate-pulse"></div>
                    <Cpu size={48} className="text-pink-500 relative z-10 animate-pulse" />
                 </div>
                 <div className="space-y-3 px-4">
                    <h2 className="text-sm font-black tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-[shine_3s_linear_infinite] bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                      OneClick Studio
                    </h2>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-relaxed animate-pulse">
                      {t('preview.waiting')}
                    </p>
                 </div>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-[300] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                 <div className="absolute top-12 left-0 right-0 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                       <Sparkles className="text-pink-500" size={18}/>
                       <span className="font-black text-xs uppercase tracking-[0.3em] text-white">OneClick <span className="text-pink-500">Studio</span></span>
                    </div>
                 </div>
                 
                 <div className="flex flex-col items-center gap-10 w-full max-w-[200px]">
                    <div className="relative">
                       <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full animate-pulse"></div>
                       <div className="w-20 h-20 border-2 border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden bg-black shadow-xl">
                          <Loader2 className="animate-spin text-pink-500" size={32}/>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter shimmer-text">
                         {t('preview.building')}
                       </h3>
                       <p className="text-[9px] font-black uppercase text-pink-500/60 tracking-[0.5em] animate-pulse">
                         {t('preview.please_wait')}
                       </p>
                    </div>

                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                       <div className="h-full bg-pink-500 w-full animate-[loading-bar_1.5s_infinite]"></div>
                    </div>
                 </div>
              </div>
            )}
         </div>

         <div className="h-10 w-full flex items-center justify-center gap-14 bg-[#18181b] shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-black/40"></div>
            <div className="w-8 h-1 rounded-full bg-black/40"></div>
         </div>
      </div>

      {/* QR Modal Overlay */}
      {showQrModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="max-w-md w-full glass-tech p-10 rounded-[3rem] border-pink-500/20 flex flex-col items-center text-center relative animate-in zoom-in duration-500">
            <button 
              onClick={() => { setShowQrModal(false); setQrDataUrl(null); }}
              className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all"
            >
              <X size={20}/>
            </button>

            <div className="mb-8">
              <div className="w-16 h-16 bg-pink-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-pink-500/20">
                <SmartphoneNfc size={32} className="text-pink-500"/>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t('preview.uplink_title').split(' ')[0]} <span className="text-pink-500">{t('preview.uplink_title').split(' ')[1]}</span></h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mt-2">{t('preview.uplink_desc')}</p>
            </div>

            <div className="p-4 bg-white rounded-3xl mb-8 shadow-[0_0_50px_rgba(236,72,153,0.2)] w-[240px] h-[240px] flex items-center justify-center relative overflow-hidden">
               {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Mobile Preview QR"
                    className="w-full h-full object-contain animate-in fade-in duration-300"
                  />
               ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white">
                    <Loader2 className="animate-spin text-pink-500" size={24}/>
                  </div>
               )}
            </div>

            <div className="space-y-6 w-full">
              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono text-zinc-500 truncate">{previewUrl}</span>
                <button onClick={copyLink} className="p-2.5 bg-white/5 hover:bg-pink-600 rounded-xl transition-all">
                  {copied ? <Check size={14}/> : <Copy size={14}/>}
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => window.open(previewUrl!, '_blank')}
                  className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14}/> Open Web
                </button>
                <button 
                  onClick={() => { setShowQrModal(false); setQrDataUrl(null); }}
                  className="flex-1 py-4 bg-pink-600 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-pink-600/20"
                >
                  {t('common.done')}
                </button>
              </div>

              <p className="text-[9px] text-zinc-600 uppercase font-black leading-relaxed">
                <span className="text-pink-500">Tip:</span> {t('preview.scan_tip')}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-text {
          background: linear-gradient(to right, #ffffff 20%, #ec4899 40%, #ffffff 60%, #ffffff 80%);
          background-size: 200% auto;
          color: #000;
          background-clip: text;
          text-fill-color: transparent;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 2s linear infinite;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
};

export default MobilePreview;
