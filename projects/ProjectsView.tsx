
import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, Search, Trash2, Edit3, 
  Calendar, Loader2, AlertCircle, 
  ChevronRight, Save, X, PlusCircle, Layers, Box,
  Clock, CheckCircle2, LayoutGrid, List, Database,
  ShieldCheck, HardDrive, Terminal, FileCode
} from 'lucide-react';
import { Project } from '../types';
import { DatabaseService } from '../services/dbService';
import { useLanguage } from '../i18n/LanguageContext';

interface ProjectsViewProps {
  userId: string;
  currentFiles: Record<string, string>;
  onLoadProject: (project: Project) => void;
  onSaveCurrent: (name: string) => Promise<any>;
  onCreateNew: (name: string) => Promise<any>;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  userId, onLoadProject, onSaveCurrent, onCreateNew 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  
  const [showModal, setShowModal] = useState<'save' | 'new' | null>(null);
  const [projectNameInput, setProjectNameInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const db = DatabaseService.getInstance();

  const fetchProjects = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await db.getProjects(userId);
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Projects Fetch Error:", e);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userId]);

  const handleAction = async () => {
    if (!projectNameInput.trim()) return;
    setIsProcessing(true);
    try {
      const cleanName = projectNameInput.trim();
      let newProj;
      if (showModal === 'save') {
        newProj = await onSaveCurrent(cleanName);
      } else {
        newProj = await onCreateNew(cleanName);
      }
      
      setShowModal(null);
      setProjectNameInput('');
      await fetchProjects();
      
      if (newProj) onLoadProject(newProj);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      alert("Critical: No session detected.");
      return;
    }

    const confirmed = window.confirm("SECURITY ALERT: This will permanently erase this project stub from the cloud. Proceed?");
    if (!confirmed) return;
    
    setDeletingId(id);
    try {
      // Direct deletion with strict error catching
      await db.deleteProject(userId, id);

      // Verify and sync state
      setProjects(prev => prev.filter(p => p.id !== id));
      
      if (localStorage.getItem('active_project_id') === id) {
        localStorage.removeItem('active_project_id');
      }
      
      console.log(`Resource ${id} terminated successfully.`);
    } catch (err: any) {
      console.error("Deletion protocol failed:", err);
      alert("System Error: Could not terminate project. Reason: " + (err.message || "Access Denied"));
      // Refresh to ensure UI matches database
      fetchProjects();
    } finally {
      setDeletingId(null);
    }
  };

  const handleRenameClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRenaming(project.id);
    setRenameValue(project.name);
  };

