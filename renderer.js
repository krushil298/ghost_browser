document.addEventListener('DOMContentLoaded', async () => {
  const webview = document.getElementById('ai-webview');
  const loadingScreen = document.getElementById('loading-screen');
  const siteBtns = document.querySelectorAll('.site-btn');
  const btnHide = document.getElementById('btn-hide');
  const btnReload = document.getElementById('btn-reload');
  const btnOpacityUp = document.getElementById('btn-opacity-up');
  const btnOpacityDown = document.getElementById('btn-opacity-down');
  const webviewContainer = document.getElementById('webview-container');

  // Load saved settings
  const settings = await window.ghostpilot.getSettings();
  
  // Apply saved opacity
  webviewContainer.style.opacity = settings.opacity;
  
  // Navigate to saved URL
  if (settings.url) {
    webview.src = settings.url;
    // Update active button
    siteBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.url === settings.url);
    });
  }

  // Webview loading events
  webview.addEventListener('did-start-loading', () => {
    loadingScreen.classList.add('visible');
  });

  webview.addEventListener('did-stop-loading', () => {
    loadingScreen.classList.remove('visible');
  });

  webview.addEventListener('did-fail-load', (e) => {
    if (e.errorCode === -3) return; // Aborted, ignore
    const loaderText = loadingScreen.querySelector('.loader-text');
    loaderText.textContent = 'Failed to load. Retrying...';
    setTimeout(() => {
      webview.reload();
    }, 2000);
  });

  // Site picker buttons
  siteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      webview.src = url;
      window.ghostpilot.setUrl(url);
      
      // Update active state
      siteBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Control buttons
  btnHide.addEventListener('click', () => {
    // Send IPC to hide window (simulate the hotkey)
    const { ipcRenderer } = require('electron');
    // We can't directly hide from renderer, but we can use the window
    window.close();
  });

  btnReload.addEventListener('click', () => {
    webview.reload();
  });

  btnOpacityUp.addEventListener('click', () => {
    let current = parseFloat(webviewContainer.style.opacity) || 0.92;
    current = Math.min(1, current + 0.05);
    webviewContainer.style.opacity = current;
  });

  btnOpacityDown.addEventListener('click', () => {
    let current = parseFloat(webviewContainer.style.opacity) || 0.92;
    current = Math.max(0.15, current - 0.05);
    webviewContainer.style.opacity = current;
  });

  // IPC listeners from main process
  window.ghostpilot.onNavigate((url) => {
    webview.src = url;
    siteBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.url === url);
    });
  });

  window.ghostpilot.onSetOpacity((opacity) => {
    webviewContainer.style.opacity = opacity;
  });

  // Handle new window requests (open links in the same webview)
  webview.addEventListener('new-window', (e) => {
    e.preventDefault();
    webview.src = e.url;
  });

  // Inject dark scrollbar styles into webview after it loads
  webview.addEventListener('dom-ready', () => {
    webview.insertCSS(`
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
    `).catch(() => {});
  });
});
