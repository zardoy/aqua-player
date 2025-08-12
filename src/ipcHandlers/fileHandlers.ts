import { BrowserWindow, dialog, shell, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AUDIO_EXTENSIONS, VIDEO_EXTENSIONS } from '../shared/constants';

export function setupFileHandlers(mainWindow: BrowserWindow) {
  // Handle opening video files
  ipcMain.handle('open-file-dialog', async () => {
    if (!mainWindow) return { canceled: true };

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Videos', extensions: VIDEO_EXTENSIONS },
        { name: 'Audio', extensions: AUDIO_EXTENSIONS },
        { name: 'Media Files', extensions: [...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS] }
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
