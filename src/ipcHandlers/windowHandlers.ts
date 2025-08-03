import { app, BrowserWindow, ipcMain } from 'electron';

export function setupWindowHandlers(mainWindow: BrowserWindow) {
  // Set initial progress state
  if (process.platform === 'win32') {
    mainWindow.setProgressBar(-1);
  }
  // Window controls
  ipcMain.on('minimize-window', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    mainWindow?.close();
  });

  ipcMain.on('quit', () => {
    app.quit();
  });

  ipcMain.on('toggle-fullscreen', () => {
    if (!mainWindow) return;
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  // Window dragging
  ipcMain.on('window-drag-start', (event, { mouseX, mouseY }) => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    event.sender.send('window-drag-enabled', {
      startBounds: bounds,
      startMouseX: mouseX,
      startMouseY: mouseY
    });
  });

    ipcMain.on('window-drag-move', (event, { mouseX, mouseY, startBounds, startMouseX, startMouseY }) => {
    if (!mainWindow) return;

    const deltaX = mouseX - startMouseX;
    const deltaY = mouseY - startMouseY;

    mainWindow.setBounds({
      x: startBounds.x + deltaX,
      y: startBounds.y + deltaY,
      width: startBounds.width,
      height: startBounds.height
    });
  });

  // Handle window title updates
  ipcMain.on('update-window-title', (event, title: string) => {
    if (!mainWindow) return;
    mainWindow.setTitle(title || 'Aqua Player');
  });

  // Handle progress bar updates (Windows only)
  ipcMain.on('update-progress-bar', (event, { isPlaying, progress }: { isPlaying: boolean; progress: number }) => {
    if (!mainWindow || process.platform !== 'win32') return;

    if (!isPlaying) {
      // Yellow progress when paused
      mainWindow.setProgressBar(progress, { mode: 'paused' });
    } else {
      // Green progress when playing
      mainWindow.setProgressBar(progress, { mode: 'normal' });
    }
  });
}
