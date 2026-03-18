const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({
  defaults: {
    opacity: 0.92,
    url: 'https://chatgpt.com',
    windowBounds: { width: 480, height: 680 },
    windowPosition: null,
    alwaysOnTop: true
  }
});

let mainWindow = null;
let tray = null;
let isVisible = true;

function createWindow() {
  const { width, height } = store.get('windowBounds');
  const savedPosition = store.get('windowPosition');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;

  const windowConfig = {
    width,
    height,
    x: savedPosition ? savedPosition.x : screenW - width - 30,
    y: savedPosition ? savedPosition.y : 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    focusable: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    fullscreenable: false,
    visibleOnAllWorkspaces: true,
    visibleOnFullScreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true  // Enable <webview> tag
    }
  };

  // macOS: use 'panel' type for NSPanel behavior (no dock, no app switcher)
  if (process.platform === 'darwin') {
    windowConfig.type = 'panel';
  }

  mainWindow = new BrowserWindow(windowConfig);

  // Set highest always-on-top level
  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  // Enable content protection — hides from screen capture
  mainWindow.setContentProtection(true);

  // Prevent the window from being captured in screenshots
  if (process.platform === 'darwin') {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  mainWindow.loadFile('index.html');

  // Save window position and size on move/resize
  mainWindow.on('moved', () => {
    const [x, y] = mainWindow.getPosition();
    store.set('windowPosition', { x, y });
  });

  mainWindow.on('resized', () => {
    const [w, h] = mainWindow.getSize();
    store.set('windowBounds', { width: w, height: h });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function toggleVisibility() {
  if (!mainWindow) return;
  if (isVisible) {
    mainWindow.hide();
    isVisible = false;
  } else {
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    isVisible = true;
  }
}

function registerShortcuts() {
  // Toggle visibility: Cmd+Shift+Space (Mac) / Ctrl+Shift+Space (Win/Linux)
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    toggleVisibility();
  });

  // Quick hide (panic key): Escape
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (mainWindow && isVisible) {
      mainWindow.hide();
      isVisible = false;
    }
  });

  // Opacity up
  globalShortcut.register('CommandOrControl+Shift+Up', () => {
    if (!mainWindow) return;
    const current = store.get('opacity');
    const newOpacity = Math.min(1, current + 0.05);
    store.set('opacity', newOpacity);
    mainWindow.webContents.send('set-opacity', newOpacity);
  });

  // Opacity down
  globalShortcut.register('CommandOrControl+Shift+Down', () => {
    if (!mainWindow) return;
    const current = store.get('opacity');
    const newOpacity = Math.max(0.15, current - 0.05);
    store.set('opacity', newOpacity);
    mainWindow.webContents.send('set-opacity', newOpacity);
  });
}

function createTray() {
  // Create a simple tray icon (1x1 transparent pixel as fallback)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '👻 GhostPilot',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Toggle (⌘⇧Space)',
      click: () => toggleVisibility()
    },
    { type: 'separator' },
    {
      label: 'ChatGPT',
      type: 'radio',
      checked: store.get('url') === 'https://chatgpt.com',
      click: () => {
        store.set('url', 'https://chatgpt.com');
        mainWindow?.webContents.send('navigate', 'https://chatgpt.com');
      }
    },
    {
      label: 'Google Gemini',
      type: 'radio',
      checked: store.get('url') === 'https://gemini.google.com',
      click: () => {
        store.set('url', 'https://gemini.google.com');
        mainWindow?.webContents.send('navigate', 'https://gemini.google.com');
      }
    },
    {
      label: 'Claude',
      type: 'radio',
      checked: store.get('url') === 'https://claude.ai',
      click: () => {
        store.set('url', 'https://claude.ai');
        mainWindow?.webContents.send('navigate', 'https://claude.ai');
      }
    },
    {
      label: 'Perplexity',
      type: 'radio',
      checked: store.get('url') === 'https://perplexity.ai',
      click: () => {
        store.set('url', 'https://perplexity.ai');
        mainWindow?.webContents.send('navigate', 'https://perplexity.ai');
      }
    },
    { type: 'separator' },
    {
      label: 'Opacity +',
      click: () => {
        const current = store.get('opacity');
        const newOpacity = Math.min(1, current + 0.1);
        store.set('opacity', newOpacity);
        mainWindow?.webContents.send('set-opacity', newOpacity);
      }
    },
    {
      label: 'Opacity -',
      click: () => {
        const current = store.get('opacity');
        const newOpacity = Math.max(0.15, current - 0.1);
        store.set('opacity', newOpacity);
        mainWindow?.webContents.send('set-opacity', newOpacity);
      }
    },
    { type: 'separator' },
    {
      label: 'Quit GhostPilot',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('GhostPilot — Stealth AI Assistant');
}

// IPC handlers
ipcMain.handle('get-settings', () => {
  return {
    opacity: store.get('opacity'),
    url: store.get('url')
  };
});

ipcMain.handle('set-url', (_, url) => {
  store.set('url', url);
  return true;
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  registerShortcuts();
  createTray();

  // Hide dock icon on macOS (true stealth)
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
