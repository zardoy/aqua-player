import { BrowserWindow, dialog, MessageBoxOptions, shell } from 'electron';
import { autoUpdater } from 'electron-updater';

export function setupSystemHandlers(window: BrowserWindow) {
  const handlers = {
    async openDefaultAppsSettings() {
      if (process.platform === 'win32') {
        await shell.openExternal('ms-settings:defaultapps');
        return true;
      }
      if (process.platform === 'darwin') {
        // There's no direct deep link to default apps; open general System Settings
        await shell.openExternal('x-apple.systempreferences:');
        return true;
      }
      // For Linux, attempt to open settings is desktop-specific; fallback to a help page
      await shell.openExternal('about:blank');
      return true;
    },

    async checkForUpdatesNow() {
      try {
        autoUpdater.on('update-available', () => window.webContents.send('update-available'));
        autoUpdater.on('update-downloaded', () => window.webContents.send('update-downloaded'));
        const result = await autoUpdater.checkForUpdates();
        return !!result.updateInfo?.version;
      } catch (e) {
        return false;
      }
    },

    // AirPlay handlers
    async checkAirPlayAvailability() {
      // Placeholder - implement actual AirPlay availability check
      return false;
    },

    async getAirPlayDevices() {
      // Placeholder - implement actual AirPlay device discovery
      return [];
    },

    async startAirPlay(deviceName: string) {
      // Placeholder - implement actual AirPlay start
      console.log('Starting AirPlay with device:', deviceName);
    },

    async stopAirPlay() {
      // Placeholder - implement actual AirPlay stop
      console.log('Stopping AirPlay');
    },

    // Remote server handlers
    async startRemoteServer() {
      // Placeholder - implement actual remote server start
      return 'http://localhost:3000';
    },

    async stopRemoteServer() {
      // Placeholder - implement actual remote server stop
      console.log('Stopping remote server');
    },

    async getRemotePlaybackUrl() {
      // Placeholder - implement actual remote playback URL retrieval
      return 'http://localhost:3000';
    },

    async openInBrowser(url: string) {
      await shell.openExternal(url);
    },

    async showMessageBox(options: MessageBoxOptions) {
      return await dialog.showMessageBox(window, options);
    }
  };

  return handlers;
}
