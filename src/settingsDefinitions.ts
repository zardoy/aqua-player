export const deafultSettings = {
    "player.savePosition": true,
    "player.saveHistory": true,

    "player.volume": 100,

    "ui.showTime": 'always' as 'always' | 'never' | 'ui-active',

    "advanced.mpvExecutable": '',
    "advanced.mpvArgs": '',

    "app.firstRun": true,
    "app.autoUpdate": true,

    "controls.wheelVolumeControl": true,
}

export type AppSettings = typeof deafultSettings;

export const settingsUi: Partial<Record<keyof AppSettings, boolean | {
    choices?: string[];
    tip?: string;
    requiresRestart?: boolean;
}>> = {
    "player.savePosition": true,
    "controls.wheelVolumeControl": {
        tip: 'Enable mouse wheel scrolling to control volume.',
    },
    "ui.showTime": {
        choices: ['always', 'never', 'ui-active'],
    },
    "advanced.mpvExecutable": {
        tip: 'The current path to the mpv executable.',
    },
    "advanced.mpvArgs": {
        tip: 'Additional arguments to pass to mpv. For example, "--hwdec=auto" to enable hardware decoding.',
    },
    "app.autoUpdate": {
        tip: 'Automatically download and install updates when available.',
    },
    // Hide firstRun and volume from settings UI
    "app.firstRun": false,
    "player.volume": false,
}
