
import { useState, useRef, useEffect } from 'react';
import { GithubConfig, BuildStep, User as UserType, ProjectConfig, Project } from '../types';
import { GeminiService } from '../services/geminiService';
import { DatabaseService } from '../services/dbService';
import { GithubService } from '../services/githubService';

export const useAppLogic = (user: UserType | null, setUser: (u: UserType | null) => void) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(localStorage.getItem('active_project_id'));
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
  
  const [buildStatus, setBuildStatus] = useState<{ status: 'idle' | 'pushing' | 'building' | 'success' | 'error', message: string, apkUrl?: string, webUrl?: string }>({ status: 'idle', message: '' });
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadProject = (p: Project) => {
    if (!p) return;
    setCurrentProjectId(p.id);
    localStorage.setItem('active_project_id', p.id);
    setProjectFiles(p.files || {});
    if (p.config) setProjectConfig(p.config);
    if (p.files && p.files['index.html']) setSelectedFile('index.html');
    else if (p.files) setSelectedFile(Object.keys(p.files)[0]);
  };

  const handleSend = async (extraData?: string) => {
    if ((!input.trim() && !selectedImage && !extraData) || isGenerating) return;
    const text = extraData || input; 
    const currentImage = selectedImage;

    if (extraData) {
      setMessages(prev => {
        const lastAsstIdx = [...prev].reverse().findIndex(m => m.role === 'assistant' && m.questions);
        if (lastAsstIdx !== -1) {
          const actualIdx = prev.length - 1 - lastAsstIdx;
          const updated = [...prev];
          updated[actualIdx] = { ...updated[actualIdx], answersSummary: extraData };
          return updated;
        }
        return prev;
      });
    } else {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'user', 
        content: text, 
        image: currentImage?.preview,
        timestamp: Date.now() 
      }]);
      setInput(''); 
      setSelectedImage(null);
    }

    setIsGenerating(true);
    try {
      const usePro = user ? user.tokens > 100 : false;
      const res = await gemini.current.generateWebsite(text, projectFiles, messages, currentImage ? { data: currentImage.data, mimeType: currentImage.mimeType } : undefined, usePro);

      if (res.files && Object.keys(res.files).length > 0) {
        const newFiles = { ...projectFiles, ...res.files };
        setProjectFiles(newFiles);
        
        // AUTO-SYNC TO DATABASE IF PROJECT IS ACTIVE
        if (user && currentProjectId) {
          await db.updateProject(user.id, currentProjectId, newFiles, projectConfig);
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
      await github.current.pushToGithub(updatedConfig, projectFiles, projectConfig);
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
    projectConfig, setProjectConfig: saveProjectConfig, currentProjectId, loadProject
  };
};
