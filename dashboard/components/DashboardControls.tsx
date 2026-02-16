
import React from 'react';
import { MessageSquare, Smartphone, Rocket, Zap, Monitor, SlidersHorizontal } from 'lucide-react';
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
    {/* High-Level Mobile Navigation Center */}
    <div className="lg:hidden fixed top-[75px] left-0 right-0 z-[400] px-4 pointer-events-none flex flex-col items-center">
      <div className="flex items-start justify-between w-full max-w-[500px]">
        
        {/* Main Control Cluster */}
        <div className="flex flex-col gap-2 pointer-events-auto w-full max-w-[280px]">
          {/* PRIMARY TOGGLE: Chat vs Visual */}
          <div className="bg-black/90 backdrop-blur-2xl p-1 rounded-[1.5rem] border border-white/10 flex gap-1 shadow-2xl ring-1 ring-white/5">
            <button 
              onClick={() => setMobileTab('chat')} 
              className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${mobileTab === 'chat' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500'}`}
            >
              <MessageSquare size={16}/> <span>Chat</span>
            </button>
            <button 
              onClick={() => setMobileTab('preview')} 
              className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${mobileTab === 'preview' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500'}`}
            >
              <Smartphone size={16}/> <span>Visual</span>
            </button>
          </div>

          {/* SECONDARY TOGGLE: App vs Admin (Only in Preview Mode) */}
          {mobileTab === 'preview' && (
            <div className="bg-zinc-900/80 backdrop-blur-xl p-1 rounded-2xl border border-white/5 flex gap-1 shadow-xl animate-in slide-in-from-top-2 duration-300 self-center w-[180px]">
              <button 
                onClick={() => setWorkspace('app')}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-xl text-[8px] font-black uppercase transition-all ${workspace === 'app' ? 'text-pink-500 bg-pink-500/10 border border-pink-500/20' : 'text-zinc-600 border border-transparent'}`}
              >
                App
              </button>
              <button 
                onClick={() => setWorkspace('admin')}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-xl text-[8px] font-black uppercase transition-all ${workspace === 'admin' ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-zinc-600 border border-transparent'}`}
              >
                Admin
              </button>
            </div>
          )}
        </div>

        {/* Action Column (Right) */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <button 
            onClick={handleBuildAPK} 
            className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl text-white shadow-xl active:scale-90 transition-all border border-white/20 flex items-center justify-center relative group"
          >
            <Rocket size={20} className="group-hover:animate-bounce" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-lg ring-1 ring-pink-600">
               <Zap size={6} className="text-pink-600 fill-current" />
            </div>
          </button>
          
          <button 
            onClick={onOpenConfig}
            className="w-12 h-12 bg-zinc-900/90 backdrop-blur-xl rounded-2xl text-zinc-400 shadow-xl border border-white/10 flex items-center justify-center active:scale-90 transition-all"
            title="Project Configuration"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>
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