  const handleRenameSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!renameValue.trim()) return;
    try {
      await db.renameProject(userId, id, renameValue);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: renameValue } : p));
      setIsRenaming(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredProjects = projects.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-[#020617] custom-scrollbar text-zinc-100">
      <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in duration-1000">
        
        {/* Top Professional Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="p-7 bg-cyan-500/10 rounded-[2rem] border border-cyan-500/20 text-cyan-400 shadow-inner group-hover:scale-105 transition-transform duration-500">
              <HardDrive size={40}/>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase flex flex-col md:flex-row items-center gap-3">
                Managed <span className="text-cyan-400">Workspace</span>
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                   <Database size={14} className="text-cyan-500"/>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{projects.length} Total Units</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Cloud Sync Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus-within:border-cyan-500/40 transition-all min-w-[320px] shadow-inner">
              <Search className="text-zinc-600" size={20}/>
              <input 
                type="text" 
                placeholder="Query stubs..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white ml-4 w-full placeholder:text-zinc-800 font-bold tracking-[0.1em]"
              />
            </div>
            
            <div className="flex bg-slate-950/40 p-2 rounded-2xl border border-white/5 shadow-inner">
               <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-cyan-600 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}><LayoutGrid size={20}/></button>
               <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}><List size={20}/></button>
            </div>

            <button 
              onClick={() => setShowModal('new')}
              className="px-8 py-5 bg-slate-800 border border-slate-700 rounded-2xl font-black uppercase text-[10px] text-zinc-300 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-3 active:scale-95 shadow-xl"
            >
              <PlusCircle size={20}/> New Stub
            </button>
            
            <button 
              onClick={() => setShowModal('save')}
              className="px-10 py-5 bg-cyan-600 rounded-2xl font-black uppercase text-[10px] text-white shadow-2xl shadow-cyan-900/30 hover:bg-cyan-500 transition-all flex items-center gap-3 active:scale-95"
            >
              <Save size={20}/> Archive Current
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl animate-pulse rounded-full"></div>
              <Loader2 className="animate-spin text-cyan-500 relative z-10" size={60}/>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700">Polling Cloud Nodes...</span>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "space-y-6"}>
            {filteredProjects.map((project) => {
              const isActive = localStorage.getItem('active_project_id') === project.id;
              const fileCount = project.files ? Object.keys(project.files).length : 0;
              const isBeingDeleted = deletingId === project.id;
              
              if (viewMode === 'list') {
                return (
                  <div key={project.id} className={`group flex items-center justify-between p-8 rounded-[2rem] bg-slate-900/30 border transition-all ${isActive ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/5 hover:bg-slate-900/60 hover:border-cyan-500/20'} ${isBeingDeleted ? 'opacity-30' : ''}`}>
                    <div className="flex items-center gap-10">
                      <div className={`p-5 rounded-2xl ${isActive ? 'bg-cyan-500 text-white shadow-xl' : 'bg-slate-800 text-zinc-500 group-hover:text-cyan-400'}`}>
                        <FileCode size={24}/>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-black text-white text-xl group-hover:text-cyan-400 transition-colors tracking-tight">{project.name}</h4>
                        <div className="flex items-center gap-6">
                          <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] flex items-center gap-2"><Clock size={14}/> {new Date(project.updated_at).toLocaleDateString()}</span>
                          <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] flex items-center gap-2"><Layers size={14}/> {fileCount} Files</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <button 
                        disabled={isBeingDeleted}
                        onClick={(e) => handleDelete(e, project.id)} 
                        className="p-4 bg-red-500/5 text-zinc-800 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20"
                      >
                        {isBeingDeleted ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20}/>}
                      </button>
                      <button onClick={() => onLoadProject(project)} className={`px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all ${isActive ? 'bg-cyan-600 text-white shadow-xl' : 'bg-slate-800 text-zinc-400 hover:text-white hover:bg-cyan-600'}`}>Mount</button>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={project.id} 
                  className={`group relative p-10 rounded-[3.5rem] bg-slate-900/30 border transition-all duration-700 flex flex-col gap-12 overflow-hidden ${isActive ? 'border-cyan-500/40 ring-1 ring-cyan-500/20 shadow-2xl' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/60'} ${isBeingDeleted ? 'opacity-30 grayscale' : ''}`}
                >
                  <div className={`absolute -top-32 -right-32 w-80 h-80 blur-[120px] rounded-full transition-opacity duration-1000 ${isActive ? 'bg-cyan-500/10 opacity-100' : 'bg-cyan-500/5 opacity-0 group-hover:opacity-100'}`}></div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-5">
                        <div className={`p-5 rounded-[1.75rem] transition-all ${isActive ? 'bg-cyan-600 text-white shadow-2xl shadow-cyan-900/40' : 'bg-slate-800 text-zinc-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/5'}`}>
                          <Box size={32}/>
                        </div>
                        {isActive && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Live Stub</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {isRenaming === project.id ? (
                          <form onSubmit={(e) => handleRenameSubmit(e, project.id)} className="flex items-center gap-2">
                            <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onBlur={() => setIsRenaming(null)} className="bg-black/60 border border-cyan-500/40 rounded-2xl px-6 py-4 text-sm text-white outline-none w-full font-bold shadow-inner" />
                          </form>
                        ) : (
                          <h4 className="text-3xl font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1 tracking-tighter uppercase">
                            {project.name}
                          </h4>
                        )}
                        <div className="flex items-center gap-4 text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                          <Clock size={16} className="opacity-40"/> {new Date(project.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-10 group-hover:translate-x-0 duration-500">
                      <button onClick={(e) => handleRenameClick(e, project)} className="p-4 bg-slate-800 hover:bg-cyan-600 text-zinc-500 hover:text-white rounded-2xl transition-all border border-white/5 shadow-xl"><Edit3 size={18}/></button>
                      <button 
                        disabled={isBeingDeleted}
                        onClick={(e) => handleDelete(e, project.id)} 
                        className="p-4 bg-red-900/10 hover:bg-red-600 text-zinc-800 hover:text-white rounded-2xl transition-all border border-red-500/10 shadow-xl"
                      >
                        {isBeingDeleted ? <Loader2 size={18} className="animate-spin text-red-500" /> : <Trash2 size={18}/>}
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto space-y-8 relative z-10">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-4">
                          <Layers size={18} className="text-cyan-500/50"/>
                          <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em]">
                            {fileCount} Production Files
                          </span>
                       </div>
                       <div className="text-[11px] font-mono text-zinc-800">#{project.id.slice(0, 6)}</div>
                    </div>
                    
                    <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div className={`h-full transition-all duration-[2s] rounded-full ${isActive ? 'bg-cyan-500 w-full shadow-[0_0_20px_#06b6d4]' : 'bg-zinc-800 w-[60%]'}`}></div>
                    </div>

                    <button 
                      onClick={() => onLoadProject(project)}
                      className={`w-full py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 group/btn shadow-2xl ${isActive ? 'bg-cyan-600 text-white shadow-cyan-950/40' : 'bg-slate-800 text-zinc-500 hover:text-white hover:bg-cyan-600'}`}
                    >
                      {isActive ? <ShieldCheck size={22}/> : <ChevronRight size={22} className="group-hover/btn:translate-x-2 transition-transform"/>}
                      {isActive ? 'CURRENTLY ACTIVE' : 'INITIALIZE STUDIO'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/20 p-24 rounded-[4rem] text-center border-dashed border-zinc-800 border-2 max-w-4xl mx-auto space-y-12 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyan-500/[0.02] -z-10 group-hover:bg-cyan-500/[0.04] transition-colors"></div>
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse"></div>
               <div className="w-36 h-36 bg-cyan-600/10 rounded-[3rem] flex items-center justify-center mx-auto text-cyan-500 border border-cyan-500/20 relative z-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700 shadow-2xl">
                  <Terminal size={64}/>
               </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Repository Offline</h3>
              <p className="text-[11px] text-zinc-600 uppercase font-black tracking-[0.5em] max-w-sm mx-auto leading-loose">No active production stubs detected in your cloud storage cluster.</p>
            </div>
            <button 
              onClick={() => setShowModal('new')}
              className="px-16 py-7 bg-cyan-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] hover:bg-cyan-500 transition-all shadow-2xl shadow-cyan-950/40 active:scale-95"
            >
              Initialize Node
            </button>
          </div>
        )}
      </div>

      {/* Enterprise Modal System */}
      {showModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950/98 backdrop-blur-2xl p-6 animate-in fade-in duration-500">
           <div className="bg-slate-900 border border-white/5 p-16 rounded-[4rem] w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-700 ring-1 ring-white/10">
              <button onClick={() => setShowModal(null)} className="absolute top-12 right-12 p-4 bg-white/5 hover:bg-red-500/20 rounded-2xl text-zinc-600 hover:text-red-500 transition-all"><X size={28}/></button>
              
              <div className="text-center mb-14">
                <div className="w-28 h-28 bg-cyan-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-cyan-400 border border-cyan-500/20 shadow-inner">
                  {showModal === 'save' ? <Save size={44}/> : <PlusCircle size={44}/>}
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">
                  {showModal === 'save' ? 'Archive' : 'Initialize'} <span className="text-cyan-500">Resource</span>
                </h3>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600 mt-5">Assign unique metadata identity</p>
              </div>

              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-zinc-500 ml-8 tracking-[0.3em]">Resource Stub Name</label>
                  <input 
                    autoFocus 
                    value={projectNameInput} 
                    onChange={e => setProjectNameInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAction()} 
                    placeholder="e.g. Finance Hub v1.0" 
                    className="w-full bg-black/50 border border-white/10 rounded-[2.5rem] p-8 text-white text-lg outline-none focus:border-cyan-500/50 transition-all font-black placeholder:text-zinc-800 shadow-inner" 
                  />
                </div>
                
                <button 
                  disabled={isProcessing || !projectNameInput.trim()} 
                  onClick={handleAction} 
                  className="w-full py-8 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2.5rem] font-black uppercase text-sm tracking-[0.4em] shadow-2xl shadow-cyan-900/40 active:scale-95 transition-all flex items-center justify-center gap-5 group"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={28}/>
                  ) : (
                    <>Deploy to Cluster <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform"/></>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
