import { ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';

export function setupSystemHandlers() {
  ipcMain.handle('open-default-apps-settings', async () => {
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
  });

  ipcMain.handle('check-for-updates-now', async (event) => {
    try {
      autoUpdater.on('update-available', () => event.sender.send('update-available'));
      autoUpdater.on('update-downloaded', () => event.sender.send('update-downloaded'));
      const result = await autoUpdater.checkForUpdates();
      return !!result.updateInfo?.version;
    } catch (e) {
      return false;
    }
  });
}
