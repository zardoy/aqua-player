import { BrowserWindow } from 'electron';
import { setupWindowHandlers } from './windowHandlers';
import { setupFileHandlers } from './fileHandlers';
import { setupSettingsHandlers } from './settingsHandlers';
import { setupMetadataHandlers } from './metadataHandlers';
import { setupSystemHandlers } from './systemHandlers';
import { setupLogForwarding } from './logHandlers';

export function setupIpcHandlers(mainWindow: BrowserWindow) {
  setupWindowHandlers(mainWindow);
  setupFileHandlers(mainWindow);
  setupSettingsHandlers();
  setupMetadataHandlers();
  setupSystemHandlers();
  setupLogForwarding(mainWindow);
}
