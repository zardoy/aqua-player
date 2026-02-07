import { app, BrowserWindow, protocol, net } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';
import { setupIpcHandlers } from './ipcHandlers';
import { setupWindowsFileAssociations } from './ipcHandlers/fileAssociationHandler';
import WindowKeeper from 'electron-window-keeper';
import { thumbnailToolbar } from './ipcHandlers/windowHandlers';
import './utils/autoUpdater';

// Replace Forge's magic constants with direct paths
const MAIN_WINDOW_WEBPACK_ENTRY = process.env.DEV
  ? 'http://localhost:3000' // Dev server URL
  : `file://${path.join(__dirname, '../renderer/index.html')}`; // Prod path

const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = path.join(__dirname, 'preload.js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

// Ensure single instance to handle file open events
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.on('second-instance', (_event, argv) => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();

  // Log argv for diagnostics and attempt to locate a file path argument
  console.info('second-instance argv:', argv);
  const fileArg = argv.slice(1).find((a) => {
    if (!a) return false;
    if (a.startsWith('-')) return false; // skip flags
    return a.includes('/') || a.includes('\\') || /^[a-zA-Z]:\\/.test(a);
  });
  if (fileArg) {
    console.info('second-instance opening file:', fileArg);
    mainWindow.webContents.send('open-file', fileArg);
  }
});

// macOS open-file handler
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send('open-file', filePath);
  }
});

const createWindow = (): void => {
  const windowState = new WindowKeeper();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 720,
    width: 1280,
    minWidth: 640,
    minHeight: 480,
    ...windowState.restoredFullState,
    fullscreen: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    backgroundColor: '#121212',
    frame: false, // Make window borderless
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(0, 0, 0, 0)',
      symbolColor: '#ffffff',
      height: 30,
    },
    // dark theme
    darkTheme: true,
  });

  windowState.manage(mainWindow);



  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Set CSP to allow our custom protocol and development tools
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: local-file: file: ws: wss:; " +
          "media-src 'self' data: local-file: file: blob: https://filesamples.com http: https:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' ws: wss:; " +
          "connect-src 'self' ws: wss: http: https:; " +
          "img-src 'self' data: local-file: file: blob: http: https:;"
        ]
      }
    });
  });


  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Set up IPC handlers for file operations
  initializeIpcHandlers();

  // Set up Windows thumbnail toolbar
  thumbnailToolbar(mainWindow);
};

// Set up IPC handlers for communication between renderer and main process
const initializeIpcHandlers = () => {
  setupIpcHandlers(mainWindow!);
};



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set up file associations based on settings
  // Handle custom protocol for local files
  protocol.handle('local-file', (req) => {
    let filePath = req.url.replace('local-file://', '');
    if (process.platform !== 'win32' && !filePath.startsWith('/')) filePath = `/${filePath}`;

    // Check if file exists
    if (fs.existsSync(filePath)) {
      return net.fetch(pathToFileURL(filePath).toString());
    } else {
      return new Response('File not found', {
        status: 404,
        headers: { 'content-type': 'text/plain' }
      });
    }
  });

  createWindow();

  // After window is created, forward any initial file argument passed on cold start
  try {
    // Initialize IPC handlers (this also wires up log forwarding)
    // setupWindowsFileAssociations may have been called already by settings handler; re-run to be safe
    await setupWindowsFileAssociations();

    // Log initial argv so frontend receives it through the automatic log forwarding
    console.info('initial process.argv:', process.argv);

    // Look for a plausible file path in the initial argv (skip executable path and flags)
    const initialFile = process.argv.slice(1).find((a) => {
      if (!a) return false;
      if (a.startsWith('-')) return false;
      return a.includes('/') || a.includes('\\') || /^[a-zA-Z]:\\/.test(a);
    });
    if (initialFile && mainWindow) {
      console.info('initial open-file:', initialFile);
      mainWindow.webContents.send('open-file', initialFile);
    }
  } catch (err) {
    console.error('Error processing initial argv or file associations:', err);
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
