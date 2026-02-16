
import React from 'react';
import { MessageSquare, Smartphone, Rocket, Zap, Monitor } from 'lucide-react';
import { WorkspaceType } from '../../types';

interface DashboardControlsProps {
  mobileTab: 'chat' | 'preview';
  setMobileTab: (t: 'chat' | 'preview') => void;
  workspace: WorkspaceType;
  setWorkspace: (w: WorkspaceType) => void;
  handleBuildAPK: () => void;
}

export const MobileControls: React.FC<DashboardControlsProps> = ({ 
  mobileTab, setMobileTab, workspace, setWorkspace, handleBuildAPK 
}) => (
  <>
    {/* Top Floating Command Center */}
    <div className="lg:hidden fixed top-[82px] left-0 right-0 z-[400] px-4 pointer-events-none flex flex-col items-center gap-3">
      {/* Primary Mode Toggle: Chat vs Visual */}
      <div className="bg-black/70 backdrop-blur-2xl p-1.5 rounded-[1.5rem] border border-white/10 flex gap-1 shadow-2xl ring-1 ring-white/5 pointer-events-auto w-full max-w-[280px]">
        <button 
          onClick={() => setMobileTab('chat')} 
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${mobileTab === 'chat' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          <MessageSquare size={14}/> <span>Chat</span>
        </button>
        <button 
          onClick={() => setMobileTab('preview')} 
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${mobileTab === 'preview' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          <Smartphone size={14}/> <span>Visual</span>
        </button>
      </div>

      {/* Secondary Workspace Toggle: App vs Admin (Only visible in Visual Mode) */}
      {mobileTab === 'preview' && (
        <div className="bg-black/50 backdrop-blur-xl p-1 rounded-[1.2rem] border border-white/5 flex gap-1 shadow-xl pointer-events-auto w-full max-w-[240px] animate-in slide-in-from-top-2 duration-500">
          <button 
            onClick={() => setWorkspace('app')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[8px] font-black uppercase transition-all duration-300 ${workspace === 'app' ? 'bg-pink-600/80 text-white' : 'text-zinc-600'}`}
          >
            <Smartphone size={12}/> <span>App</span>
          </button>
          <button 
            onClick={() => setWorkspace('admin')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[8px] font-black uppercase transition-all duration-300 ${workspace === 'admin' ? 'bg-indigo-600/80 text-white' : 'text-zinc-600'}`}
          >
            <Monitor size={12}/> <span>Admin</span>
          </button>
        </div>
      )}
    </div>

    {/* Floating Build Button (FAB) for Mobile - Bottom Right above Bottom Nav */}
    <div className="lg:hidden fixed bottom-24 right-6 z-[400] pointer-events-auto">
      <button 
        onClick={handleBuildAPK} 
        className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl text-white shadow-[0_15px_30px_rgba(236,72,153,0.4)] active:scale-90 transition-all border border-white/20 flex items-center justify-center group"
      >
        <Rocket size={24} className="group-hover:animate-bounce" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-pink-600">
           <Zap size={8} className="text-pink-600 fill-current" />
        </div>
      </button>
    </div>
  </>
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
