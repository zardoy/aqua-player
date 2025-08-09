import { BrowserWindow, dialog, shell, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export function setupFileHandlers(mainWindow: BrowserWindow) {
  // Handle opening video files
  ipcMain.handle('open-file-dialog', async () => {
    if (!mainWindow) return { canceled: true };

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'wmv', 'm4v'] },
        { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'm4a'] },
        { name: 'Media Files', extensions: ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'wmv', 'm4v', 'mp3', 'wav', 'flac', 'm4a'] }
      ]
    });

    return result;
  });

  // Handle opening file in explorer/finder
  ipcMain.handle('open-file-in-explorer', async (event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });

  // Handle getting folder contents
  ipcMain.handle('get-folder-contents', async (event, folderPath: string) => {
    try {
      const files = await fs.promises.readdir(folderPath);
      return files
        .map(file => path.join(folderPath, file))
        .filter(file => {
          try {
            return fs.statSync(file).isFile();
          } catch {
            return false;
          }
        });
    } catch (error) {
      console.error('Failed to read folder contents:', error);
      return [];
    }
  });
}
