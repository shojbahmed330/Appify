
import React from 'react';
import { MessageSquare, Smartphone, Rocket, Zap } from 'lucide-react';

interface DashboardControlsProps {
  mobileTab: 'chat' | 'preview';
  setMobileTab: (t: 'chat' | 'preview') => void;
  handleBuildAPK: () => void;
}

export const MobileControls: React.FC<DashboardControlsProps> = ({ mobileTab, setMobileTab, handleBuildAPK }) => (
  <div className="lg:hidden fixed top-[82px] left-1/2 -translate-x-1/2 z-[400] flex gap-3 items-center w-full px-6 justify-center pointer-events-none">
    <div className="bg-black/80 backdrop-blur-3xl p-1.5 rounded-2xl border border-white/10 flex gap-1 shadow-2xl ring-1 ring-white/5 pointer-events-auto">
      <button 
        onClick={() => setMobileTab('chat')} 
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${mobileTab === 'chat' ? 'bg-pink-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'text-zinc-500'}`}
      >
        <MessageSquare size={14}/> <span>Chat</span>
      </button>
      <button 
        onClick={() => setMobileTab('preview')} 
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${mobileTab === 'preview' ? 'bg-pink-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'text-zinc-500'}`}
      >
        <Smartphone size={14}/> <span>Visual</span>
      </button>
    </div>
    <button onClick={handleBuildAPK} className="bg-gradient-to-br from-pink-600 to-pink-700 p-3.5 rounded-2xl text-white shadow-[0_0_25px_rgba(236,72,153,0.3)] active:scale-90 transition-all border border-white/10 pointer-events-auto">
      <Rocket size={18} />
    </button>
  </div>
);

export const DesktopBuildButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="hidden lg:block fixed bottom-12 right-12 z-[200] animate-in slide-in-from-right-10 duration-1000">
    <button onClick={onClick} className="group relative flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 bg-[length:200%_auto] hover:bg-right rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] text-white shadow-[0_15px_40px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95 transition-all duration-700 ring-1 ring-white/20">
      <div className="relative z-10 flex items-center gap-3">
        <Rocket size={20} className="group-hover:animate-bounce" />
        <span>Execute Build</span>
        <Zap size={14} className="text-white/60 group-hover:animate-pulse" />
      </div>
    </button>
  </div>
);
