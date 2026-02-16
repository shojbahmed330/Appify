
import React, { useRef } from 'react';
import { ArrowLeft, Box, Image as ImageIcon, Smartphone, Save, Globe, ShieldAlert, Database, Key as KeyIcon, Zap } from 'lucide-react';
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
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Project <span className="text-pink-600">Config</span></h2>
              <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em] mt-1">Native Assets & Database Bridge</p>
            </div>
          </div>
          <button onClick={onBack} className="px-8 py-4 bg-pink-600 rounded-3xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-pink-600/20 active:scale-95 transition-all">
            Apply Changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Identity Section */}
          <div className="glass-tech p-8 rounded-[3rem] border-white/5 space-y-8 flex flex-col">
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
                      onChange={e => onUpdate({...config, appName: e.target.value})}
                      placeholder="e.g. My Awesome App" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-pink-500/40 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 ml-4 tracking-widest">Package Identifier</label>
                    <input 
                      value={config.packageName} 
                      onChange={e => onUpdate({...config, packageName: sanitizePackageName(e.target.value)})}
                      placeholder="com.company.project" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-mono text-pink-400 focus:border-pink-500/40 outline-none transition-all"
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Database Section - The Bridge */}
          <div className="glass-tech p-8 rounded-[3rem] border-white/5 space-y-8 flex flex-col bg-gradient-to-br from-indigo-600/5 to-transparent">
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl"><Database size={20}/></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Database Bridge</h3>
                  </div>
                  <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                     <span className="text-[8px] font-black uppercase text-cyan-500 tracking-tighter animate-pulse">Real-time Sync</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 ml-4 tracking-widest flex items-center gap-2">
                      <Globe size={10}/> Supabase URL
                    </label>
                    <input 
                      value={config.supabase_url || ''} 
                      onChange={e => onUpdate({...config, supabase_url: e.target.value.trim()})}
                      placeholder="https://xyz.supabase.co" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-mono text-zinc-300 focus:border-cyan-500/40 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 ml-4 tracking-widest flex items-center gap-2">
                      <KeyIcon size={10}/> Anon Key
                    </label>
                    <input 
                      type="password"
                      value={config.supabase_key || ''} 
                      onChange={e => onUpdate({...config, supabase_key: e.target.value.trim()})}
                      placeholder="eyJhbGciOiJIUzI..." 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-mono text-zinc-300 focus:border-cyan-500/40 outline-none transition-all"
                    />
                  </div>
                </div>
             </div>
             
             <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-start gap-3">
                <Zap size={14} className="text-cyan-500 mt-1 shrink-0"/>
                <p className="text-[9px] font-bold text-cyan-500/70 leading-relaxed uppercase">
                  Linking this database allows AI to generate Real-time Apps and Admin Panels that stay in sync automatically.
                </p>
             </div>
          </div>

          {/* App Icon Upload */}
          <div className="glass-tech p-8 rounded-[3rem] border-white/5 flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl"><Box size={20}/></div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">App Icon</h3>
              </div>
              <input type="file" ref={iconInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'icon')} />
              <button onClick={() => iconInputRef.current?.click()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all">Upload PNG</button>
            </div>

            <div className="w-24 h-24 bg-black border-4 border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
              {config.icon ? <img src={config.icon} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-800"><ImageIcon size={30}/></div>}
            </div>
          </div>

          {/* Splash Screen Upload */}
          <div className="glass-tech p-8 rounded-[3rem] border-white/5 flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><Smartphone size={20}/></div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Splash Screen</h3>
              </div>
              <input type="file" ref={splashInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'splash')} />
              <button onClick={() => splashInputRef.current?.click()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all">Upload PNG</button>
            </div>

            <div className="w-20 h-32 bg-black border-4 border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
              {config.splash ? <img src={config.splash} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-800"><ImageIcon size={24}/></div>}
            </div>
          </div>

        </div>

        <div className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
           <div className="p-2 bg-pink-500 text-white rounded-lg"><Save size={14}/></div>
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Configuration is stored in the project cluster.</p>
        </div>

      </div>
    </div>
  );
};

export default AppConfigView;
