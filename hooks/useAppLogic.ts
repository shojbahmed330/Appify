
import React, { useState, useRef, useEffect } from 'react';
import { GithubConfig, BuildStep, User as UserType, ProjectConfig, Project } from '../types';
import { GeminiService } from '../services/geminiService';
import { DatabaseService, ProjectHistoryItem } from '../services/dbService';
import { GithubService } from '../services/githubService';

export const useAppLogic = (user: UserType | null, setUser: (u: UserType | null) => void) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(localStorage.getItem('active_project_id'));
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [runtimeError, setRuntimeError] = useState<{ message: string; line: number; source: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [lastThought, setLastThought] = useState<string>('');
  
  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedImage({
        data: base64.split(',')[1] || '',
        mimeType: file.type,
        preview: base64
      });
    };
    reader.readAsDataURL(file);
  };

  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({
    'app/index.html': '<div style="background:#09090b; color:#f4f4f5; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding: 20px;"><h1>📱 Mobile Client</h1><p style="opacity:0.6">This is your main user application.</p></div>',
    'admin/index.html': '<div style="background:#0c0c0e; color:#f4f4f5; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding: 20px;"><h1>💻 Admin Panel</h1><p style="opacity:0.6">Control your business and data from here.</p></div>'
  });
  
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    appName: 'OneClickApp',
    packageName: 'com.oneclick.studio'
  });

  const [selectedFile, setSelectedFile] = useState('app/index.html');
  const [openTabs, setOpenTabs] = useState<string[]>(['app/index.html', 'admin/index.html']);
  
  const [githubConfig, setGithubConfig] = useState<GithubConfig>({ 
    token: '', repo: '', owner: '' 
  });

  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [previewOverride, setPreviewOverride] = useState<Record<string, string> | null>(null);

  const gemini = useRef(new GeminiService());
  const db = DatabaseService.getInstance();
  const github = useRef(new GithubService());
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !currentProjectId || isGenerating) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await db.updateProject(user.id, currentProjectId, projectFiles, projectConfig);
      } catch (e) { console.error("Auto-save failed:", e); }
    }, 3000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [projectFiles, projectConfig, currentProjectId, user, isGenerating]);

  useEffect(() => {
    if (user && currentProjectId) {
      db.getProjectById(currentProjectId).then(p => {
        if (p) {
          setProjectFiles(p.files || {});
          if (p.config) setProjectConfig(p.config);
          const files = p.files || {};
          const entry = files['app/index.html'] ? 'app/index.html' : (Object.keys(files)[0] || '');
          setSelectedFile(entry);
          setOpenTabs(entry ? [entry] : []);
          loadHistory(currentProjectId);
        }
      });
    }
  }, [user, currentProjectId]);

  useEffect(() => {
    if (user) {
      setGithubConfig({
        token: user.github_token || '',
        owner: user.github_owner || '',
        repo: user.github_repo || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RUNTIME_ERROR') setRuntimeError(event.data.error);
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);
  
  const [buildStatus, setBuildStatus] = useState<{ status: 'idle' | 'pushing' | 'building' | 'success' | 'error', message: string, apkUrl?: string, webUrl?: string }>({ status: 'idle', message: '' });
  const [buildStatusSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadHistory = async (projectId: string) => {
    if (!projectId) return;
    setIsHistoryLoading(true);
    try {
      const data = await db.getProjectHistory(projectId);
      setHistory(data);
    } finally { setIsHistoryLoading(false); }
  };

  const loadProject = (project: Project) => {
    setCurrentProjectId(project.id);
    localStorage.setItem('active_project_id', project.id);
    setProjectFiles(project.files || {});
    if (project.config) setProjectConfig(project.config);
    const entry = project.files['app/index.html'] ? 'app/index.html' : (Object.keys(project.files)[0] || '');
    setSelectedFile(entry);
    setOpenTabs(entry ? [entry] : []);
    loadHistory(project.id);
  };

  const openFile = (path: string) => {
    if (!openTabs.includes(path)) setOpenTabs(prev => [...prev, path]);
    setSelectedFile(path);
  };

  const closeFile = (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newTabs = openTabs.filter(t => t !== path);
    setOpenTabs(newTabs);
    if (selectedFile === path && newTabs.length > 0) setSelectedFile(newTabs[newTabs.length - 1]);
    else if (newTabs.length === 0) setSelectedFile('');
  };

  const addFile = (path: string) => {
    if (projectFiles[path]) return;
    setProjectFiles(prev => ({ ...prev, [path]: '' }));
    openFile(path);
  };

  const deleteFile = (path: string) => {
    const next = { ...projectFiles };
    delete next[path];
    setProjectFiles(next);
    closeFile(path);
  };

  const renameFile = (oldPath: string, newPath: string) => {
    if (projectFiles[newPath]) return;
    const next = { ...projectFiles };
    next[newPath] = next[oldPath];
    delete next[oldPath];
    setProjectFiles(next);
    setOpenTabs(prev => prev.map(t => t === oldPath ? newPath : t));
    if (selectedFile === oldPath) setSelectedFile(newPath);
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!currentProjectId) return;
    try {
      await db.deleteProjectSnapshot(snapshotId);
      setHistory(prev => prev.filter(h => h.id !== snapshotId));
    } catch (e) { alert("Failed to delete snapshot."); }
  };

  const handleRollback = async (files: Record<string, string>, message: string) => {
    if (!currentProjectId || !user) return;
    setProjectFiles(files);
    setPreviewOverride(null);
    await db.updateProject(user.id, currentProjectId, files, projectConfig);
    const rollbackMsg = `Rollback to: ${message}`;
    if (history.length >= 10) await db.deleteProjectSnapshot(history[history.length - 1].id);
    await db.createProjectSnapshot(currentProjectId, files, rollbackMsg);
    await loadHistory(currentProjectId);
    setShowHistory(false);
  };

  const handleSend = async (extraData?: string) => {
    if ((!input.trim() && !selectedImage && !extraData) || isGenerating) return;
    const text = extraData || input; 
    const currentImage = selectedImage;
    setIsGenerating(true);
    setRuntimeError(null);

    try {
      let activeProjectId = currentProjectId;
      if (!activeProjectId && user) {
        const autoProj = await db.saveProject(user.id, "Auto-saved Project", projectFiles, projectConfig);
        activeProjectId = autoProj.id;
        setCurrentProjectId(activeProjectId);
        localStorage.setItem('active_project_id', activeProjectId);
        await db.createProjectSnapshot(activeProjectId, projectFiles, "Initial Project Setup");
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text, image: currentImage?.preview, timestamp: Date.now() }]);
      setInput(''); 
      setSelectedImage(null);

      const usePro = user ? user.tokens > 100 : false;
      const res = await gemini.current.generateWebsite(text, projectFiles, messages, currentImage ? { data: currentImage.data, mimeType: currentImage.mimeType } : undefined, usePro, projectConfig);

      if (res.thought) setLastThought(res.thought);

      if (res.files && Object.keys(res.files).length > 0) {
        const newFiles = { ...projectFiles, ...res.files };
        setProjectFiles(newFiles);
        if (user && activeProjectId) {
          const changeSummary = res.summary || text.slice(0, 60);
          await db.updateProject(user.id, activeProjectId, newFiles, projectConfig);
          if (history.length >= 10) await db.deleteProjectSnapshot(history[history.length - 1].id);
          await db.createProjectSnapshot(activeProjectId, newFiles, changeSummary);
          if (githubConfig.token && githubConfig.repo) github.current.pushToGithub(githubConfig, newFiles, projectConfig, changeSummary).catch(console.error);
          await loadHistory(activeProjectId);
        }
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: res.answer || "Processing complete.", timestamp: Date.now(), questions: res.questions, thought: res.thought, files: res.files }]);
      if (user) { const updated = await db.useToken(user.id, user.email); if (updated) setUser(updated); }
    } catch (e: any) { setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Error: ${e.message}`, timestamp: Date.now() }]); }
    finally { setIsGenerating(false); }
  };

  const handleAutoFix = async () => {
    if (!runtimeError || isGenerating || !currentProjectId) return;
    setIsGenerating(true);
    const errorDescription = `CRITICAL RUNTIME ERROR detected: "${runtimeError.message}" at line ${runtimeError.line} in ${runtimeError.source}. Please fix this and return the files.`;
    try {
      const res = await gemini.current.generateWebsite(errorDescription, projectFiles, messages, undefined, true, projectConfig);
      if (res.thought) setLastThought(res.thought);
      if (res.files) {
        const newFiles = { ...projectFiles, ...res.files };
        setProjectFiles(newFiles);
        if (user && currentProjectId) {
          await db.updateProject(user.id, currentProjectId, newFiles, projectConfig);
          await db.createProjectSnapshot(currentProjectId, newFiles, `Auto-Fix: ${runtimeError.message}`);
          await loadHistory(currentProjectId);
        }
        setRuntimeError(null);
      }
    } finally { setIsGenerating(false); }
  };

  const handleBuildAPK = async (navigateToProfile: () => void) => {
    if (!githubConfig.token || githubConfig.token.length < 10) { navigateToProfile(); return; }
    setBuildSteps([]);
    setBuildStatus({ status: 'pushing', message: 'Initializing Workspace Repository...' });
    try {
      const sanitizedName = (projectConfig.appName || 'OneClickApp').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const finalRepoName = `${sanitizedName}-studio`;
      const owner = await github.current.createRepo(githubConfig.token, finalRepoName);
      const updatedConfig = { ...githubConfig, owner, repo: finalRepoName };
      setGithubConfig(updatedConfig);
      if (user) await db.updateGithubConfig(user.id, updatedConfig);
      setBuildStatus({ status: 'pushing', message: 'Syncing Mobile App Source...' });
      await github.current.pushToGithub(updatedConfig, projectFiles, projectConfig, "Manual Build Sync");
      setBuildStatus({ status: 'building', message: 'Compiling Android Binary...' });
      const checkInterval = setInterval(async () => {
        const runDetails = await github.current.getRunDetails(updatedConfig);
        if (runDetails?.jobs?.[0]?.steps) setBuildSteps(runDetails.jobs[0].steps);
        if (runDetails?.jobs?.[0]?.status === 'completed') {
          clearInterval(checkInterval);
          const details = await github.current.getLatestApk(updatedConfig);
          if (details) setBuildStatus({ status: 'success', message: 'Done!', apkUrl: details.downloadUrl, webUrl: details.webUrl });
          else setBuildStatus({ status: 'error', message: 'Artifact not found.' });
        } else if (runDetails?.jobs?.[0]?.conclusion === 'failure') {
          clearInterval(checkInterval); setBuildStatus({ status: 'error', message: 'Build process failed.' });
        }
      }, 5000);
    } catch (e: any) { setBuildStatus({ status: 'error', message: e.message || "Build failed." }); }
  };

  const handleSecureDownload = async () => {
    if (!buildStatus.apkUrl) return;
    setIsDownloading(true);
    try {
      const blob = await github.current.downloadArtifact(githubConfig, buildStatus.apkUrl);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${githubConfig.repo}-build.zip`;
      document.body.appendChild(a); a.click();
    } finally { setIsDownloading(false); }
  };

  return {
    messages, setMessages, input, setInput, isGenerating, projectFiles, setProjectFiles,
    selectedFile, setSelectedFile, openTabs, openFile, closeFile,
    addFile, deleteFile, renameFile,
    githubConfig, setGithubConfig, buildStatus, setBuildStatus,
    buildSteps: buildStatusSteps, setBuildSteps, isDownloading, handleSend, handleBuildAPK, handleSecureDownload,
    selectedImage, setSelectedImage, handleImageSelect, 
    projectConfig, setProjectConfig: (c: any) => setProjectConfig(c), currentProjectId, loadProject,
    runtimeError, handleAutoFix,
    history, isHistoryLoading, showHistory, setShowHistory, handleRollback,
    previewOverride, setPreviewOverride, refreshHistory: () => currentProjectId && loadHistory(currentProjectId),
    handleDeleteSnapshot, lastThought
  };
};
