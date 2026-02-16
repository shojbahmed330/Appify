
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
    {/* Unified Mobile Command Center */}
    <div className="lg:hidden fixed top-[82px] left-0 right-0 z-[400] px-4 pointer-events-none flex flex-col items-center gap-3">
      <div className="w-full flex items-start justify-between gap-3 pointer-events-none">
        
        {/* Left Side: Mode Toggles */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-2xl p-1 rounded-[1.2rem] border border-white/10 flex gap-1 shadow-2xl ring-1 ring-white/5 w-[180px]">
            <button 
              onClick={() => setMobileTab('chat')} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${mobileTab === 'chat' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500'}`}
            >
              <MessageSquare size={12}/> <span>Chat</span>
            </button>
            <button 
              onClick={() => setMobileTab('preview')} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${mobileTab === 'preview' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500'}`}
            >
              <Smartphone size={12}/> <span>Visual</span>
            </button>
          </div>

          {/* Contextual Workspace Toggle (App/Admin) */}
          {mobileTab === 'preview' && (
            <div className="bg-black/60 backdrop-blur-xl p-1 rounded-[1rem] border border-white/5 flex gap-1 shadow-xl w-[160px] animate-in slide-in-from-left-2 duration-300">
              <button 
                onClick={() => setWorkspace('app')}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${workspace === 'app' ? 'text-pink-500' : 'text-zinc-600'}`}
              >
                App
              </button>
              <button 
                onClick={() => setWorkspace('admin')}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${workspace === 'admin' ? 'text-indigo-500' : 'text-zinc-600'}`}
              >
                Admin
              </button>
            </div>
          )}
        </div>

        {/* Right Side: High-Action Build Button (Moved from bottom to avoid input conflict) */}
        <button 
          onClick={handleBuildAPK} 
          className="pointer-events-auto w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl text-white shadow-[0_10px_20px_rgba(236,72,153,0.3)] active:scale-90 transition-all border border-white/20 flex items-center justify-center relative group"
        >
          <Rocket size={20} className="group-hover:animate-bounce" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-lg ring-1 ring-pink-600 animate-pulse">
             <Zap size={6} className="text-pink-600 fill-current" />
          </div>
        </button>
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
