import { ipcMain, BrowserWindow } from 'electron';
import { RemoteUIServer } from '../../remote-ui/server';
import { settingsMain } from './settingsHandlers';

let remoteUIServer: RemoteUIServer | null = null;

export function setupRemoteUIHandlers(mainWindow: BrowserWindow) {
  const settings = settingsMain;

  // Initialize remote UI server
  remoteUIServer = new RemoteUIServer({
    enabled: settings.remoteUI__enabled,
    password: settings.remoteUI__password
  });

  remoteUIServer.setMainWindow(mainWindow);

  const remoteUIHandlers = {
    'remote-ui-command': (command: string) => {
      handleRemoteUICommand(mainWindow, command);
    },
    'remote-ui-get-status': () => {
      if (!remoteUIServer) return { enabled: false, port: 0, password: '' };

      return {
        enabled: remoteUIServer.isEnabled(),
        port: remoteUIServer.getPort(),
        password: remoteUIServer.getPassword()
      };
    },
    'remote-ui-set-enabled': (enabled: boolean) => {
      if (!remoteUIServer) return false;

      remoteUIServer.setEnabled(enabled);
      return true;
    },
    'remote-ui-set-password': (password: string) => {
      if (!remoteUIServer) return false;

      remoteUIServer.updatePassword(password);
      return true;
    },
    'remote-ui-get-url': () => {
      if (!remoteUIServer || !remoteUIServer.isEnabled()) {
        return null;
      }

      return `http://localhost:${remoteUIServer.getPort()}`;
    },
    'update-player-state': (state: any) => {
      if (remoteUIServer && remoteUIServer.isEnabled()) {
        remoteUIServer.broadcastPlayerState(state);
      }
    },
    'update-file-info': (filename: string) => {
      if (remoteUIServer && remoteUIServer.isEnabled()) {
        remoteUIServer.broadcastFileInfo(filename);
      }
    },
    'remote-ui-update-settings': (settings: any) => {
      if (!remoteUIServer) return false;

      if (settings.remoteUI__enabled !== undefined) {
        remoteUIServer.setEnabled(settings.remoteUI__enabled);
      }

      if (settings.remoteUI__password !== undefined) {
        remoteUIServer.updatePassword(settings.remoteUI__password);
      }

      return true;
    }
  };

  return remoteUIHandlers;
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
