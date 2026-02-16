
import { useState, useRef, useEffect } from 'react';
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
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({
    'index.html': '<div style="background:#09090b; color:#f4f4f5; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding: 20px;"><h1>OneClick Studio</h1></div>'
  });
  
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    appName: 'OneClickApp',
    packageName: 'com.oneclick.studio'
  });

  const [selectedFile, setSelectedFile] = useState('index.html');
  const [githubConfig, setGithubConfig] = useState<GithubConfig>({ 
    token: '', 
    repo: '', 
    owner: '' 
  });

  // History State
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [previewOverride, setPreviewOverride] = useState<Record<string, string> | null>(null);

  const gemini = useRef(new GeminiService());
  const db = DatabaseService.getInstance();
  const github = useRef(new GithubService());

  // Restore Project on Mount/Reload
  useEffect(() => {
    if (user && currentProjectId) {
      db.getProjectById(currentProjectId).then(p => {
        if (p) {
          setProjectFiles(p.files || {});
          if (p.config) setProjectConfig(p.config);
          if (p.files && p.files['index.html']) setSelectedFile('index.html');
          else if (p.files) setSelectedFile(Object.keys(p.files)[0]);
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

  // Listen for runtime errors from the preview iframe
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RUNTIME_ERROR') {
        setRuntimeError(event.data.error);
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);
  
  const [buildStatus, setBuildStatus] = useState<{ status: 'idle' | 'pushing' | 'building' | 'success' | 'error', message: string, apkUrl?: string, webUrl?: string }>({ status: 'idle', message: '' });
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadHistory = async (projectId: string) => {
    if (!projectId) return;
    setIsHistoryLoading(true);
    try {
      const data = await db.getProjectHistory(projectId);
      setHistory(data);
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const loadProject = (p: Project) => {
    if (!p) return;
    setCurrentProjectId(p.id);
    localStorage.setItem('active_project_id', p.id);
    setProjectFiles(p.files || {});
    if (p.config) setProjectConfig(p.config);
    if (p.files && p.files['index.html']) setSelectedFile('index.html');
    else if (p.files) setSelectedFile(Object.keys(p.files)[0]);
    setRuntimeError(null);
    setPreviewOverride(null);
    loadHistory(p.id);
  };

  const handleRollback = async (files: Record<string, string>, message: string) => {
    if (!currentProjectId || !user) return;
    setProjectFiles(files);
    setPreviewOverride(null);
    await db.updateProject(user.id, currentProjectId, files, projectConfig);
    const rollbackMsg = `Rollback to: ${message}`;
    await db.createProjectSnapshot(currentProjectId, files, rollbackMsg);
    
    if (githubConfig.token && githubConfig.repo) {
        github.current.pushToGithub(githubConfig, files, projectConfig, rollbackMsg).catch(console.error);
    }
    
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
      // Step 1: Ensure Project Exists
      let activeProjectId = currentProjectId;
      if (!activeProjectId && user) {
        const autoProj = await db.saveProject(user.id, "Auto-saved Project", projectFiles, projectConfig);
        activeProjectId = autoProj.id;
        setCurrentProjectId(activeProjectId);
        localStorage.setItem('active_project_id', activeProjectId);
        // Create initial snapshot
        await db.createProjectSnapshot(activeProjectId, projectFiles, "Initial Project Setup");
      }

      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'user', 
        content: text, 
        image: currentImage?.preview,
        timestamp: Date.now() 
      }]);
      setInput(''); 
      setSelectedImage(null);

      const usePro = user ? user.tokens > 100 : false;
      const res = await gemini.current.generateWebsite(text, projectFiles, messages, currentImage ? { data: currentImage.data, mimeType: currentImage.mimeType } : undefined, usePro);

      if (res.files && Object.keys(res.files).length > 0) {
        const newFiles = { ...projectFiles, ...res.files };
        setProjectFiles(newFiles);
        
        if (user && activeProjectId) {
          const changeSummary = res.summary || text.slice(0, 60);
          await db.updateProject(user.id, activeProjectId, newFiles, projectConfig);
          await db.createProjectSnapshot(activeProjectId, newFiles, changeSummary);
          
          if (githubConfig.token && githubConfig.repo) {
              github.current.pushToGithub(githubConfig, newFiles, projectConfig, changeSummary).catch(console.error);
          }
          await loadHistory(activeProjectId);
        }
      }

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: res.answer || "Processing complete.", 
        timestamp: Date.now(),
        questions: Array.isArray(res.questions) ? res.questions : [],
        thought: res.thought || "",
        files: res.files 
      }]);

      if (user) { 
        const updated = await db.useToken(user.id, user.email); 
        if (updated) setUser(updated); 
      }
    } catch (e: any) { 
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Error: ${e.message}`, timestamp: Date.now() }]); 
    } finally { setIsGenerating(false); }
  };

  const handleAutoFix = async () => {
    if (!runtimeError || isGenerating || !currentProjectId) return;
    
    setIsGenerating(true);
    const errorDescription = `CRITICAL RUNTIME ERROR detected: "${runtimeError.message}" at line ${runtimeError.line} in ${runtimeError.source}. Please fix this error and return the corrected files.`;
    
    try {
      const res = await gemini.current.generateWebsite(errorDescription, projectFiles, messages, undefined, true);
      
      if (res.files) {
        const newFiles = { ...projectFiles, ...res.files };
        setProjectFiles(newFiles);
        if (user && currentProjectId) {
          const fixSummary = `Auto-Fix: ${runtimeError.message}`;
          await db.updateProject(user.id, currentProjectId, newFiles, projectConfig);
          await db.createProjectSnapshot(currentProjectId, newFiles, fixSummary);
          await loadHistory(currentProjectId);
        }
        setRuntimeError(null);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveProjectConfig = async (newConfig: ProjectConfig) => {
    setProjectConfig(newConfig);
    if (user && currentProjectId) {
      await db.updateProject(user.id, currentProjectId, projectFiles, newConfig);
    }
  };

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setSelectedImage({ data: base64String, mimeType: file.type, preview: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleBuildAPK = async (navigateToProfile: () => void) => {
    if (!githubConfig.token || githubConfig.token.length < 10) { navigateToProfile(); return; }
    setBuildSteps([]);
    setBuildStatus({ status: 'pushing', message: 'Initializing Cloud Repository...' });
    try {
      const sanitizedName = (projectConfig.appName || 'OneClickApp').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const finalRepoName = `${sanitizedName}-studio`;
      const owner = await github.current.createRepo(githubConfig.token, finalRepoName);
      const updatedConfig = { ...githubConfig, owner, repo: finalRepoName };
      setGithubConfig(updatedConfig);
      if (user) await db.updateGithubConfig(user.id, updatedConfig);
      setBuildStatus({ status: 'pushing', message: 'Syncing source code...' });
      await github.current.pushToGithub(updatedConfig, projectFiles, projectConfig, "Manual Trigger: Execution Build");
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
          clearInterval(checkInterval);
          setBuildStatus({ status: 'error', message: 'Build process failed.' });
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
    } catch (e: any) { alert(e.message); } finally { setIsDownloading(false); }
  };

  return {
    messages, setMessages, input, setInput, isGenerating, projectFiles, setProjectFiles,
    selectedFile, setSelectedFile, githubConfig, setGithubConfig, buildStatus, setBuildStatus,
    buildSteps, setBuildSteps, isDownloading, handleSend, handleBuildAPK, handleSecureDownload,
    selectedImage, setSelectedImage, handleImageSelect, 
    projectConfig, setProjectConfig: saveProjectConfig, currentProjectId, loadProject,
    runtimeError, handleAutoFix,
    history, isHistoryLoading, showHistory, setShowHistory, handleRollback,
    previewOverride, setPreviewOverride, refreshHistory: () => currentProjectId && loadHistory(currentProjectId)
  };
};
