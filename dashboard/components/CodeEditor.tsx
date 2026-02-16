
import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Settings, History, Code2, Terminal, PlusCircle, Search as SearchIcon, Brain } from 'lucide-react';
import FileTree from './FileTree';
import EditorTabs from './EditorTabs';
import ActivityBar, { SidebarView } from './ActivityBar';
import SearchPanel from './SearchPanel';
import ThinkingPanel from './ThinkingPanel';

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
  lastThought?: string;
  isGenerating?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  projectFiles, setProjectFiles, selectedFile, setSelectedFile, 
  handleBuildAPK, onOpenConfig, onOpenHistory,
  openTabs, openFile, closeFile, addFile, deleteFile, renameFile,
  lastThought, isGenerating
}) => {
  const [activeView, setActiveView] = useState<SidebarView>('explorer');
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'warn'}[]>([]);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setLogs(prev => [...prev.slice(-49), { msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type }]);
  };

  useEffect(() => {
    addLog(`Workspace Ready. ${Object.keys(projectFiles).length} files loaded.`, 'success');
  }, []);

  useEffect(() => {
    if (selectedFile) addLog(`Opened ${selectedFile}`);
  }, [selectedFile]);

  useEffect(() => {
    if (isGenerating) addLog(`Neural Engine: Processing Request...`, 'info');
    else if (lastThought) addLog(`Code Refactored Successfully.`, 'success');
  }, [isGenerating]);

  const handleViewChange = (view: SidebarView) => {
    if (view === 'history' && onOpenHistory) onOpenHistory();
    else if (view === 'config' && onOpenConfig) onOpenConfig();
    else setActiveView(view);
  };

  const lineCount = (projectFiles[selectedFile] || '').split('\n').length;

  return (
    <div className="flex-1 flex overflow-hidden">
      <ActivityBar activeView={activeView} onViewChange={handleViewChange} />

      <aside className={`w-72 border-r border-white/5 bg-[#09090b] hidden md:flex flex-col shrink-0 overflow-hidden`}>
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
           <SearchPanel files={projectFiles} onSelectFile={openFile} />
         )}

         {activeView === 'thinking' && (
           <ThinkingPanel thought={lastThought} isGenerating={isGenerating || false} />
         )}
         
         <div className="mt-auto p-4 border-t border-white/5 bg-black/20 max-h-40 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-2">
               <Terminal size={12} className="text-pink-500"/>
               <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Console Output</span>
            </div>
            <div className="space-y-1">
               {logs.map((log, i) => (
                  <div key={i} className={`text-[9px] font-mono leading-tight break-words ${log.type === 'success' ? 'text-green-500/60' : log.type === 'warn' ? 'text-yellow-500/60' : 'text-zinc-600'}`}>
                     {log.msg}
                  </div>
               ))}
               <div className="h-4"></div>
            </div>
         </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0c0e] overflow-hidden">
         <EditorTabs 
            tabs={openTabs} 
            activeTab={selectedFile} 
            onSelect={setSelectedFile} 
            onClose={closeFile} 
         />
         
         <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-2">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/5 rounded-xl border border-pink-500/20">
                    <Code2 size={12} className="text-pink-500"/>
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Studio Editor</span>
                  </div>
                  
                  <div className="flex items-center gap-4 border-l border-white/5 pl-4">
                    <button 
                      onClick={() => setActiveView('thinking')}
                      className={`text-[10px] font-black uppercase transition-colors flex items-center gap-2 ${activeView === 'thinking' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                      <Brain size={14}/> <span>Insights</span>
                    </button>
                    <button 
                      onClick={onOpenHistory}
                      className="text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <History size={14}/> <span>History</span>
                    </button>
                  </div>
               </div>
               
               <button onClick={handleBuildAPK} className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 shadow-lg shadow-pink-600/20 active:scale-95 transition-all">
                  <Rocket size={14}/> Build APK
               </button>
            </div>

            <div className="flex-1 w-full bg-black/60 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative flex group">
               {selectedFile ? (
                 <div className="flex-1 flex w-full h-full relative overflow-hidden">
                    {/* Line Numbers Simulation */}
                    <div className="w-12 bg-black/20 border-r border-white/5 py-8 text-right pr-3 font-mono text-[11px] text-zinc-700 select-none shrink-0 overflow-hidden">
                       {Array.from({ length: Math.max(lineCount, 50) }).map((_, i) => (
                         <div key={i} className="h-5 leading-5">{i + 1}</div>
                       ))}
                    </div>
                    <textarea 
                       ref={editorRef}
                       value={projectFiles[selectedFile] || ''} 
                       onChange={e => setProjectFiles(prev => ({...prev, [selectedFile]: e.target.value}))} 
                       className="flex-1 w-full bg-transparent py-8 px-6 font-mono text-[13px] text-zinc-300 outline-none resize-none custom-scrollbar leading-5 scroll-smooth whitespace-pre tab-size-2" 
                       spellCheck={false}
                       autoCapitalize="none"
                       autoComplete="off"
                    />
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                      <Code2 size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Select a component to debug</p>
                 </div>
               )}
               
               <div className="absolute bottom-6 right-8 text-[8px] font-black uppercase text-zinc-700 tracking-[0.5em] bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Uplink Active • Port 8080
               </div>
            </div>
         </div>
      </main>
    </div>
  );
};

export default CodeEditor;
