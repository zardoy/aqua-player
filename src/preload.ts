import { contextBridge, ipcRenderer, webUtils } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,

  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getFilePath: (file: File) => webUtils.getPathForFile(file),
  openFileInExplorer: (filePath: string) => ipcRenderer.invoke('open-file-in-explorer', filePath),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),

  // Media features
  checkAirPlayAvailability: () => ipcRenderer.invoke('check-airplay-availability'),
  startAirPlay: (deviceName: string) => ipcRenderer.invoke('start-airplay', deviceName),
  stopAirPlay: () => ipcRenderer.invoke('stop-airplay'),
  getAirPlayDevices: () => ipcRenderer.invoke('get-airplay-devices'),

  // Remote playback
  startRemoteServer: () => ipcRenderer.invoke('start-remote-server'),
  stopRemoteServer: () => ipcRenderer.invoke('stop-remote-server'),
  getRemotePlaybackUrl: () => ipcRenderer.invoke('get-remote-playback-url'),
});
