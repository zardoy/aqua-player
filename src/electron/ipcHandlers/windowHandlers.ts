import { app, BrowserWindow } from 'electron';

export function setupWindowHandlers(mainWindow: BrowserWindow) {
  // Set initial progress state
  if (process.platform === 'win32') {
    mainWindow.setProgressBar(-1);
  }

  const handlers = {
    // Window controls
    minimizeWindow() {
      mainWindow?.minimize();
    },

    maximizeWindow() {
      if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow?.maximize();
      }
    },

    closeWindow() {
      mainWindow?.close();
    },

    quit() {
      app.quit();
    },

    toggleFullscreen() {
      if (!mainWindow) return;
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    },

    // Window dragging
    startWindowDrag({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
      if (!mainWindow) return;
      const bounds = mainWindow.getBounds();
      mainWindow.webContents.send('window-drag-enabled', {
        startBounds: bounds,
        startMouseX: mouseX,
        startMouseY: mouseY
      });
    },

    moveWindow({ mouseX, mouseY, startBounds, startMouseX, startMouseY }: { mouseX: number; mouseY: number; startBounds: any; startMouseX: number; startMouseY: number }) {
      if (!mainWindow) return;

      const deltaX = mouseX - startMouseX;
      const deltaY = mouseY - startMouseY;

      mainWindow.setBounds({
        x: startBounds.x + deltaX,
        y: startBounds.y + deltaY,
        width: startBounds.width,
        height: startBounds.height
      });
    },

    // Handle window title updates
    updateWindowTitle(title: string) {
      if (!mainWindow) return;
      mainWindow.setTitle(title || 'Aqua Player');
    },

    // Handle progress bar updates (Windows only)
    updateProgressBar({ isPlaying, progress }: { isPlaying: boolean; progress: number }) {
      if (!mainWindow || process.platform !== 'win32') return;

      if (!isPlaying) {
        // Yellow progress when paused
        mainWindow.setProgressBar(progress, { mode: 'paused' });
      } else {
        // Green progress when playing
        mainWindow.setProgressBar(progress, { mode: 'normal' });
      }

      // Update thumbnail toolbar play/pause button
      mainWindow.webContents.send('update-progress-bar', { isPlaying });
    }
  };

  return handlers;
}
