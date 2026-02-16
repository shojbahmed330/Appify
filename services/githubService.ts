
import { GithubConfig, ProjectConfig } from "../types";

export class GithubService {
  private workflowYaml = `name: Build Android APK & Deploy Web
on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  build-apk:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          check-latest: true

      - name: Initialize Capacitor and Build APK
        run: |
          rm -rf www android
          mkdir -p www
          # Copy app files to www for APK build
          cp -r app/* www/ || true
          
          echo '{"appId": "com.oneclick.studio", "appName": "OneClickApp", "webDir": "www", "bundledWebRuntime": false}' > capacitor.config.json
          
          if [ ! -f package.json ]; then npm init -y; fi
          npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest @capacitor/assets@latest
          
          if [ -d "assets" ] && [ "$(ls -A assets)" ]; then
            npx capacitor-assets generate --android || true
          fi
          
          npx cap add android
          echo "android.enableJetifier=true" >> android/gradle.properties
          echo "android.useAndroidX=true" >> android/gradle.properties
          sed -i 's/JavaVersion.VERSION_17/JavaVersion.VERSION_21/g' android/app/build.gradle
          
          npx cap copy android
          cd android && chmod +x gradlew && ./gradlew assembleDebug

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk

  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload Admin Build
        uses: actions/upload-pages-artifact@v3
        with:
          # Deploying the admin folder as the website
          path: 'admin/'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  private toBase64(str: string): string {
    try {
      const bytes = new TextEncoder().encode(str);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (e) {
      return btoa(unescape(encodeURIComponent(str)));
    }
  }

  async createRepo(token: string, repoName: string): Promise<string> {
    const headers = { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' };
    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) throw new Error("GitHub authentication failed.");
    const userData = await userRes.json();
    const username = userData.login;
    const checkRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, { headers });
    if (checkRes.ok) return username;
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: repoName, private: false, auto_init: true, has_pages: true })
    });
    if (!createRes.ok && createRes.status !== 422) throw new Error("Failed to create repo.");
    return username;
  }

  async pushToGithub(config: GithubConfig, files: Record<string, string>, appConfig?: ProjectConfig, customMessage?: string) {
    const { token, owner, repo } = config;
    if (!token || !owner || !repo) throw new Error("GitHub config incomplete.");

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const headers = { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' };

    let sanitizedAppId = (appConfig?.packageName || 'com.oneclick.studio').toString().toLowerCase().replace(/[^a-z0-9.]/g, '');
    const capConfig = { appId: sanitizedAppId, appName: appConfig?.appName || 'OneClickApp', webDir: 'www', bundledWebRuntime: false };
    
    const allFilesToPush: Record<string, string> = { 
        ...files, 
        '.github/workflows/android.yml': this.workflowYaml,
        'capacitor.config.json': JSON.stringify(capConfig, null, 2)
    };

    if (appConfig?.icon) allFilesToPush['assets/icon-only.png'] = appConfig.icon;
    if (appConfig?.splash) allFilesToPush['assets/splash.png'] = appConfig.splash;

    const commitMessage = customMessage || "Build Engine Sync";

    for (const [path, content] of Object.entries(allFilesToPush)) {
      const isBase64 = content.startsWith('data:image') || path.startsWith('assets/');
      const finalContent = isBase64 ? content.split(',')[1] || content : this.toBase64(content);

      const getRes = await fetch(`${baseUrl}/contents/${path}`, { headers });
      let sha: string | undefined;
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      }

      await fetch(`${baseUrl}/contents/${path}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${commitMessage} [${path}]`, content: finalContent, sha })
      });
    }
  }

  getWebUrl(owner: string, repo: string): string {
    return `https://${owner}.github.io/${repo}/`;
  }

  async getRunDetails(config: GithubConfig) {
    const headers = { 'Authorization': `token ${config.token}`, 'Accept': 'application/vnd.github.v3+json' };
    const runsRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/actions/runs?per_page=1`, { headers });
    if (!runsRes.ok) return null;
    const runsData = await runsRes.json();
    const latestRun = runsData.workflow_runs?.[0];
    if (!latestRun) return null;
    const jobsRes = await fetch(latestRun.jobs_url, { headers });
    const jobsData = await jobsRes.json();
    return { run: latestRun, jobs: jobsData.jobs || [] };
  }

  async getLatestApk(config: GithubConfig) {
    const headers = { 'Authorization': `token ${config.token}`, 'Accept': 'application/vnd.github.v3+json' };
    const runsRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/actions/runs?per_page=1`, { headers });
    if (!runsRes.ok) return null;
    const runsData = await runsRes.json();
    const latestRun = runsData.workflow_runs?.[0];
    if (!latestRun || latestRun.status !== 'completed' || latestRun.conclusion !== 'success') return null;
    const artifactsRes = await fetch(latestRun.artifacts_url, { headers });
    const data = await artifactsRes.json();
    const artifact = data.artifacts?.find((a: any) => a.name === 'app-debug');
    
    return artifact ? { 
      downloadUrl: artifact.archive_download_url, 
      webUrl: this.getWebUrl(config.owner, config.repo) 
    } : null;
  }

  async downloadArtifact(config: GithubConfig, url: string) {
    const res = await fetch(url, { headers: { 'Authorization': `token ${config.token}` } });
    if (!res.ok) throw new Error("Download failed.");
    return await res.blob();
  }
}
