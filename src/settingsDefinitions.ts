export interface AppSettings {
  'player.savePosition': boolean;
  'ui.showTime': 'always' | 'never' | 'ui-active';
  'advanced.mpvExecutable': string;
  'advanced.mpvArgs': string;
  fileAssociations: {
    isDefault: boolean;
    extensions: string[];
  };
  broadcast: {
    enabled: boolean;
    quality: 'auto' | 'high' | 'medium' | 'low';
    allowAirPlay: boolean;
    allowDLNA: boolean;
  };
}

export const deafultSettings: AppSettings = {
  'player.savePosition': true,
  'ui.showTime': 'always',
  'advanced.mpvExecutable': '',
  'advanced.mpvArgs': '',
  fileAssociations: {
    isDefault: false,
    extensions: ['.mp4', '.webm', '.mkv', '.mov', '.avi', '.m4v', '.wmv'],
  },
  broadcast: {
    enabled: true,
    quality: 'auto',
    allowAirPlay: true,
    allowDLNA: true,
  },
};

export const settingsUi: { [K in keyof AppSettings]: boolean | {
  choices?: string[];
  tip?: string;
  requiresRestart?: boolean;
}} = {
  'player.savePosition': true,
  'ui.showTime': {
    choices: ['always', 'never', 'ui-active'],
    tip: 'When to show the time display',
  },
  'advanced.mpvExecutable': {
    tip: 'Path to mpv executable. Leave empty to use built-in player.',
    requiresRestart: true,
  },
  'advanced.mpvArgs': {
    tip: 'Additional arguments to pass to mpv. For example, "--hwdec=auto" to enable hardware decoding.',
  },
  fileAssociations: {
    tip: 'Make Aqua Player the default app for video files',
  },
  broadcast: {
    tip: 'Enable broadcasting to other devices (AirPlay, DLNA)',
  },
};
