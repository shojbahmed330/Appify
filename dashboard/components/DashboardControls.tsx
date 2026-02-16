
import React from 'react';
import { MessageSquare, Smartphone, Rocket, Zap, Monitor, Settings } from 'lucide-react';
import { WorkspaceType, AppMode } from '../../types';

interface DashboardControlsProps {
  mobileTab: 'chat' | 'preview';
  setMobileTab: (t: 'chat' | 'preview') => void;
  workspace: WorkspaceType;
  setWorkspace: (w: WorkspaceType) => void;
  handleBuildAPK: () => void;
  onOpenConfig: () => void;
}

export const MobileControls: React.FC<DashboardControlsProps> = ({ 
  mobileTab, setMobileTab, workspace, setWorkspace, handleBuildAPK, onOpenConfig 
}) => (
  <>
    {/* Unified Mobile Command Center - Redesigned for visual clarity */}
    <div className="lg:hidden fixed top-[82px] left-0 right-0 z-[400] px-4 pointer-events-none flex flex-col items-center gap-3">
      
      {/* PRIMARY ROW: Large Mode Toggles (As requested in red box) */}
      <div className="bg-black/80 backdrop-blur-2xl p-1.5 rounded-[1.5rem] border border-white/10 flex gap-1 shadow-2xl ring-1 ring-white/5 pointer-events-auto w-full max-w-[320px]">
        <button 
          onClick={() => setMobileTab('chat')} 
          className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${mobileTab === 'chat' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500'}`}
        >
          <MessageSquare size={16}/> <span>Chat</span>
        </button>
        <button 
          onClick={() => setMobileTab('preview')} 
          className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${mobileTab === 'preview' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500'}`}
        >
          <Smartphone size={16}/> <span>Visual</span>
        </button>
      </div>

      {/* SECONDARY ROW: Contextual Workspace Toggle (App/Admin) - Now strictly below Primary */}
      {mobileTab === 'preview' && (
        <div className="bg-black/60 backdrop-blur-xl p-1 rounded-[1.2rem] border border-white/5 flex gap-1 shadow-xl pointer-events-auto w-full max-w-[220px] animate-in slide-in-from-top-2 duration-500">
          <button 
            onClick={() => setWorkspace('app')}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${workspace === 'app' ? 'bg-pink-500/20 text-pink-500 border border-pink-500/20' : 'text-zinc-600'}`}
          >
            App
          </button>
          <button 
            onClick={() => setWorkspace('admin')}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${workspace === 'admin' ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/20' : 'text-zinc-600'}`}
          >
            Admin
          </button>
        </div>
      )}
    </div>

    {/* Floating Action Buttons Area (Bottom Right) */}
    <div className="lg:hidden fixed bottom-24 right-6 z-[400] pointer-events-auto flex flex-col gap-3">
      {/* Project Config Button (Settings) - Added for mobile */}
      <button 
        onClick={onOpenConfig}
        className="w-12 h-12 bg-zinc-900/80 backdrop-blur-xl rounded-2xl text-zinc-400 shadow-xl border border-white/10 flex items-center justify-center active:scale-90 transition-all"
        title="Project Config"
      >
        <Settings size={20} />
      </button>

      {/* Execute Build Button */}
      <button 
        onClick={handleBuildAPK} 
        className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl text-white shadow-[0_15px_30px_rgba(236,72,153,0.4)] active:scale-90 transition-all border border-white/20 flex items-center justify-center relative group"
      >
        <Rocket size={24} className="group-hover:animate-bounce" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-pink-600 animate-pulse">
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
