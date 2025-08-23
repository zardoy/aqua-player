import type { BrowserWindow } from 'electron';
import util from 'util';

export function setupLogForwarding(mainWindow: BrowserWindow) {
  const sendLog = (level: 'log' | 'info' | 'warn' | 'error' | 'debug', args: any[]) => {
    try {
      if (!mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isDestroyed()) return;
      const formatted = args.map((a) =>
        typeof a === 'string' ? a : util.inspect(a, { depth: 5, colors: false })
      );
      mainWindow.webContents.send('main-log', { level, args: formatted });
    } catch { /* empty */ }
  };

  const original = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug ? console.debug.bind(console) : console.log.bind(console),
  } as const;

  console.log = (...args: any[]) => {
    original.log(...args);
    sendLog('log', args);
  };
  console.info = (...args: any[]) => {
    original.info(...args);
    sendLog('info', args);
  };
  console.warn = (...args: any[]) => {
    original.warn(...args);
    sendLog('warn', args);
  };
  console.error = (...args: any[]) => {
    original.error(...args);
    sendLog('error', args);
  };
  if (console.debug) {
    console.debug = (...args: any[]) => {
      original.debug(...args);
      sendLog('debug', args);
    };
  }

  // Return empty handlers since this is just for log forwarding
  return {};
}
