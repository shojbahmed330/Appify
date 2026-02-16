
import React from 'react';
import { FileCode, Rocket, Settings, History } from 'lucide-react';

interface CodeEditorProps {
  projectFiles: Record<string, string>;
  setProjectFiles: (files: any) => void;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  handleBuildAPK: () => void;
  onOpenConfig?: () => void;
  onOpenHistory?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  projectFiles, setProjectFiles, selectedFile, setSelectedFile, handleBuildAPK, onOpenConfig, onOpenHistory
}) => {
  return (
    <>
      <aside className="w-full md:w-64 border-r border-white/5 bg-black/20 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto max-h-[140px] md:max-h-none shrink-0 custom-scrollbar">
         <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 md:mb-4 px-2">Project Terminal</h3>
         {Object.keys(projectFiles).map(file => (
           <button 
             key={file} 
             onClick={() => setSelectedFile(file)} 
             className={`w-full flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs font-bold transition-all duration-300 ${selectedFile === file ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/10 scale-[1.01]' : 'text-zinc-500 hover:bg-white/5'}`}
           >
              <FileCode size={14} className={selectedFile === file ? 'text-white' : 'text-zinc-600'} /> {file}
           </button>
         ))}
      </aside>
      <main className="flex-1 bg-[#0c0c0e] p-3 md:p-4 flex flex-col min-h-0 overflow-hidden">
         <div className="flex items-center justify-between mb-3 md:mb-4 px-1">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="px-3 md:px-4 py-1.5 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[10px] md:text-xs font-mono text-pink-500 font-bold">{selectedFile}</span>
              </div>
              
              <div className="flex items-center gap-4 border-l border-white/5 pl-4 ml-1">
                {onOpenHistory && (
                  <button 
                    onClick={onOpenHistory}
                    className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-pink-500 hover:text-white transition-all bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20"
                  >
                    <History size={14}/> <span className="hidden sm:inline">Version History</span>
                  </button>
                )}
                
                {onOpenConfig && (
                  <button 
                    onClick={onOpenConfig}
                    className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-colors"
                  >
                    <Settings size={14}/> <span className="hidden sm:inline">Settings</span>
                  </button>
                )}
              </div>
            </div>
            <button onClick={handleBuildAPK} className="px-4 md:px-6 py-2 md:py-2.5 bg-pink-600 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-pink-500 transition-all active:scale-95 shadow-lg shadow-pink-600/10 shrink-0">
              <Rocket size={12}/> Run Cloud Build
            </button>
         </div>
         <div className="flex-1 w-full bg-black/40 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-inner flex flex-col relative">
            <textarea 
              value={projectFiles[selectedFile] || ''} 
              onChange={e => setProjectFiles(prev => ({...prev, [selectedFile]: e.target.value}))} 
              className="flex-1 w-full bg-transparent p-4 md:p-6 font-mono text-[11px] md:text-xs text-zinc-300 outline-none resize-none custom-scrollbar leading-relaxed" 
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
            />
            <div className="hidden md:block absolute bottom-4 right-4 text-[9px] font-black uppercase text-zinc-700 tracking-widest bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/5">
              Syntax Verified • OneClick Core
            </div>
         </div>
      </main>
    </>
  );
};

export default CodeEditor;
