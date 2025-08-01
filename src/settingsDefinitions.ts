export const deafultSettings = {
    "player.savePosition": true,

    "ui.showTime": 'always' as 'always' | 'never' | 'ui-active',

    "advanced.mpvExecutable": '',
    "advanced.mpvArgs": '',
}

export type AppSettings = typeof deafultSettings;

export const settingsUi: Partial<Record<keyof AppSettings, boolean | {
    choices?: string[];
    tip?: string;
    requiresRestart?: boolean;
}>> = {
    "player.savePosition": true,
    "ui.showTime": {
        choices: ['always', 'never', 'ui-active'],
    },
    "advanced.mpvExecutable": {
        tip: 'The current path to the mpv executable.',
    },
    "advanced.mpvArgs": {
        tip: 'Additional arguments to pass to mpv. For example, "--hwdec=auto" to enable hardware decoding.',
    },
}
