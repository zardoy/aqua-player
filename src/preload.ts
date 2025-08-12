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
  getFolderContents: (folderPath: string) => ipcRenderer.invoke('get-folder-contents', folderPath),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  quit: () => ipcRenderer.send('quit'),

  // Media features
  checkAirPlayAvailability: () => ipcRenderer.invoke('check-airplay-availability'),
  startAirPlay: (deviceName: string) => ipcRenderer.invoke('start-airplay', deviceName),
  stopAirPlay: () => ipcRenderer.invoke('stop-airplay'),
  getAirPlayDevices: () => ipcRenderer.invoke('get-airplay-devices'),

  // Remote playback
  startRemoteServer: () => ipcRenderer.invoke('start-remote-server'),
  stopRemoteServer: () => ipcRenderer.invoke('stop-remote-server'),
  getRemotePlaybackUrl: () => ipcRenderer.invoke('get-remote-playback-url'),

  // Settings
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),

  // Metadata
  syncMetadata: (delta?: any) => ipcRenderer.invoke('sync-metadata', delta),

  // System helpers
  openDefaultAppsSettings: () => ipcRenderer.invoke('open-default-apps-settings'),
  checkForUpdatesNow: () => ipcRenderer.invoke('check-for-updates-now'),

  // Window dragging
  startWindowDrag: (mouseX: number, mouseY: number) => ipcRenderer.send('window-drag-start', { mouseX, mouseY }),
  moveWindow: (mouseX: number, mouseY: number, startBounds: any, startMouseX: number, startMouseY: number) =>
    ipcRenderer.send('window-drag-move', { mouseX, mouseY, startBounds, startMouseX, startMouseY }),
  on: (channel: string, callback: (...args: any[]) => void) => ipcRenderer.on(channel, callback),
  off: (channel: string, callback: (...args: any[]) => void) => ipcRenderer.removeListener(channel, callback),

  // Progress bar
  setWindowTitle: (title: string) => ipcRenderer.send('update-window-title', title),
  setProgressBar: (isPlaying: boolean, progress: number) => ipcRenderer.send('update-progress-bar', { isPlaying, progress }),
});

// Forward main process logs to the renderer console
ipcRenderer.on('main-log', (_evt, payload: { level: 'log'|'info'|'warn'|'error'|'debug'; args: string[] }) => {
  const { level, args } = payload || { level: 'log', args: [] };
  const fn = console[level] || console.log;
  fn('[main]', ...args);
});
