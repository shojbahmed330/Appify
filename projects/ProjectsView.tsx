
import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, Search, Trash2, Edit3, 
  Calendar, Loader2, AlertCircle, 
  ChevronRight, Save, X, PlusCircle
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
      alert(t('common.error') + ": " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(t('projects.delete_confirm'))) return;
    setDeletingId(id);
    try {
      await db.deleteProject(userId, id);
      if (localStorage.getItem('active_project_id') === id) {
        localStorage.removeItem('active_project_id');
      }
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(t('common.error') + ": " + err.message);
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

  const filteredProjects = Array.isArray(projects) 
    ? projects.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())) 
    : [];

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-[#09090b]">
      <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-4">
              <FolderKanban className="text-pink-500" size={32}/>
              {t('projects.title').split(' ')[0]} <span className="text-pink-500">{t('projects.title').split(' ')[1]}</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mt-2">
              {t('projects.subtitle')}
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setShowModal('new')}
              className="px-6 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl font-black uppercase text-[10px] text-zinc-300 hover:bg-zinc-700 transition-all flex items-center gap-3 active:scale-95"
            >
              <PlusCircle size={16}/> {t('projects.new_project')}
            </button>
            <button 
              onClick={() => setShowModal('save')}
              className="px-8 py-4 bg-pink-600 rounded-2xl font-black uppercase text-[10px] text-white shadow-lg shadow-pink-500/20 hover:bg-pink-500 transition-all flex items-center gap-3 active:scale-95"
            >
              <Save size={16}/> {t('projects.save_current')}
            </button>
          </div>
        </div>

        <div className="glass-tech p-2 rounded-2xl border-white/5 flex items-center gap-4 focus-within:border-pink-500/30 transition-all">
          <div className="pl-4"><Search className="text-slate-500" size={20}/></div>
          <input 
            type="text" 
            placeholder={t('projects.search')} 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent py-4 text-sm outline-none text-white placeholder:text-zinc-700"
          />
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-pink-500" size={32}/>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{t('common.loading')}</span>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className={`glass-tech group p-6 rounded-[2.5rem] border-white/5 transition-all flex flex-col gap-6 relative overflow-hidden ${localStorage.getItem('active_project_id') === project.id ? 'border-pink-500/40 ring-1 ring-pink-500/20' : 'hover:border-pink-500/20'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-1 flex-1">
                    {isRenaming === project.id ? (
                      <form onSubmit={(e) => handleRenameSubmit(e, project.id)} className="flex items-center gap-2">
                        <input 
                          autoFocus
                          value={renameValue} 
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => setIsRenaming(null)}
                          className="bg-black/40 border border-pink-500/40 rounded-lg px-3 py-1 text-sm text-white outline-none w-full"
                        />
                        <button type="submit" className="text-green-400"><Save size={16}/></button>
                      </form>
                    ) : (
                      <h4 className="text-xl font-black text-white group-hover:text-pink-400 transition-colors line-clamp-1">{project.name}</h4>
                    )}
                    <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                      <Calendar size={10}/> {new Date(project.updated_at).toLocaleDateString()}
                      {localStorage.getItem('active_project_id') === project.id && (
                        <span className="ml-2 text-pink-500 font-black">• {t('projects.active')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleRenameClick(e, project)} 
                      className="p-2 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-colors"
                    >
                      <Edit3 size={16}/>
                    </button>
                    <button 
                      disabled={deletingId === project.id}
                      onClick={(e) => handleDelete(e, project.id)} 
                      className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deletingId === project.id ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Trash2 size={16}/>}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                   <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 w-[60%] opacity-20"></div>
                   </div>
                   <span className="text-[9px] font-black uppercase text-zinc-700">{project.files ? Object.keys(project.files).length : 0} Files</span>
                </div>

                <button 
                  onClick={() => onLoadProject(project)}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative z-10 ${localStorage.getItem('active_project_id') === project.id ? 'bg-pink-600 text-white' : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'}`}
                >
                  {localStorage.getItem('active_project_id') === project.id ? t('projects.active') : t('projects.mount')} <ChevronRight size={14}/>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-tech p-20 rounded-[3rem] text-center border-dashed border-zinc-800 border-2">
            <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-500">
               <AlertCircle size={40}/>
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase">{t('projects.no_projects')}</h3>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto leading-relaxed uppercase tracking-widest">{t('projects.empty_desc')}</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
           <div className="glass-tech p-10 rounded-[3rem] w-full max-w-md border-pink-500/20 shadow-2xl relative">
              <button onClick={() => setShowModal(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={20}/></button>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{showModal === 'save' ? 'Archive' : 'New'} <span className="text-pink-500">Project</span></h3>
              <div className="space-y-6 mt-6">
                <input autoFocus value={projectNameInput} onChange={e => setProjectNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAction()} placeholder="Project Name..." className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-white outline-none" />
                <button disabled={isProcessing || !projectNameInput.trim()} onClick={handleAction} className="w-full py-5 bg-pink-600 rounded-2xl font-black uppercase text-[10px] text-white shadow-lg active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin mx-auto" size={16}/> : t('common.confirm')}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
