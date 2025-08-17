import { BrowserWindow, dialog, shell, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AUDIO_EXTENSIONS, VIDEO_EXTENSIONS } from '../shared/constants';

export function setupFileHandlers(mainWindow: BrowserWindow) {
  const handlers = {
    async openFileDialog() {
      if (!mainWindow) return;

      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Videos', extensions: VIDEO_EXTENSIONS },
          { name: 'Audio', extensions: AUDIO_EXTENSIONS },
          { name: 'Media Files', extensions: [...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS] }
        ]
      });

      return result;
    },

    async openFileInExplorer(filePath: string) {
      shell.showItemInFolder(filePath);
    },

    async getFolderContents(folderPath: string) {
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
    }
  };

  return handlers;
}
