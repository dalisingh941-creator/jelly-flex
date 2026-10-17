const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jellyflexDesktop', {
  platform: process.platform,
  version: '2.0.0',
  isElectron: true,
  pingGateway: () => ipcRenderer.invoke('ping-gateway'),
});
