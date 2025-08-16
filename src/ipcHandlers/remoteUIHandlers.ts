import { ipcMain, BrowserWindow } from 'electron';
import { RemoteUIServer } from '../remote-ui/server';
import { loadSettingsFromDisk } from './settingsHandlers';

let remoteUIServer: RemoteUIServer | null = null;

export function setupRemoteUIHandlers(mainWindow: BrowserWindow) {
  // Load settings to get initial remote UI configuration
  const settings = loadSettingsFromDisk();
  
  // Initialize remote UI server
  remoteUIServer = new RemoteUIServer({
    enabled: settings.remoteUI__enabled || false,
    password: settings.remoteUI__password || 'aqua123'
  });

  remoteUIServer.setMainWindow(mainWindow);

  // Handle remote UI commands from WebSocket
  mainWindow.webContents.on('ipc-message', (event, channel, ...args) => {
    if (channel === 'remote-ui-command') {
      const [command] = args;
      handleRemoteUICommand(mainWindow, command);
    }
  });

  // IPC handlers for remote UI settings
  ipcMain.handle('remote-ui-get-status', () => {
    if (!remoteUIServer) return { enabled: false, port: 0, password: '' };
    
    return {
      enabled: remoteUIServer.isEnabled(),
      port: remoteUIServer.getPort(),
      password: remoteUIServer.getPassword()
    };
  });

  ipcMain.handle('remote-ui-set-enabled', (event, enabled: boolean) => {
    if (!remoteUIServer) return false;
    
    remoteUIServer.setEnabled(enabled);
    return true;
  });

  ipcMain.handle('remote-ui-set-password', (event, password: string) => {
    if (!remoteUIServer) return false;
    
    remoteUIServer.updatePassword(password);
    return true;
  });

  ipcMain.handle('remote-ui-get-url', () => {
    if (!remoteUIServer || !remoteUIServer.isEnabled()) {
      return null;
    }
    
    return `http://localhost:${remoteUIServer.getPort()}`;
  });

  // Handle player state updates to broadcast to remote UI clients
  ipcMain.on('update-player-state', (event, state) => {
    if (remoteUIServer && remoteUIServer.isEnabled()) {
      remoteUIServer.broadcastPlayerState(state);
    }
  });

  // Handle file info updates to broadcast to remote UI clients
  ipcMain.on('update-file-info', (event, filename: string) => {
    if (remoteUIServer && remoteUIServer.isEnabled()) {
      remoteUIServer.broadcastFileInfo(filename);
    }
  });

  // Handle settings updates for remote UI
  ipcMain.handle('remote-ui-update-settings', async (event, settings) => {
    if (!remoteUIServer) return false;
    
    if (settings.remoteUI__enabled !== undefined) {
      remoteUIServer.setEnabled(settings.remoteUI__enabled);
    }
    
    if (settings.remoteUI__password !== undefined) {
      remoteUIServer.updatePassword(settings.remoteUI__password);
    }
    
    return true;
  });
}

function handleRemoteUICommand(mainWindow: BrowserWindow, command: string) {
  console.log('Handling remote UI command:', command);
  
  switch (command) {
    case 'play':
      mainWindow.webContents.send('player-control', 'play');
      break;
    case 'pause':
      mainWindow.webContents.send('player-control', 'pause');
      break;
    case 'stop':
      mainWindow.webContents.send('player-control', 'stop');
      break;
    case 'next':
      mainWindow.webContents.send('player-control', 'next');
      break;
    case 'prev':
      mainWindow.webContents.send('player-control', 'prev');
      break;
    case 'fullscreen':
      mainWindow.webContents.send('player-control', 'fullscreen');
      break;
    default:
      console.log('Unknown remote UI command:', command);
  }
}

export function getRemoteUIServer(): RemoteUIServer | null {
  return remoteUIServer;
}