import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { deafultSettings } from '../settingsDefinitions';

export function setupSettingsHandlers() {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');

  const handlers = {
    async loadSettings() {
      try {
        if (fs.existsSync(settingsPath)) {
          const data = fs.readFileSync(settingsPath, 'utf8');
          return JSON.parse(data);
        }
        return deafultSettings;
      } catch (error) {
        console.error('Failed to load settings:', error);
        return deafultSettings;
      }
    },

    async saveSettings(settings: any) {
      try {
        const data = JSON.stringify(settings, null, 2);
        fs.writeFileSync(settingsPath, data, 'utf8');
        return true;
      } catch (error) {
        console.error('Failed to save settings:', error);
        return false;
      }
    }
  };

  return handlers;
}

export async function loadSettingsFromDisk() {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');

  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    }
    return deafultSettings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return deafultSettings;
  }
}
