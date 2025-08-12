import { proxy, useSnapshot } from 'valtio';
import { noCase } from 'change-case';
import { deafultSettings, AppSettings, settingsUi } from '../settingsDefinitions';

// Create a type for settings categories
type SettingsCategory = {
  name: string;
  settings: {
    key: keyof AppSettings;
    label: string;
    value: any;
    type: 'boolean' | 'string' | 'select';
    choices?: string[];
    tip?: string;
    requiresRestart?: boolean;
  }[];
};

// Create the settings state
export const settingsState = proxy({
  ...deafultSettings,
  isDirty: false,
  isSaving: false,
  error: null as string | null,
});

// Helper to get settings categories for UI
export const getSettingsCategories = (): SettingsCategory[] => {
  const categories = new Map<string, SettingsCategory>();

  // Process each setting
  Object.entries(deafultSettings).forEach(([key, defaultValue]) => {
    const _uiConfig = settingsUi[key as keyof AppSettings];

    // Skip if explicitly set to false in settingsUi
    if (_uiConfig === false) return;

    const uiConfig = typeof _uiConfig === 'boolean' ? {} : _uiConfig;

    // Get category from the key (everything before the first dot)
    const [category] = key.split('.');
    const categoryName = noCase(category);

    // Initialize category if it doesn't exist
    if (!categories.has(category)) {
      categories.set(category, {
        name: categoryName,
        settings: [],
      });
    }

    // Get setting name (everything after the first dot)
    const settingName = key.split('.').slice(1).join('.');
    const label = noCase(settingName);

    // Determine setting type and options
    const type = typeof defaultValue === 'boolean' ? 'boolean' :
                 Array.isArray(uiConfig.choices) ? 'select' : 'string';

    // Add setting to category
    categories.get(category)!.settings.push({
      key: key as keyof AppSettings,
      label,
      value: settingsState[key as keyof AppSettings],
      type,
      choices: uiConfig.choices,
      tip: uiConfig.tip,
      requiresRestart: uiConfig.requiresRestart,
    });
  });

  // Sort categories - put 'advanced' last
  return Array.from(categories.values()).sort((a, b) => {
    if (a.name === 'advanced') return 1;
    if (b.name === 'advanced') return -1;
    return a.name.localeCompare(b.name);
  });
};

// Settings actions
export const settingsActions = {
  // Update a setting
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const state = settingsState as any;
    state[key] = value;
    state.isDirty = true;
    settingsActions.syncToMain();
  },

  // Load settings from main process
  loadSettings: async () => {
    try {
      const settings = await window.electronAPI.loadSettings();
      Object.assign(settingsState, settings);
      settingsState.isDirty = false;
      settingsState.error = null;
    } catch (error) {
      settingsState.error = `Failed to load settings: ${error.message}`;
    }
  },

  // Save settings to main process
  saveSettings: async () => {
    try {
      settingsState.isSaving = true;
      const settings = { ...settingsState };
      // Remove non-setting properties
      delete (settings as any).isDirty;
      delete (settings as any).isSaving;
      delete (settings as any).error;

      await window.electronAPI.saveSettings(settings);
      settingsState.isDirty = false;
      settingsState.error = null;
    } catch (error) {
      settingsState.error = `Failed to save settings: ${error.message}`;
    } finally {
      settingsState.isSaving = false;
    }
  },

  // Reset settings to defaults
  resetSettings: () => {
    Object.assign(settingsState, deafultSettings);
    settingsState.isDirty = true;
    settingsActions.syncToMain();
  },

  // Sync settings to main process (debounced)
  syncToMain: (() => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        settingsActions.saveSettings();
      }, 1000);
    };
  })(),
};

export const useSettings = () => {
  const snap = useSnapshot(settingsState);
  return snap;
};
