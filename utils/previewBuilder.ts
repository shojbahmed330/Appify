
export const buildFinalHtml = (projectFiles: Record<string, string>) => {
  const polyfill = `
    <script>
      // Error Reporting System
      window.onerror = function(message, source, lineno, colno, error) {
        window.parent.postMessage({
          type: 'RUNTIME_ERROR',
          error: { 
            message: message, 
            line: lineno, 
            column: colno,
            source: source ? source.split('/').pop() : 'index.html'
          }
        }, '*');
        return false;
      };

      window.onunhandledrejection = function(event) {
        window.parent.postMessage({
          type: 'RUNTIME_ERROR',
          error: { 
            message: event.reason?.message || 'Unhandled Promise Rejection',
            line: 0,
            column: 0,
            source: 'index.html'
          }
        }, '*');
      };

      // Enhanced Native Bridge Simulation
      window.NativeBridge = {
        getUsageStats: () => Promise.resolve({ screenTime: '4h 20m', topApp: 'Social Media' }),
        requestPermission: async (p) => {
           console.log('Requesting Permission for:', p);
           if (p === 'camera') {
             try { await navigator.mediaDevices.getUserMedia({ video: true }); return true; } catch(e) { return false; }
           }
           if (p === 'geolocation') {
             return new Promise((resolve) => navigator.geolocation.getCurrentPosition(() => resolve(true), () => resolve(false)));
           }
           return Promise.resolve(true);
        },
        showToast: (m) => { 
          alert('App Message: ' + m);
          console.log('Native Toast:', m); 
        },
        vibrate: (pattern = 200) => { 
          if (window.navigator.vibrate) {
            window.navigator.vibrate(pattern);
            console.log('Vibrating pattern:', pattern);
          } else {
            console.log('Vibration not supported on this device');
          }
        },
        getLocation: () => {
          return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              (err) => reject(err)
            );
          });
        }
      };
      console.log('Mobile Preview Bridge (Enhanced) Initialized');
    </script>
  `;

  let entryHtml = projectFiles['index.html'] || '<div id="app"></div>';
  
  // Strip relative links/scripts as they won't resolve in srcDoc unless handled
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
      /* Mobile App Reset & Safe Area Handling */
      * { 
        box-sizing: border-box; 
        -webkit-tap-highlight-color: transparent;
      }
      
      :root {
        --safe-top: env(safe-area-inset-top);
        --safe-bottom: env(safe-area-inset-bottom);
        --safe-left: env(safe-area-inset-left);
        --safe-right: env(safe-area-inset-right);
      }

      html, body {
        height: 100dvh;
        width: 100vw;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #000;
      }

      body { 
        -ms-overflow-style: none; 
        scrollbar-width: none; 
        color: #f4f4f5;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        flex-direction: column;
        /* Default safety padding */
        padding-top: var(--safe-top);
        padding-bottom: var(--safe-bottom);
      }

      /* Container for scrolling content if needed */
      #app-root, #root, #app, .app-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
      }

      ::-webkit-scrollbar { display: none; }
      
      /* Utility for full screen layouts */
      .full-screen {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
      }

      ${cssContent}
    </style>
    ${polyfill}
  `;

  const finalScript = `<script>\n${jsContent}\n</script>`;

  if (!processedHtml.toLowerCase().includes('<html')) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        ${headInjection}
      </head>
      <body>
        <div id="app-root">
          ${processedHtml}
        </div>
        ${finalScript}
      </body>
      </html>
    `;
  }

  if (processedHtml.includes('</head>')) {
    processedHtml = processedHtml.replace('</head>', `${headInjection}</head>`);
  } else if (processedHtml.includes('<body')) {
    processedHtml = processedHtml.replace('<body', `<head>${headInjection}</head><body`);
  }

  if (processedHtml.includes('</body>')) {
    processedHtml = processedHtml.replace('</body>', `${finalScript}</body>`);
  } else {
    processedHtml = processedHtml + finalScript;
  }

  return processedHtml;
};
