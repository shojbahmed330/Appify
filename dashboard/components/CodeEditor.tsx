
import React, { useState } from 'react';
import { Rocket, Settings, History, Code2, Terminal, PlusCircle, Search as SearchIcon } from 'lucide-react';
import FileTree from './FileTree';
import EditorTabs from './EditorTabs';
import ActivityBar from './ActivityBar';

interface CodeEditorProps {
  projectFiles: Record<string, string>;
  setProjectFiles: (files: any) => void;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  handleBuildAPK: () => void;
  onOpenConfig?: () => void;
  onOpenHistory?: () => void;
  openTabs: string[];
  openFile: (path: string) => void;
  closeFile: (path: string, e?: React.MouseEvent) => void;
  addFile?: (path: string) => void;
  deleteFile?: (path: string) => void;
  renameFile?: (old: string, next: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  projectFiles, setProjectFiles, selectedFile, setSelectedFile, 
  handleBuildAPK, onOpenConfig, onOpenHistory,
  openTabs, openFile, closeFile, addFile, deleteFile, renameFile
}) => {
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'history' | 'config'>('explorer');

  const handleViewChange = (view: any) => {
    if (view === 'history' && onOpenHistory) onOpenHistory();
    else if (view === 'config' && onOpenConfig) onOpenConfig();
    else setActiveView(view);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Step 4: Activity Bar (Narrow VS Code style sidebar) */}
      <ActivityBar activeView={activeView} onViewChange={handleViewChange} />

      {/* Sidebar Content */}
      <aside className={`w-64 border-r border-white/5 bg-[#09090b] hidden md:flex flex-col shrink-0 overflow-hidden ${activeView !== 'explorer' && activeView !== 'search' ? 'hidden' : ''}`}>
         {activeView === 'explorer' && (
           <FileTree 
             files={projectFiles} 
             selectedFile={selectedFile} 
             onSelectFile={openFile}
             onAddFile={addFile || (() => {})}
             onDeleteFile={deleteFile || (() => {})}
             onRenameFile={renameFile || (() => {})}
           />
         )}

         {activeView === 'search' && (
            <div className="flex-1 flex flex-col p-4 space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Search Workspace</h3>
               <div className="relative">
                  <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[11px] text-white outline-none focus:border-pink-500/30" placeholder="Find content..." />
               </div>
               <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-2">
                  <SearchIcon size={24} />
                  <span className="text-[9px] font-black uppercase">No results found</span>
               </div>
            </div>
         )}
         
         <div className="mt-auto p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 text-[9px] font-black uppercase text-zinc-600 tracking-widest">
               <Terminal size={12} className="text-pink-500"/> Console Ready
            </div>
         </div>
      </aside>

      {/* Main Content: Tabs + Editor */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0c0e] overflow-hidden">
         <EditorTabs 
            tabs={openTabs} 
            activeTab={selectedFile} 
            onSelect={setSelectedFile} 
            onClose={closeFile} 
         />
         
         <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-4 px-2">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/5 rounded-xl border border-pink-500/20">
                    <Code2 size={12} className="text-pink-500"/>
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Editor Core</span>
                  </div>
                  
                  <div className="flex items-center gap-4 border-l border-white/5 pl-4">
                    <button 
                      onClick={onOpenHistory}
                      className="text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <History size={14}/> <span>History</span>
                    </button>
                    
                    <button 
                      onClick={onOpenConfig}
                      className="text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Settings size={14}/> <span>Config</span>
                    </button>
                  </div>
               </div>
               
               <button onClick={handleBuildAPK} className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 shadow-lg shadow-pink-600/20 active:scale-95 transition-all">
                  <Rocket size={14}/> Cloud Build
               </button>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 w-full bg-black/60 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col group">
               {selectedFile ? (
                 <textarea 
                    value={projectFiles[selectedFile] || ''} 
                    onChange={e => setProjectFiles(prev => ({...prev, [selectedFile]: e.target.value}))} 
                    className="flex-1 w-full bg-transparent p-8 font-mono text-[13px] text-zinc-300 outline-none resize-none custom-scrollbar leading-relaxed scroll-smooth" 
                    spellCheck={false}
                    autoCapitalize="none"
                    autoComplete="off"
                 />
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                      <Code2 size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Select a file to begin coding</p>
                 </div>
               )}
               
               <div className="absolute bottom-6 right-8 text-[9px] font-black uppercase text-zinc-700 tracking-[0.4em] bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Syntax Safe • Studio Engine
               </div>
            </div>
         </div>
      </main>
    </div>
  );
};

export default CodeEditor;
