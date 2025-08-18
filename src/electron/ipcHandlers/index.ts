import { BrowserWindow, ipcMain } from 'electron';
import { setupWindowHandlers } from './windowHandlers';
import { setupFileHandlers } from './fileHandlers';
import { setupSettingsHandlers } from './settingsHandlers';
import { setupMetadataHandlers } from './metadataHandlers';
import { setupSystemHandlers } from './systemHandlers';
import { setupLogForwarding } from './logHandlers';

export function setupIpcHandlers(window: BrowserWindow) {
  const allHandlers = {
    ...setupWindowHandlers(window),
    ...setupFileHandlers(window),
    ...setupSettingsHandlers(),
    ...setupMetadataHandlers(),
    ...setupSystemHandlers(window),
    ...setupLogForwarding(window)
  };

  for (const [key, handler] of Object.entries(allHandlers)) {
    ipcMain.handle(key, (event, ...args) => handler(...args as [any]));
  }

  return allHandlers;
}

export type AllIpcHandlers = ReturnType<typeof setupIpcHandlers>;
