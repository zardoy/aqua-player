import { app, BrowserWindow, ipcMain, nativeImage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

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
      ipcMain.emit('update-progress-bar', null, { isPlaying });
    }
  };

  return handlers;
}

export const getAssetsPath = () => {
  if (process.env.DEV) {
    return path.join(app.getAppPath(), '../../assets/thumbnail_control/')
  }
  return path.join(app.getAppPath(), 'assets/thumbnail_control/')
}

export const thumbnailToolbar = (window: BrowserWindow) => {
  let currentlyPlaying = false;
  const setButtons = () => {
    let containerPath = ''
    for (const possiblePath of [getAssetsPath(), path.join(process.resourcesPath, 'thumbnail_control/')]) {
      if (fs.existsSync(path.join(possiblePath, 'prev.png'))) {
        containerPath = possiblePath;
        break;
      }
    }


    const thumbnailToolbar = {
      buttons: [
        {
          tooltip: 'Previous',
          icon: nativeImage.createFromPath(path.join(containerPath, 'prev.png')),
          click: () => window?.webContents.send('thumbnail-control', 'prev')
        },
        {
          tooltip: 'Play/Pause',
          icon: nativeImage.createFromPath(path.join(containerPath, `${currentlyPlaying ? 'pause' : 'play'}.png`)),
          click: () => window?.webContents.send('thumbnail-control', 'playpause')
        },
        {
          tooltip: 'Next',
          icon: nativeImage.createFromPath(path.join(containerPath, 'next.png')),
          click: () => window?.webContents.send('thumbnail-control', 'next')
        },
        // {
        //   tooltip: 'Toggle Fullscreen',
        //   icon: nativeImage.createFromPath(path.join(containerPath, 'fullscreen.png')),
        //   click: () => window?.webContents.send('thumbnail-control', 'fullscreen')
        // }
      ]
    };

    window.setThumbarButtons(thumbnailToolbar.buttons);
  }
  if (process.platform === 'win32') {
    setButtons()

    // Update play/pause button based on playback state
    ipcMain.on('update-progress-bar', (_event, { isPlaying }) => {
      currentlyPlaying = isPlaying;
      setButtons();
    });
  }
}
