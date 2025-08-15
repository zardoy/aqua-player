export const deafultSettings = {
    player__savePosition: true,
    player__saveHistory: true,
    player__volume: 100,
    ui__showTime: 'always' as 'always' | 'never' | 'ui-active',
    advanced__mpvExecutable: '',
    advanced__mpvArgs: '',
    app__firstRun: true,
    app__autoUpdate: true,
    controls__wheelVolumeControl: true,
}

export type AppSettings = typeof deafultSettings;

export const settingsUi: Partial<Record<keyof AppSettings, boolean | {
    choices?: string[];
    tip?: string;
    requiresRestart?: boolean;
}>> = {
    player__savePosition: true,
    controls__wheelVolumeControl: {
        tip: 'Enable mouse wheel scrolling to control volume.',
    },
    ui__showTime: {
        choices: ['always', 'never', 'ui-active'],
    },
    advanced__mpvExecutable: {
        tip: 'The current path to the mpv executable.',
    },
    advanced__mpvArgs: {
        tip: 'Additional arguments to pass to mpv. For example, "--hwdec=auto" to enable hardware decoding.',
    },
    app__autoUpdate: {
        tip: 'Automatically download and install updates when available.',
    },
    // Hide firstRun and volume from settings UI
    app__firstRun: false,
    player__volume: false,
}
