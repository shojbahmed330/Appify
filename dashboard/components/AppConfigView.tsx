
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Box, Image as ImageIcon, Smartphone, Save, Globe, ShieldAlert, Database, Key as KeyIcon, Zap, ShieldCheck, Lock, Eye, EyeOff, FileKey, AlertTriangle, BookOpen, Terminal, Copy, Check, Wand2, Download } from 'lucide-react';
import { ProjectConfig } from '../../types';
import { KeystoreService } from '../../services/keystoreService';

interface AppConfigViewProps {
  config: ProjectConfig;
  onUpdate: (config: ProjectConfig) => void;
  onBack: () => void;
}

const AppConfigView: React.FC<AppConfigViewProps> = ({ config, onUpdate, onBack }) => {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);
  const keystoreInputRef = useRef<HTMLInputElement>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Auto-suggest alias if not manually set
  useEffect(() => {
    if (!config.key_alias && config.appName) {
       onUpdate({ ...config, key_alias: KeystoreService.generateCleanAlias(config.appName) });
    }
  }, [config.appName]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'splash' | 'keystore_base64') => {
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

  const isSigned = !!config.keystore_base64;
  const keystoreCommand = KeystoreService.getKeystoreCommand(config.packageName || 'com.example.app', config.appName || 'My_App');

  const copyCommand = () => {
    navigator.clipboard.writeText(keystoreCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleInstantGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const newKeys = KeystoreService.generateInstantKeystore(config.appName || 'My_App');
      onUpdate({ ...config, ...newKeys });
      setGenerating(false);
      alert("Success! AI has generated a secure & UNIQUE Keystore for your mobile device.");
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-black animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 md:pb-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-zinc-400 transition-all active:scale-95">
              <ArrowLeft size={24}/>
            </button>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Project <span className="text-pink-600">Config</span></h2>
              <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em] mt-1">Native Assets & Deployment Keys</p>
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

          {/* Database Section */}
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
          </div>

          {/* PRODUCTION SIGNING (KEYSTORE) */}
          <div className="md:col-span-2 glass-tech p-10 rounded-[4rem] border-amber-500/10 bg-gradient-to-br from-amber-600/5 to-transparent relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Lock size={120} className="text-amber-500"/>
             </div>
             
             <div className="flex flex-col md:flex-row items-start gap-10">
                <div className="space-y-6 flex-1">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl shadow-inner"><FileKey size={24}/></div>
                        <div>
                           <h3 className="text-xl font-black uppercase tracking-tight text-white">Production App Signing</h3>
                           <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Google Play Store Readiness</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleInstantGenerate}
                          disabled={generating}
                          className="flex items-center gap-2 px-4 py-2 bg-pink-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-lg shadow-pink-600/20"
                        >
                          <Wand2 size={14} className={generating ? 'animate-spin' : ''}/> {generating ? 'Generating...' : 'Instant Generate (Mobile)'}
                        </button>
                        <button 
                          onClick={() => setShowGuide(!showGuide)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showGuide ? 'bg-amber-500 text-black' : 'bg-white/5 text-amber-500 border border-amber-500/20'}`}
                        >
                           <BookOpen size={14}/> {showGuide ? 'PC Guide' : 'PC Guide'}
                        </button>
                      </div>
                   </div>

                   {showGuide && (
                     <div className="bg-black/40 border border-amber-500/20 rounded-[2rem] p-6 space-y-4 animate-in slide-in-from-top-4 duration-500">
                        <h4 className="text-xs font-black uppercase text-white flex items-center gap-2">
                           <Terminal size={14} className="text-amber-500"/> Keystore জেনারেট করার নিয়ম (For PC)
                        </h4>
                        <div className="space-y-3">
                           <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                              ১. আপনার পিসিতে **Java/JDK** ইন্সটল করা থাকলে নিচের কমান্ডটি রান করুন।<br/>
                              ২. আমরা আপনার অ্যাপের নামে ইউনিক অ্যালিয়াস সেট করে দিয়েছি।
                           </p>
                           <div className="relative group/cmd">
                              <div className="bg-black border border-white/5 rounded-xl p-4 pr-12 font-mono text-[10px] text-amber-500/80 break-all leading-relaxed">
                                 {keystoreCommand}
                              </div>
                              <button 
                                onClick={copyCommand}
                                className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-amber-500 hover:text-black rounded-lg transition-all"
                              >
                                 {copiedCmd ? <Check size={14}/> : <Copy size={14}/>}
                              </button>
                           </div>
                        </div>
                     </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-600 ml-4 tracking-widest">Keystore Password</label>
                        <input 
                          type={showPasswords ? 'text' : 'password'}
                          value={config.keystore_password || ''} 
                          onChange={e => onUpdate({...config, keystore_password: e.target.value})}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-amber-500/40 outline-none"
                          placeholder="Store Password"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-600 ml-4 tracking-widest">Key Alias (Unique ID)</label>
                        <input 
                          value={config.key_alias || ''} 
                          onChange={e => onUpdate({...config, key_alias: e.target.value})}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-amber-500 font-bold focus:border-amber-500/40 outline-none"
                          placeholder="e.g. my_app_key"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-600 ml-4 tracking-widest">Key Password</label>
                        <input 
                          type={showPasswords ? 'text' : 'password'}
                          value={config.key_password || ''} 
                          onChange={e => onUpdate({...config, key_password: e.target.value})}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-amber-500/40 outline-none"
                          placeholder="Key Password"
                        />
                      </div>

                      <div className="flex items-end pb-1 gap-4">
                         <button 
                           onClick={() => setShowPasswords(!showPasswords)}
                           className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors"
                         >
                           {showPasswords ? <EyeOff size={14}/> : <Eye size={14}/>} {showPasswords ? 'Hide' : 'Show'}
                         </button>
                         {isSigned && (
                           <button 
                             onClick={() => onUpdate({...config, keystore_base64: '', keystore_password: '', key_alias: '', key_password: ''})}
                             className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:text-red-400"
                           >
                             Reset Keys
                           </button>
                         )}
                      </div>
                   </div>
                </div>

                <div className="w-full md:w-64 space-y-4">
                   <input type="file" ref={keystoreInputRef} className="hidden" onChange={e => handleImageUpload(e, 'keystore_base64')} />
                   <div 
                     onClick={() => keystoreInputRef.current?.click()}
                     className={`w-full aspect-square rounded-[3rem] border-4 border-dashed transition-all flex flex-col items-center justify-center text-center p-6 cursor-pointer ${isSigned ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-black border-white/5 text-zinc-700 hover:border-amber-500/20'}`}
                   >
                      {isSigned ? (
                        <>
                          <ShieldCheck size={48} className="mb-4 animate-pulse"/>
                          <span className="text-[10px] font-black uppercase tracking-widest">Signed & Ready</span>
                          <span className="text-[8px] mt-2 opacity-50">App will build as AAB</span>
                        </>
                      ) : (
                        <>
                          <FileKey size={48} className="mb-4 opacity-20"/>
                          <span className="text-[10px] font-black uppercase tracking-widest">Upload .JKS</span>
                          <span className="text-[8px] mt-2 opacity-50">Or use Instant Generate</span>
                        </>
                      )}
                   </div>
                   {isSigned && (
                     <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-3">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0"/>
                        <p className="text-[8px] font-black text-amber-500/80 uppercase leading-relaxed">
                           Unique alias active. Do not lose your passwords!
                        </p>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* Assets Section */}
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
