import { BrowserWindow, dialog, shell, ipcMain } from 'electron';

export function setupFileHandlers(mainWindow: BrowserWindow) {
  // Handle opening video files
  ipcMain.handle('open-file-dialog', async () => {
    if (!mainWindow) return { canceled: true };

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'wmv', 'm4v'] }
      ]
    });

    return result;
  });

  // Handle opening file in explorer/finder
  ipcMain.handle('open-file-in-explorer', async (event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });
}
