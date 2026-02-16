
import React, { useRef } from 'react';
import { ArrowLeft, Box, Image as ImageIcon, Smartphone, Save, Globe, ShieldAlert } from 'lucide-react';
import { ProjectConfig } from '../../types';

interface AppConfigViewProps {
  config: ProjectConfig;
  onUpdate: (config: ProjectConfig) => void;
  onBack: () => void;
}

const AppConfigView: React.FC<AppConfigViewProps> = ({ config, onUpdate, onBack }) => {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'splash') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate({ ...config, [type]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const sanitizePackageName = (val: string) => {
    // Android package names cannot have spaces, must be lowercase, and can't have dashes
    return val.toLowerCase().replace(/\s+/g, '').replace(/-/g, '_').replace(/[^a-z0-9._]/g, '');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-black animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 md:pb-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-zinc-400 transition-all active:scale-95">
              <ArrowLeft size={24}/>
            </button>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">App <span className="text-pink-600">Configuration</span></h2>
              <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em] mt-1">Setup Native Identity & Assets</p>
            </div>
          </div>
          <button onClick={onBack} className="px-8 py-4 bg-pink-600 rounded-3xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-pink-600/20 active:scale-95 transition-all">
            Save Config
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Identity Section */}
          <div className="glass-tech p-8 rounded-[3rem] border-white/5 space-y-8 flex flex-col justify-between">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl"><Globe size={20}/></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Native Identity</h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 ml-4 tracking-widest">App Display Name</label>
                    <input 
                      value={config.appName} 
                      onChange={e => onUpdate({...config, appName: e.target.value.trim()})}
                      placeholder="e.g. My Awesome App" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-pink-500/40 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 ml-4 tracking-widest">Package Identifier (Unique)</label>
                    <input 
                      value={config.packageName} 
                      onChange={e => onUpdate({...config, packageName: sanitizePackageName(e.target.value)})}
                      placeholder="com.company.project" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-mono text-pink-400 focus:border-pink-500/40 outline-none transition-all"
                    />
                    <div className="flex items-center gap-2 px-4 text-[9px] text-zinc-600 uppercase font-black">
                      <ShieldAlert size={10}/> <span>No spaces or dashes allowed in Package ID</span>
                    </div>
                  </div>
                </div>
             </div>

             <div className="p-5 bg-pink-500/5 border border-pink-500/10 rounded-3xl flex items-center gap-4 mt-6">
                <div className="p-2 bg-pink-500 text-white rounded-lg"><Save size={14}/></div>
                <p className="text-[10px] font-bold text-pink-400/80 leading-relaxed uppercase">Data is automatically saved to cloud stub on changes.</p>
             </div>
          </div>

          {/* Icon & Splash Preview */}
          <div className="grid grid-cols-1 gap-8">
            
            {/* App Icon Upload */}
            <div className="glass-tech p-8 rounded-[3rem] border-white/5 flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl"><Box size={20}/></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">App Icon</h3>
                </div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold max-w-[150px]">Recommend: 1024x1024 PNG with square mask.</p>
                <input type="file" ref={iconInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'icon')} />
                <button onClick={() => iconInputRef.current?.click()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all">Upload Icon</button>
              </div>

              <div className="w-32 h-32 bg-black border-4 border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                {config.icon ? (
                  <img src={config.icon} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800"><ImageIcon size={40}/></div>
                )}
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 shadow-lg border-2 border-black"></div>
              </div>
            </div>

            {/* Splash Screen Upload */}
            <div className="glass-tech p-8 rounded-[3rem] border-white/5 flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><Smartphone size={20}/></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Splash Screen</h3>
                </div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold max-w-[150px]">Recommend: 2732x2732 PNG (Center focus).</p>
                <input type="file" ref={splashInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'splash')} />
                <button onClick={() => splashInputRef.current?.click()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all">Upload Splash</button>
              </div>

              <div className="w-24 h-40 bg-black border-4 border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                {config.splash ? (
                  <img src={config.splash} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800"><ImageIcon size={30}/></div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Device Preview Mockup */}
        <div className="glass-tech p-10 rounded-[4rem] border-white/5 flex flex-col items-center gap-10">
           <div className="text-center">
             <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.5em] mb-4">Native UX Preview</h3>
           </div>
           
           <div className="flex flex-col md:flex-row gap-20 items-center justify-center">
              {/* Icon Preview */}
              <div className="flex flex-col items-center gap-4">
                 <div className="w-20 h-20 rounded-2xl border-2 border-white/20 bg-[#0a0a0c] shadow-2xl p-1 flex items-center justify-center">
                    {config.icon ? <img src={config.icon} className="w-full h-full object-cover rounded-[14px]" /> : <Box className="text-zinc-800"/>}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white">{config.appName}</span>
              </div>

              {/* Splash Preview */}
              <div className="w-48 h-80 bg-[#020203] rounded-[2.5rem] border-[8px] border-[#0a0a0c] overflow-hidden flex flex-col items-center justify-center relative ring-1 ring-white/10">
                 {config.splash ? (
                    <img src={config.splash} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                 ) : null}
                 <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                       {config.icon ? <img src={config.icon} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5"></div>}
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-white animate-pulse">{config.appName}</span>
                 </div>
                 <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-1">
                    <div className="w-4 h-4 border-2 border-white/10 rounded-full animate-spin border-t-pink-500"></div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AppConfigView;
