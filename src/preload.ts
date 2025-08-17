import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: (...args: any[]) => void) => ipcRenderer.on(channel, callback),
  off: (channel: string, callback: (...args: any[]) => void) => ipcRenderer.removeListener(channel, callback),
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
});

// Keep only essential utilities that can't be handled through IPC
contextBridge.exposeInMainWorld('electronUtils', {
  platform: process.platform,
  getFilePath: (file: File) => webUtils.getPathForFile(file),
});

// Forward main process logs to the renderer console
ipcRenderer.on('main-log', (_evt, payload: { level: 'log'|'info'|'warn'|'error'|'debug'; args: string[] }) => {
  const { level, args } = payload || { level: 'log', args: [] };
  const fn = console[level] || console.log;
  fn('[main]', ...args);
});
