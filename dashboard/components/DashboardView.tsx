
import React from 'react';
import { Rocket, Zap, Smartphone, MessageSquare, Settings } from 'lucide-react';
import { AppMode, BuildStep, ProjectConfig } from '../types';

// Sub-components
import ChatBox from './components/ChatBox';
import MobilePreview from './components/MobilePreview';
import CodeEditor from './components/CodeEditor';
import BuildStatusDisplay from './components/BuildStatusDisplay.tsx';
import AppConfigView from './components/AppConfigView';

interface DashboardViewProps {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  messages: any[];
  input: string;
  setInput: (s: string) => void;
  isGenerating: boolean;
  projectFiles: Record<string, string>;
  setProjectFiles: (files: any) => void;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  buildStatus: { status: string; message: string; apkUrl?: string; webUrl?: string };
  setBuildStatus: (s: any) => void;
  buildSteps: BuildStep[];
  mobileTab: 'chat' | 'preview';
  setMobileTab: (t: 'chat' | 'preview') => void;
  handleSend: () => void;
  handleBuildAPK: () => void;
  handleSecureDownload: () => void;
  isDownloading: boolean;
  selectedImage: any;
  setSelectedImage: (img: any) => void;
  handleImageSelect: (file: File) => void;
  projectConfig: ProjectConfig;
  setProjectConfig: (config: ProjectConfig) => void;
  projectId?: string | null;
}

const DashboardView: React.FC<DashboardViewProps> = (props) => {
  if (props.mode === AppMode.PREVIEW) {
    return (
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-[#09090b]">
        <div className="flex-1 flex flex-col lg:flex-row h-full">
          <ChatBox 
            messages={props.messages} input={props.input} setInput={props.setInput} 
            isGenerating={props.isGenerating} handleSend={props.handleSend} mobileTab={props.mobileTab} 
            selectedImage={props.selectedImage} setSelectedImage={props.setSelectedImage}
            handleImageSelect={props.handleImageSelect}
          />
          <MobilePreview 
            projectFiles={props.projectFiles} setMode={props.setMode} 
            handleBuildAPK={props.handleBuildAPK} mobileTab={props.mobileTab}
            isGenerating={props.isGenerating}
            projectConfig={props.projectConfig}
            projectId={props.projectId}
          />
        </div>

        {/* --- MOBILE UI CONTROLS (FIXED AT TOP) --- */}
        <div className="lg:hidden fixed top-[72px] left-1/2 -translate-x-1/2 z-[200] flex gap-3 items-center">
            <div className="bg-black/60 backdrop-blur-3xl p-1.5 rounded-2xl border border-white/10 flex gap-1 shadow-2xl ring-1 ring-white/5">
              <button 
                onClick={() => props.setMobileTab('chat')} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${props.mobileTab === 'chat' ? 'bg-pink-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'text-zinc-500'}`}
              >
                <MessageSquare size={14}/> <span>Chat</span>
              </button>
              <button 
                onClick={() => props.setMobileTab('preview')} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${props.mobileTab === 'preview' ? 'bg-pink-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'text-zinc-500'}`}
              >
                <Smartphone size={14}/> <span>Visual</span>
              </button>
            </div>

            <button 
              onClick={props.handleBuildAPK}
              className="bg-gradient-to-br from-pink-600 to-pink-700 p-3.5 rounded-2xl text-white shadow-[0_0_25px_rgba(236,72,153,0.3)] active:scale-90 transition-all border border-white/10"
            >
              <Rocket size={18} />
            </button>
        </div>

        {/* Desktop Floating Build Button */}
        <div className="hidden lg:block fixed bottom-12 right-12 z-[200] animate-in slide-in-from-right-10 duration-1000">
           <button 
             onClick={props.handleBuildAPK}
             className="group relative flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 bg-[length:200%_auto] hover:bg-right rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] text-white shadow-[0_15px_40px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95 transition-all duration-700 ring-1 ring-white/20"
           >
              <div className="relative z-10 flex items-center gap-3">
                 <Rocket size={20} className="group-hover:animate-bounce" />
                 <span>Execute Build</span>
                 <Zap size={14} className="text-white/60 group-hover:animate-pulse" />
              </div>
           </button>
        </div>
      </div>
    );
  }

  if (props.mode === AppMode.CONFIG) {
    return (
      <AppConfigView 
        config={props.projectConfig} 
        onUpdate={props.setProjectConfig} 
        onBack={() => props.setMode(AppMode.EDIT)} 
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-500 bg-[#09090b]">
      {props.buildStatus.status === 'idle' ? (
        <div className="flex-1 flex overflow-hidden">
          <CodeEditor 
            projectFiles={props.projectFiles} setProjectFiles={props.setProjectFiles} 
            selectedFile={props.selectedFile} setSelectedFile={props.setSelectedFile} 
            handleBuildAPK={props.handleBuildAPK} 
            onOpenConfig={() => props.setMode(AppMode.CONFIG)}
          />
        </div>
      ) : (
        <BuildStatusDisplay 
          status={props.buildStatus.status} 
          message={props.buildStatus.message}
          apkUrl={props.buildStatus.apkUrl} 
          webUrl={props.buildStatus.webUrl}
          buildSteps={props.buildSteps}
          handleSecureDownload={props.handleSecureDownload}
          resetBuild={() => props.setBuildStatus({ status: 'idle', message: '' })}
        />
      )}
    </div>
  );
};

export default DashboardView;
