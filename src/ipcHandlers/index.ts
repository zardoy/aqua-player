import { BrowserWindow } from 'electron';
import { setupWindowHandlers } from './windowHandlers';
import { setupFileHandlers } from './fileHandlers';
import { setupSettingsHandlers } from './settingsHandlers';

export function setupIpcHandlers(mainWindow: BrowserWindow) {
  setupWindowHandlers(mainWindow);
  setupFileHandlers(mainWindow);
  setupSettingsHandlers();
}
