export const deafultSettings = {
    player__savePosition: true,
    player__saveHistory: true,
    player__volume: 100,
    player__loop: false,
    player__autoPlay: true,

    ui__showTime: 'always' as 'always' | 'never' | 'ui-active',

    advanced__mpvExecutable: '',
    advanced__mpvArgs: '',

    app__firstRun: true,
    app__autoUpdate: true,
    app__enableFileAssociations: false,
    app__ignoredOnSave: [] as string[],

    controls__wheelVolumeControl: true,
    controls__zoomEnabled: true,
    controls__zoomSensitivity: 0.1,
    controls__thumbnailControls: true,
    controls__autoPlayOnSeek: false,
    controls__shortSeekDistance: 1,
    controls__longSeekDistance: 10,

    remoteUI__enabled: false,
    remoteUI__password: '',

    // account__customServer: '', // https://aqua-player.zardoy.com/
    // account__token: '',
    // account__syncHistory: true,
    // account__syncSettings: true,
    // account__syncSettingsIgnore: [] as string[],
    // account__syncKeybindingsIgnorePlatforms: [] as string[],
}

export type AppSettings = typeof deafultSettings;

export const settingsUi: Partial<Record<keyof AppSettings, boolean | {
    choices?: string[];
    tip?: string;
    requiresRestart?: boolean;
}>> = {
    player__savePosition: true,
    controls__autoPlayOnSeek: {
        tip: 'Automatically resume playback after seeking with arrow keys / slider.',
    },
    controls__shortSeekDistance: {
        tip: 'Distance in seconds for short seek jumps (1-30 seconds).',
    },
    controls__longSeekDistance: {
        tip: 'Distance in seconds for long seek jumps (5-300 seconds).',
    },
    controls__wheelVolumeControl: {
        tip: 'Enable mouse wheel scrolling to control volume.',
    },
    controls__zoomEnabled: {
        tip: 'Enable Ctrl+wheel zooming for video content.',
    },
    controls__zoomSensitivity: {
        tip: 'Sensitivity of zoom controls (0.05 to 0.5).',
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
    player__loop: false,
    player__autoPlay: false,
    app__enableFileAssociations: {
        tip: 'Enable file associations for .mpv files.',
    },
}
