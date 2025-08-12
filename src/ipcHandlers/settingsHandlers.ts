import { app, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { deafultSettings } from '../settingsDefinitions';

export const loadSettingsFromDisk = () => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    if (!fs.existsSync(settingsPath)) {
      fs.writeFileSync(settingsPath, JSON.stringify(deafultSettings, null, 2));
      return deafultSettings;
    }
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    return { ...deafultSettings, ...settings };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return deafultSettings;
  }
};

export function setupSettingsHandlers() {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');

  // Load settings from disk
  ipcMain.handle('load-settings', async () => {
    return loadSettingsFromDisk();
  });

  // Save settings to disk
  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  });
}
