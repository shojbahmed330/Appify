
export const buildFinalHtml = (projectFiles: Record<string, string>, entryPath: string = 'index.html', projectConfig?: any) => {
  const supabaseConfig = projectConfig?.supabase_url ? `
    window.StudioDatabase = {
      url: "${projectConfig.supabase_url}",
      key: "${projectConfig.supabase_key}"
    };
    console.log('OneClick Database Bridge: Active');
  ` : `window.StudioDatabase = null; console.log('OneClick Database Bridge: Offline');`;

  const polyfill = `
    <script>
      // Database Bridge Injection
      ${supabaseConfig}

      // Advanced Error Reporting System for Self-Healing
      window.onerror = function(message, source, lineno, colno, error) {
        window.parent.postMessage({
          type: 'RUNTIME_ERROR',
          error: { 
            message: message, 
            line: lineno, 
            column: colno,
            stack: error?.stack || '',
            source: source ? source.split('/').pop() : 'index.html'
          }
        }, '*');
        return false;
      };

      // Native Bridge Simulation
      window.NativeBridge = {
        getUsageStats: () => Promise.resolve({ screenTime: '4h 20m', topApp: 'Social Media' }),
        requestPermission: async (p) => {
           console.log('Requesting Permission:', p);
           return Promise.resolve(true);
        },
        showToast: (m) => { alert('App Message: ' + m); },
        vibrate: (pattern = 200) => { if (window.navigator.vibrate) window.navigator.vibrate(pattern); }
      };
    </script>
  `;

  let entryHtml = projectFiles[entryPath] || '<div id="app">System Initializing...</div>';
  
  let processedHtml = entryHtml
    .replace(/<link[^>]+href=["'](?!\w+:\/\/)[^"']+["'][^>]*>/gi, '')
    .replace(/<script[^>]+src=["'](?!\w+:\/\/)[^"']+["'][^>]*><\/script>/gi, '');

  const cssContent = Object.entries(projectFiles)
    .filter(([path]) => path.endsWith('.css'))
    .map(([path, content]) => `/* ${path} */\n${content}`)
    .join('\n');
    
  const jsContent = Object.entries(projectFiles)
    .filter(([path]) => path.endsWith('.js'))
    .map(([path, content]) => `// --- FILE: ${path} ---\ntry {\n${content}\n} catch(e) { console.error("Error in ${path}:", e); throw e; }\n`)
    .join('\n');
  
  const tailwindCdn = '<script src="https://cdn.tailwindcss.com"></script>';
  
  const headInjection = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    ${tailwindCdn}
    <style>
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      :root { --safe-top: env(safe-area-inset-top); --safe-bottom: env(safe-area-inset-bottom); }
      html, body { height: 100dvh; width: 100vw; margin: 0; padding: 0; overflow: hidden; background-color: #000; }
      body { color: #f4f4f5; font-family: sans-serif; display: flex; flex-direction: column; padding-top: var(--safe-top); padding-bottom: var(--safe-bottom); }
      #app-root, #root, #app { flex: 1; display: flex; flex-direction: column; height: 100%; overflow-y: auto; overflow-x: hidden; position: relative; }
      ::-webkit-scrollbar { display: none; }
      ${cssContent}
    </style>
    ${polyfill}
  `;

  const finalScript = `<script>\n${jsContent}\n</script>`;

  if (!processedHtml.toLowerCase().includes('<html')) {
    return `<!DOCTYPE html><html lang="en"><head>${headInjection}</head><body><div id="app-root">${processedHtml}</div>${finalScript}</body></html>`;
  }

  if (processedHtml.includes('</head>')) {
    processedHtml = processedHtml.replace('</head>', `${headInjection}</head>`);
  } else {
    processedHtml = processedHtml.replace('<body', `<head>${headInjection}</head><body`);
  }

  if (processedHtml.includes('</body>')) {
    processedHtml = processedHtml.replace('</body>', `${finalScript}</body>`);
  } else {
    processedHtml = processedHtml + finalScript;
  }

  return processedHtml;
};
