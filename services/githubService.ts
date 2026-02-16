
import { GithubConfig, ProjectConfig } from "../types";

export class GithubService {
  // Fixed workflow template with absolute explicit indentation
  private workflowYaml = `name: Build Android APK
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
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
          # 1. Clean build environment
          rm -rf www android
          mkdir -p www
          mkdir -p assets
          
          # 2. Force create fresh capacitor.config.json
          echo '{"appId": "com.oneclick.studio", "appName": "OneClickApp", "webDir": "www", "bundledWebRuntime": false}' > capacitor.config.json
          
          # 3. Sync project files safely
          find . -maxdepth 3 -type f \\
            -not -path '*/.*' \\
            -not -name "package*" \\
            -not -name "tsconfig*" \\
            -not -name "vite.config.ts" \\
            -not -name "capacitor.config.json" \\
            -not -path "./android/*" \\
            -not -path "./node_modules/*" \\
            -exec cp --parents "{}" www/ ';'
          
          # 4. Install Capacitor CLI & Core
          if [ ! -f package.json ]; then npm init -y; fi
          npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest @capacitor/assets@latest
          
          # 5. Generate Assets if exist
          if [ -d "assets" ] && [ "$(ls -A assets)" ]; then
            npx capacitor-assets generate --android || true
          fi
          
          # 6. Initialize Android Project
          npx cap add android
          
          # 7. Apply Build Fixes (SAFE ECHO METHOD - NO CAT/EOF INDENTATION ISSUES)
          echo "android.enableJetifier=true" >> android/gradle.properties
          echo "android.useAndroidX=true" >> android/gradle.properties
          
          sed -i 's/JavaVersion.VERSION_17/JavaVersion.VERSION_21/g' android/app/build.gradle
          sed -i 's/JavaVersion.VERSION_11/JavaVersion.VERSION_21/g' android/app/build.gradle
          sed -i 's/JavaVersion.VERSION_1_8/JavaVersion.VERSION_21/g' android/app/build.gradle
          
          # Inject configurations line-by-line to avoid any YAML indent errors
          echo "android {" >> android/app/build.gradle
          echo "    packagingOptions {" >> android/app/build.gradle
          echo "        resources {" >> android/app/build.gradle
          echo "            pickFirst 'META-INF/kotlin-stdlib.kotlin_module'" >> android/app/build.gradle
          echo "            pickFirst 'META-INF/kotlin-stdlib-jdk8.kotlin_module'" >> android/app/build.gradle
          echo "            pickFirst 'META-INF/kotlin-stdlib-jdk7.kotlin_module'" >> android/app/build.gradle
          echo "        }" >> android/app/build.gradle
          echo "    }" >> android/app/build.gradle
          echo "}" >> android/app/build.gradle
          
          echo "configurations.all {" >> android/app/build.gradle
          echo "    resolutionStrategy {" >> android/app/build.gradle
          echo "        force 'org.jetbrains.kotlin:kotlin-stdlib:1.9.10'" >> android/app/build.gradle
          echo "        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.9.10'" >> android/app/build.gradle
          echo "        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.9.10'" >> android/app/build.gradle
          echo "        force 'com.android.support:support-v4:28.0.0'" >> android/app/build.gradle
          echo "    }" >> android/app/build.gradle
          echo "}" >> android/app/build.gradle

          npx cap copy android
          
          # 8. Build Production APK
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error`;

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
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    };

    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) throw new Error("গিটহাব অথেন্টিকেশন ফেইল করেছে। টোকেন চেক করুন।");
    const userData = await userRes.json();
    const username = userData.login;

    // Check if repo exists
    const checkRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, { headers });
    if (checkRes.ok) return username;

    // Create repo
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: repoName,
        private: false,
        description: 'Auto-generated repository for Android build',
        auto_init: true
      })
    });

    if (!createRes.ok) {
        const errData = await createRes.json();
        if (createRes.status === 422) return username; // Already exists
        throw new Error(`রেপো তৈরি করতে ব্যর্থ: ${errData.message}`);
    }

    return username;
  }

  async pushToGithub(config: GithubConfig, files: Record<string, string>, appConfig?: ProjectConfig) {
    const token = config.token.trim();
    const owner = config.owner.trim();
    const repo = config.repo.trim();

    if (!token || !owner || !repo) throw new Error("গিটহাব কনফিগারেশন অসম্পূর্ণ।");

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const headers = {
      'Authorization': `token ${token}`, 
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    // Strict sanitization for App ID
    let rawId = (appConfig?.packageName || 'com.oneclick.studio').toString();
    let sanitizedAppId = rawId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '');

    if (!sanitizedAppId.includes('.') || sanitizedAppId.split('.').length < 2) {
      sanitizedAppId = `com.oneclick.${sanitizedAppId.replace('.', '')}`;
    }

    const capConfig = {
      appId: sanitizedAppId,
      appName: (appConfig?.appName || 'OneClickApp').toString().trim(),
      webDir: 'www',
      bundledWebRuntime: false
    };

    // Prepare all files
    const allFiles: Record<string, string> = { 
        ...files, 
        '.github/workflows/android.yml': this.workflowYaml,
        'capacitor.config.json': JSON.stringify(capConfig, null, 2)
    };

    if (appConfig?.icon) {
      allFiles['assets/icon-only.png'] = appConfig.icon;
      allFiles['assets/icon-foreground.png'] = appConfig.icon;
      allFiles['assets/icon-background.png'] = '#FFFFFF'; 
    }
    if (appConfig?.splash) {
      allFiles['assets/splash.png'] = appConfig.splash;
    }

    // Sequence push to avoid conflicts
    for (const [path, content] of Object.entries(allFiles)) {
      const isBase64 = content.startsWith('data:image') || path.startsWith('assets/');
      const finalContent = isBase64 ? content.split(',')[1] || content : this.toBase64(content);

      // 1. Get current file SHA to overwrite correctly
      const getRes = await fetch(`${baseUrl}/contents/${path}`, { headers });
      let sha: string | undefined;
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      }

      // 2. Upload / Update file
      const putRes = await fetch(`${baseUrl}/contents/${path}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Build Engine Sync: ${path}`,
          content: finalContent,
          sha: sha // CRITICAL: This ensures we update the existing file correctly
        })
      });

      if (!putRes.ok) {
          const errorData = await putRes.json();
          // If conflict (409), it means someone else pushed. We ignore and continue for next file.
          if (putRes.status !== 409) {
            console.error(`ফাইল আপলোড এরর (${path}): ${errorData.message}`);
          }
      }
    }
  }

  async listRepos(token: string) {
    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    return res.ok ? await res.json() : [];
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
    return artifact ? { downloadUrl: artifact.archive_download_url, webUrl: latestRun.html_url } : null;
  }

  async downloadArtifact(config: GithubConfig, url: string) {
    const res = await fetch(url, { headers: { 'Authorization': `token ${config.token}` } });
    if (!res.ok) throw new Error("আর্টিফ্যাক্ট ডাউনলোড করতে সমস্যা হয়েছে।");
    return await res.blob();
  }
}
