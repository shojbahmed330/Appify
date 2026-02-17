
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GithubConfig, BuildStep, User as UserType, ProjectConfig, Project, WorkspaceType } from '../types';
import { GeminiService } from '../services/geminiService';
import { DatabaseService, ProjectHistoryItem } from '../services/dbService';
import { GithubService } from '../services/githubService';
import { SelfHealingService } from '../services/selfHealingService';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'healing';
}

export const useAppLogic = (user: UserType | null, setUser: (u: UserType | null) => void) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(localStorage.getItem('active_project_id'));
  const [workspace, setWorkspace] = useState<WorkspaceType>('app');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairSuccess, setRepairSuccess] = useState(false);
  const [runtimeError, setRuntimeError] = useState<{ message: string; line: number; source: string; stack?: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [lastThought, setLastThought] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({
    'app/index.html': '<h1>Mobile Client</h1>',
    'admin/index.html': '<h1>Admin Panel</h1>'
  });
  
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({ appName: 'OneClickApp', packageName: 'com.oneclick.studio' });
  const [selectedFile, setSelectedFile] = useState('app/index.html');
  const [openTabs, setOpenTabs] = useState<string[]>(['app/index.html', 'admin/index.html']);
  const [githubConfig, setGithubConfig] = useState<GithubConfig>({ token: '', repo: '', owner: '' });
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [previewOverride, setPreviewOverride] = useState<Record<string, string> | null>(null);

  const gemini = useRef(new GeminiService());
  const healer = useRef(new SelfHealingService());
  const db = DatabaseService.getInstance();
  const github = useRef(new GithubService());
  const buildPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const repairAttempts = useRef<number>(0);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Error listener for iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RUNTIME_ERROR') {
        const error = event.data.error;
        console.error("Studio Captured Error:", error);
        
        // Prevent infinite loops if multiple errors occur in short succession
        if (repairAttempts.current > 3) {
            setRuntimeError(error);
            addToast("Auto-repair limit reached. Please check code manually.", "error");
            return;
        }

        setRuntimeError(error);
        if (!isRepairing && !isGenerating) {
            handleAutoFix(error);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isRepairing, isGenerating, addToast]);

  useEffect(() => {
    if (user && currentProjectId) {
      db.getProjectById(currentProjectId).then(p => {
        if (p) {
          setProjectFiles(p.files || {});
          if (p.config) setProjectConfig(p.config);
          loadHistory(currentProjectId);
        }
      });
    }
  }, [user, currentProjectId]);

  useEffect(() => {
    if (user) setGithubConfig({ token: user.github_token || '', owner: user.github_owner || '', repo: user.github_repo || '' });
  }, [user]);

  const [buildStatus, setBuildStatus] = useState<{ status: 'idle' | 'pushing' | 'building' | 'success' | 'error', message: string, apkUrl?: string, webUrl?: string, runUrl?: string }>({ status: 'idle', message: '' });
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadHistory = async (projectId: string) => {
    setIsHistoryLoading(true);
    try { setHistory(await db.getProjectHistory(projectId)); } finally { setIsHistoryLoading(false); }
  };

  const handleBuildAPK = async (navigateToProfile: () => void) => {
    if (!githubConfig.token) { navigateToProfile(); return; }
    setBuildSteps([]);
    setBuildStatus({ status: 'pushing', message: 'Syncing Workspace...' });
    
    try {
      const sanitizedName = (projectConfig.appName || 'OneClickApp').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const repoName = `${sanitizedName}-studio`;
      const owner = await github.current.createRepo(githubConfig.token, repoName);
      const updatedConfig = { ...githubConfig, owner, repo: repoName };
      setGithubConfig(updatedConfig);
      if (user) await db.updateGithubConfig(user.id, updatedConfig);
      
      await github.current.pushToGithub(updatedConfig, projectFiles, projectConfig);
      setBuildStatus({ status: 'building', message: 'Workflow Started...' });

      if (buildPollingRef.current) clearInterval(buildPollingRef.current);
      
      buildPollingRef.current = setInterval(async () => {
        const details = await github.current.getRunDetails(updatedConfig);
        if (!details) return;

        setBuildSteps(details.jobs.flatMap((j: any) => j.steps || []));

        if (details.run.status === 'completed') {
          if (buildPollingRef.current) clearInterval(buildPollingRef.current);
          
          if (details.run.conclusion === 'success') {
            const artifacts = await github.current.getLatestApk(updatedConfig);
            setBuildStatus({ 
              status: 'success', 
              message: 'Build Complete!', 
              apkUrl: artifacts?.downloadUrl, 
              webUrl: artifacts?.webUrl,
              runUrl: artifacts?.runUrl 
            });
          } else {
            setBuildStatus({ status: 'error', message: `Build Failed: ${details.run.conclusion?.toUpperCase()}` });
          }
        }
      }, 5000);
    } catch (e: any) {
      setBuildStatus({ status: 'error', message: e.message || "Failed to start build." });
    }
  };

  const handleSend = async (extraData?: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    repairAttempts.current = 0; // Reset repair attempts on new prompt
    try {
      const text = extraData || input;
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text, image: selectedImage?.preview }]);
      setInput(''); 
      setSelectedImage(null);

      const res = await gemini.current.generateWebsite(text, projectFiles, messages, selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined, user ? user.tokens > 100 : false, projectConfig);
      if (res.thought) setLastThought(res.thought);
      if (res.files) setProjectFiles(prev => ({ ...prev, ...res.files }));
      setMessages(prev => [...prev, { role: 'assistant', content: res.answer, questions: res.questions, files: res.files }]);
    } finally { setIsGenerating(false); }
  };

  const handleAutoFix = async (errorToFix?: any) => {
    const err = errorToFix || runtimeError;
    if (!err || isRepairing) return;

    setIsRepairing(true);
    repairAttempts.current++;
    
    try {
      const res = await healer.current.fixError(err, projectFiles, messages);
      if (res.files) {
        // BACKGROUND SYNC: Update project files immediately
        setProjectFiles(prev => ({ ...prev, ...res.files }));
        
        // REFRESH: By updating state, MobilePreview will re-render and the iframe srcDoc will refresh
        
        setRuntimeError(null);
        setRepairSuccess(true);
        
        // NOTIFICATION: Trigger success toast
        addToast("Error detected and fixed automatically!", "healing");

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `🛡️ **Self-Healing Active**: I detected an issue ("${err.message}") and automatically applied a fix. Workspace synchronized.`,
          files: res.files 
        }]);

        // Hide success animation after 2s
        setTimeout(() => setRepairSuccess(false), 2000);
      }
    } catch (e) {
      console.error("Auto-Fix Failed:", e);
      addToast("Automatic repair failed. Manual intervention needed.", "error");
    } finally {
      setIsRepairing(false);
    }
  };

  return {
    messages, setMessages, input, setInput, isGenerating, isRepairing, projectFiles, setProjectFiles,
    workspace, setWorkspace,
    selectedFile, setSelectedFile, openTabs, openFile: (path: string) => { if (!openTabs.includes(path)) setOpenTabs(prev => [...prev, path]); setSelectedFile(path); },
    closeFile: (path: string) => { setOpenTabs(prev => prev.filter(t => t !== path)); if (selectedFile === path) setSelectedFile(openTabs[0] || ''); },
    addFile: (path: string) => { setProjectFiles(prev => ({...prev, [path]: ''})); }, deleteFile: (path: string) => { const n = {...projectFiles}; delete n[path]; setProjectFiles(n); }, renameFile: (o:string, n:string) => { const x = {...projectFiles}; x[n] = x[o]; delete x[o]; setProjectFiles(x); },
    githubConfig, setGithubConfig, buildStatus, setBuildStatus, buildSteps, isDownloading, handleSend, handleBuildAPK,
    handleSecureDownload: async () => { if (!buildStatus.apkUrl) return; setIsDownloading(true); try { const blob = await github.current.downloadArtifact(githubConfig, buildStatus.apkUrl); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'build.zip'; a.click(); } finally { setIsDownloading(false); } },
    selectedImage, setSelectedImage, handleImageSelect: (file: File) => { const reader = new FileReader(); reader.onloadend = () => setSelectedImage({ data: (reader.result as string).split(',')[1], mimeType: file.type, preview: reader.result as string }); reader.readAsDataURL(file); }, 
    projectConfig, setProjectConfig, currentProjectId, loadProject: (p:Project) => { setCurrentProjectId(p.id); localStorage.setItem('active_project_id', p.id); setProjectFiles(p.files); if(p.config) setProjectConfig(p.config); loadHistory(p.id); },
    runtimeError, handleAutoFix, history, isHistoryLoading, showHistory, setShowHistory, handleRollback: async (f:any, m:string) => { setProjectFiles(f); setShowHistory(false); }, previewOverride, setPreviewOverride, refreshHistory: () => loadHistory(currentProjectId!), handleDeleteSnapshot: async (id:string) => { await db.deleteProjectSnapshot(id); loadHistory(currentProjectId!); }, lastThought,
    toasts, removeToast, repairSuccess
  };
};
