import { BrowserWindow, ipcMain } from 'electron';

export function setupWindowHandlers(mainWindow: BrowserWindow) {
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
}
