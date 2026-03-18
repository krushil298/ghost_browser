const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ghostpilot', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setUrl: (url) => ipcRenderer.invoke('set-url', url),
  onNavigate: (callback) => ipcRenderer.on('navigate', (_, url) => callback(url)),
  onSetOpacity: (callback) => ipcRenderer.on('set-opacity', (_, opacity) => callback(opacity))
});
