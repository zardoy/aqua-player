import { videoActions, videoState } from './store/videoStore';
import type { AllKeyCodes } from './client/appKeymap';
import { electronMethods } from './ipcRenderer';
import { toast } from 'sonner';
import { settingsState } from './store/settingsStore';

export interface Command {
  name?: string;
  description?: string;
  action: (args?: any[]) => void;
  category?: string;
  keybind?: {
    code: AllKeyCodes;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
  };
  args?: BaseArg[];
}

// Base argument class
export abstract class BaseArg {
  constructor(
    public name: string,
    public description: string,
    public required: boolean = true,
    public defaultValue?: any
  ) {}

  abstract validate(value: string): any;
  abstract getPromptText(): string;
}

// String argument class
export class StringArg extends BaseArg {
  constructor(name: string, description: string, required = true, defaultValue?: string) {
    super(name, description, required, defaultValue);
  }

  validate(value: string): string {
    return value.trim();
  }

  getPromptText(): string {
    if (this.defaultValue !== undefined) {
      return `${this.name} (${this.description}) [${this.defaultValue}]:`;
    }
    return `${this.name} (${this.description}):`;
  }

  static optional(name: string, description: string, defaultValue?: string): StringArg {
    return new StringArg(name, description, false, defaultValue);
  }

  static required(name: string, description: string): StringArg {
    return new StringArg(name, description, true);
  }
}

// Number argument class
export class NumberArg extends BaseArg {
  constructor(
    name: string,
    description: string,
    required = true,
    defaultValue?: number,
    public min?: number,
    public max?: number
  ) {
    super(name, description, required, defaultValue);
  }

  validate(value: string): number {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new Error(`${this.name} must be a valid number`);
    }
    if (this.min !== undefined && num < this.min) {
      throw new Error(`${this.name} must be at least ${this.min}`);
    }
    if (this.max !== undefined && num > this.max) {
      throw new Error(`${this.name} must be at most ${this.max}`);
    }
    return num;
  }

  getPromptText(): string {
    let prompt = `${this.name} (${this.description})`;
    if (this.min !== undefined && this.max !== undefined) {
      prompt += ` [${this.min}-${this.max}]`;
    } else if (this.min !== undefined) {
      prompt += ` [min: ${this.min}]`;
    } else if (this.max !== undefined) {
      prompt += ` [max: ${this.max}]`;
    }
    if (this.defaultValue !== undefined) {
      prompt += ` [${this.defaultValue}]:`;
    } else {
      prompt += ':';
    }
    return prompt;
  }

  static optional(name: string, description: string, defaultValue?: number, min?: number, max?: number): NumberArg {
    return new NumberArg(name, description, false, defaultValue, min, max);
  }

  static required(name: string, description: string, min?: number, max?: number): NumberArg {
    return new NumberArg(name, description, true, undefined, min, max);
  }
}

// Time argument class for MM:SS or seconds format
export class TimeArg extends BaseArg {
  constructor(name: string, description: string, required = true, defaultValue?: string) {
    super(name, description, required, defaultValue);
  }

  validate(value: string): number {
    const timeArg = value.trim();
    let timeInSeconds: number;

    // Check if it's in MM:SS format
    if (timeArg.includes(':')) {
      const parts = timeArg.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0]);
        const seconds = parseInt(parts[1]);
        if (!isNaN(minutes) && !isNaN(seconds)) {
          timeInSeconds = minutes * 60 + seconds;
        } else {
          throw new Error('Invalid time format. Use MM:SS or seconds');
        }
      } else {
        throw new Error('Invalid time format. Use MM:SS or seconds');
      }
    } else {
      // Try to parse as seconds
      timeInSeconds = parseFloat(timeArg);
      if (isNaN(timeInSeconds)) {
        throw new Error('Invalid time value');
      }
    }

    return timeInSeconds;
  }

  getPromptText(): string {
    let prompt = `${this.name} (${this.description})`;
    if (this.defaultValue !== undefined) {
      prompt += ` [${this.defaultValue}]:`;
    } else {
      prompt += ':';
    }
    return prompt;
  }

  static optional(name: string, description: string, defaultValue?: string): TimeArg {
    return new TimeArg(name, description, false, defaultValue);
  }

  static required(name: string, description: string): TimeArg {
    return new TimeArg(name, description, true);
  }
}

// Helper type function to create commands with proper typing
const makeCommands = <T extends string>(commands: Record<T, Command>): Record<T, Command> => commands;

// Utility type for when you need the array item with id
export type CommandArrayItem = Command & { id: string };

// Do not add new commands until explicitly asked for, for example help or change settings commands
export const commands = makeCommands({
  video_togglePlay: {
    name: 'Toggle Play/Pause',
    description: 'Toggle between play and pause states',
    action: videoActions.togglePlay,
    category: 'Video',
    keybind: { code: 'Space' }
  },
  video_seekForward: {
    name: 'Seek Forward',
    description: 'Seek forward 10 seconds',
    action: () => videoActions.seekForward(10),
    category: 'Video',
    keybind: { code: 'ArrowRight' }
  },
  video_seekBackward: {
    name: 'Seek Backward',
    description: 'Seek backward 10 seconds',
    action: () => videoActions.seekBackward(10),
    category: 'Video',
    keybind: { code: 'ArrowLeft' }
  },
  video_seekShortForward: {
    name: 'Seek Short Forward',
    description: 'Seek forward by short distance (1 second by default)',
    action: videoActions.seekShortForward,
    category: 'Video',
    keybind: { code: 'ArrowRight', shiftKey: true }
  },
  video_seekShortBackward: {
    name: 'Seek Short Backward',
    description: 'Seek backward by short distance (1 second by default)',
    action: videoActions.seekShortBackward,
    category: 'Video',
    keybind: { code: 'ArrowLeft', shiftKey: true }
  },
  video_seekLongForward: {
    name: 'Seek Long Forward',
    description: 'Seek forward by long distance (10 seconds by default)',
    action: videoActions.seekLongForward,
    category: 'Video',
    keybind: { code: 'ArrowRight', ctrlKey: true }
  },
  video_seekLongBackward: {
    name: 'Seek Long Backward',
    description: 'Seek backward by long distance (10 seconds by default)',
    action: videoActions.seekLongBackward,
    category: 'Video',
    keybind: { code: 'ArrowLeft', ctrlKey: true }
  },
  audio_volumeUp: {
    name: 'Increase Volume',
    description: 'Increase volume by 10%',
    action: () => videoActions.increaseVolume(0.1),
    category: 'Audio',
    keybind: { code: 'ArrowUp' }
  },
  audio_volumeDown: {
    name: 'Decrease Volume',
    description: 'Decrease volume by 10%',
    action: () => videoActions.decreaseVolume(0.1),
    category: 'Audio',
    keybind: { code: 'ArrowDown' }
  },
  audio_toggleMute: {
    name: 'Toggle Mute',
    description: 'Mute or unmute audio',
    action: videoActions.toggleMute,
    category: 'Audio',
    keybind: { code: 'KeyM' }
  },
  audio_setVolume: {
    name: 'Set Volume',
    description: 'Set volume to a specific percentage (0-100)',
    action: (args) => {
      if (!args || args.length === 0) {
        toast.error('Please provide a volume percentage');
        return;
      }

      try {
        const volumePercent = args[0];
        const volumeDecimal = volumePercent / 100;
        videoActions.setVolume(volumeDecimal);
        toast.success(`Volume set to ${volumePercent}%`);
      } catch (error) {
        toast.error(error.message);
      }
    },
    category: 'Audio',
    args: [
      NumberArg.required('volume', 'Volume percentage', 0, 100)
    ]
  },
  view_toggleFullscreen: {
    name: 'Toggle Fullscreen',
    description: 'Enter or exit fullscreen mode',
    action: videoActions.toggleFullScreen,
    category: 'View',
    keybind: { code: 'KeyF' }
  },
  video_nextFrame: {
    name: 'Next Frame',
    description: 'Step to next frame',
    action: videoActions.nextFrame,
    category: 'Video',
    keybind: { code: 'Period' }
  },
  video_previousFrame: {
    name: 'Previous Frame',
    description: 'Step to previous frame',
    action: videoActions.previousFrame,
    category: 'Video',
    keybind: { code: 'Comma' }
  },
  subtitles_toggle: {
    name: 'Toggle Subtitles',
    description: 'Show or hide subtitles',
    action: videoActions.toggleSubtitles,
    category: 'Subtitles',
    keybind: { code: 'KeyV' }
  },
  audio_nextTrack: {
    name: 'Next Audio Track',
    description: 'Switch to next audio track',
    action: videoActions.nextAudioTrack,
    category: 'Audio',
    keybind: { code: 'KeyA' }
  },
  audio_previousTrack: {
    name: 'Previous Audio Track',
    description: 'Switch to previous audio track',
    action: videoActions.previousAudioTrack,
    category: 'Audio',
    keybind: { code: 'KeyA', shiftKey: true }
  },
  help_showKeymap: {
    name: 'Show Keymap',
    description: 'Display keyboard shortcuts',
    action: videoActions.toggleKeymapDialog,
    category: 'Help',
    keybind: { code: 'Slash', shiftKey: true }
  },
  help_showCommandPalette: {
    name: 'Show Command Palette',
    description: 'Open command palette to search and execute commands',
    action: videoActions.toggleCommandPalette,
    category: 'Help',
    keybind: { code: 'KeyP', ctrlKey: true, shiftKey: true }
  },
  video_increaseSpeed: {
    name: 'Increase Playback Speed',
    description: 'Increase video playback rate',
    action: videoActions.increasePlaybackRate,
    category: 'Video',
    keybind: { code: 'Equal' }
  },
  video_decreaseSpeed: {
    name: 'Decrease Playback Speed',
    description: 'Decrease video playback rate',
    action: videoActions.decreasePlaybackRate,
    category: 'Video',
    keybind: { code: 'Minus' }
  },
  video_resetSpeed: {
    name: 'Reset Playback Speed',
    description: 'Reset playback rate to 1x',
    action: videoActions.resetPlaybackRate,
    category: 'Video',
    keybind: { code: 'Digit0' }
  },
  file_open: {
    name: 'Open File',
    description: 'Open a video file',
    action: videoActions.loadFile,
    category: 'File',
    keybind: { code: 'KeyO' }
  },
  view_togglePlaylist: {
    name: 'Toggle Playlist',
    description: 'Show or hide playlist sidebar',
    action: videoActions.togglePlaylist,
    category: 'View',
    keybind: { code: 'KeyP' }
  },
  view_toggleHistory: {
    name: 'Toggle File History',
    description: 'Show or hide file history sidebar',
    action: videoActions.toggleHistory,
    category: 'View',
    keybind: { code: 'KeyH' }
  },
  app_quit: {
    name: 'Quit Application',
    description: 'Exit the application',
    action: () => electronMethods.quit(),
    category: 'Application',
    keybind: { code: 'KeyQ', ctrlKey: true }
  },
  window_close: {
    name: 'Close Window',
    description: 'Close the current window',
    action: () => electronMethods.closeWindow(),
    category: 'Application',
    keybind: { code: 'KeyW', ctrlKey: true }
  },
  settings_fileAssociation: {
    name: 'File Association Settings',
    description: 'Configure file associations for video files',
    action: videoActions.toggleFileAssociationDialog,
    category: 'Settings'
  },
  debug_testError: {
    name: 'Test Error Boundary',
    description: 'Trigger an error to test the error boundary',
    action: () => { throw new Error('Test error for debugging purposes'); },
    category: 'Debug'
  },
  window_bossMode: {
    name: 'Boss Mode (Minimize & Pause)',
    description: 'Minimize the window and pause playback',
    action: () => {
      electronMethods.minimizeWindow();
      videoActions.pause();
    },
    category: 'Window',
    keybind: { code: 'KeyB' }
  },
  video_resetZoom: {
    name: 'Reset Zoom',
    description: 'Reset video zoom to 100%',
    action: videoActions.resetZoom,
    category: 'Video',
    keybind: { code: 'Digit0', ctrlKey: true }
  },
  video_toggleZoom: {
    name: 'Toggle Zoom',
    description: 'Enable or disable video zooming',
    action: videoActions.toggleZoom,
    category: 'Video',
  },
  stream_pasteUrl: {
    name: 'Paste Stream URL / File Path',
    description: 'Paste HTTP/HTTPS URL or file path from clipboard to load stream',
    action: async () => {
      try {
        let text = await navigator.clipboard.readText();
        text = text.trim()
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.slice(1, -1);
        }
        if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('file://'))) {
          videoActions.loadStreamUrl(text);
        } else if (text.match(/^[a-zA-Z]:\\/) || text.match(/^\//)) {
          videoActions.loadFilePath(text);
        } else {
          toast.error('Invalid URL format. Please copy a valid HTTP/HTTPS URL or file path.');
        }
      } catch (error) {
        console.error('Failed to read clipboard:', error);
        toast.error('Failed to read clipboard');
      }
    },
    category: 'Streaming',
    keybind: { code: 'KeyV', ctrlKey: true }
  },
  stream_copyUrl: {
    name: 'Copy Stream URL / File Path',
    description: 'Copy current video source URL to clipboard',
    action: async () => {
      try {
        const src = videoActions.getCurrentSrc();
        if (src) {
          await navigator.clipboard.writeText(src);
          // Show success toast

          toast.success('URL copied to clipboard');
        }
      } catch (error) {
        console.error('Failed to write to clipboard:', error);
        // Show error toast
        try {

          toast.error('Failed to copy URL');
        } catch (toastError) {
          // Toast not available
        }
      }
    },
    category: 'Streaming',
    keybind: { code: 'KeyC', ctrlKey: true, shiftKey: true }
  },
  stream_showCurrentUrl: {
    name: 'Show Current URL / File Path',
    description: 'Display current video source URL',
    action: () => {
      const src = videoState.currentFile;
      if (src) {
        if (src.startsWith('http://') || src.startsWith('https://')) {
          toast.info(`Stream URL: ${src}`);
        } else {
          toast.info(`File path: ${src}`);
        }
      } else {
        toast.error('No file loaded');
      }
    },
    category: 'Streaming',
  },
  stream_openInBrowser: {
    name: 'Open URL in Browser',
    description: 'Open current video URL in default browser',
    action: () => {
      const src = videoState.currentFile;
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        try {
          window.open(src, '_blank');
          toast.success('Opened in browser');
        } catch (error) {
          toast.error('Failed to open in browser');
        }
      } else {
        toast.error('Not a valid URL');
      }
    },
    category: 'Streaming',
    keybind: { code: 'KeyO', ctrlKey: true, altKey: true }
  },
  stream_reload: {
    name: 'Reload Frontend (Ctrl+R)',
    description: 'Reload current video frontend',
    action: () => {
      const videoTime = videoState.currentTime;
      const url = new URL(location.href);
      url.searchParams.set('time', videoTime.toString());
      url.searchParams.set('file', videoState.currentFile || '');
      window.location.href = url.toString();
    },
    category: 'Debug',
  },
  file_showInfo: {
    name: 'Show File / Stream Info',
    description: 'Display information about current file',
    action: () => {
      const src = videoState.currentFile;
      if (!src) {
        toast.error('No file loaded');
        return
      }
      const fileName = src.split(/[/\\]/).pop() || src;
      const info = [
        `Type: Local File`,
        `Name: ${fileName}`,
        `Path: ${src}`,
        `Duration: ${videoState.duration > 0 ? `${Math.floor(videoState.duration / 60)}:${Math.floor(videoState.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}`,
        `Resolution: ${videoState.videoResolutionDisplay || 'Unknown'}`,
        `Codec: ${videoState.videoCodec || 'Unknown'}`,
        `FPS: ${videoState.fps || 'Unknown'}`,
        `Bitrate: ${videoState.videoBitrate ? `${Math.round(videoState.videoBitrate / 1000)} kbps` : 'Unknown'}`
      ].join('\n');
      toast.info(`File Information:\n${info}`);
    },
    category: 'File',
    keybind: { code: 'KeyI', ctrlKey: true }
  },
  help_showVersion: {
    name: 'Show Version Info',
    description: 'Display application version information',
    action: () => {
      const version = process.env.APP_VERSION || 'unknown';
      const info = [
        `ℹ️ Aqua Player Version Info:`,
        ``,
        `Version: ${version}`,
        `Platform: ${navigator.platform}`,
        `User Agent: ${navigator.userAgent}`,
        `Language: ${navigator.language}`,
        `Online: ${navigator.onLine}`,
        // `Hardware Concurrency: ${navigator.hardwareConcurrency || 'Unknown'}`,
        `Memory Used: ${(performance as any).memory ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)}MB` : 'Unknown'}`,
      ].join('\n');
      toast.info(info, { duration: 15000 });
    },
    category: 'Help',
  },
  help_showCredits: {
    name: 'Show Credits',
    description: 'Display application credits and acknowledgments',
    action: () => {
      const credits = [
        `🎭 Aqua Player Credits:`,
        ``,
        `👨‍💻 Developer:`,
        `• Vitaly Turovsky`,
        `• Email: vital2580@icloud.com`,
        ``,
        `🛠️ Technologies:`,
        `• Electron - Cross-platform desktop app framework`,
        `• React - User interface library`,
        `• TypeScript - Type-safe JavaScript`,
        `• Valtio - State management`,
        `• Framer Motion - Animation library`,
        `• Sonner - Toast notifications`,
        `• React Icons - Icon library`,
        `• FFmpeg - Video processing library`,
        ``,
        `🌐 Open Source: Yes`
      ].join('\n');
      toast.info(credits, { duration: 20000 });
    },
    category: 'Help',
  },
  video_seekToTime: {
    name: 'Seek to Specific Time',
    description: 'Seek to a specific time in seconds or MM:SS format',
    action: (args) => {
      if (!args || args.length === 0) {
        toast.error('Please provide a time value');
        return;
      }

      try {
        const timeInSeconds = args[0];
        videoActions.setCurrentTime(timeInSeconds, false);
        toast.success(`Seeked to ${timeInSeconds}s`);
      } catch (error) {
        toast.error(error.message);
      }
    },
    category: 'Video',
    keybind: { code: 'KeyT' },
    args: [
      TimeArg.required('time', 'Time in seconds (e.g., 30) or MM:SS format (e.g., 1:30)')
    ]
  },
  video_setPlaybackSpeed: {
    name: 'Set Playback Speed',
    description: 'Set playback speed to a specific rate (0.25x to 3x)',
    action: (args) => {
      if (!args || args.length === 0) {
        toast.error('Please provide a playback speed');
        return;
      }

      try {
        const speed = args[0];
        videoActions.setPlaybackRate(speed);
        toast.success(`Playback speed set to ${speed}x`);
      } catch (error) {
        toast.error(error.message);
      }
    },
    category: 'Video',
    keybind: { code: 'KeyS', ctrlKey: true },
    args: [
      NumberArg.required('speed', 'Playback speed', 0.25, 3)
    ]
  },
  stream_loadUrl: {
    name: 'Load Specific URL',
    description: 'Load a specific HTTP/HTTPS URL or file path',
    action: (args) => {
      if (!args || args.length === 0) {
        toast.error('Please provide a URL or file path');
        return;
      }

      try {
        const url = args[0];

        if (url.startsWith('http://') || url.startsWith('https://')) {
          videoActions.loadStreamUrl(url);
        } else if (url.match(/^[a-zA-Z]:\\/) || url.match(/^\//)) {
          videoActions.loadFilePath(url);
        } else {
          toast.error('Invalid URL format. Please provide a valid HTTP/HTTPS URL or file path.');
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    category: 'Streaming',
    keybind: { code: 'KeyL', ctrlKey: true },
    args: [
      StringArg.required('url', 'HTTP/HTTPS URL or file path to load')
    ]
  },
  video_seekForwardOptional: {
    name: 'Seek Forward (Optional Distance)',
    description: 'Seek forward by specified distance or default 10 seconds',
    action: (args) => {
      const distance = args && args.length > 0 ? args[0] : 10;
      videoActions.seekForward(distance);
    },
    category: 'Video',
    keybind: { code: 'BracketRight' },
    args: [
      NumberArg.optional('distance', 'Distance in seconds to seek forward', 10, 1, 300)
    ]
  },
  video_seekBackwardOptional: {
    name: 'Seek Backward (Optional Distance)',
    description: 'Seek backward by specified distance or default 10 seconds',
    action: (args) => {
      const distance = args && args.length > 0 ? args[0] : 10;
      videoActions.seekBackward(distance);
    },
    category: 'Video',
    keybind: { code: 'BracketLeft' },
    args: [
      NumberArg.optional('distance', 'Distance in seconds to seek backward', 10, 1, 300)
    ]
  },
});

// Export individual commands for backward compatibility with id added
export const commandsList: CommandArrayItem[] = Object.entries(commands).map(([id, command]) => {
  const result: CommandArrayItem = {
    id,
    ...command
  };

  return result;
});

// Proxy object for running commands by ID
export const runCommand = new Proxy({} as Record<keyof typeof commands, () => void>, {
  get(target, prop: keyof typeof commands) {
    return commands[prop as keyof typeof commands].action;
  }
});

// Generate keymap actions from commands for backward compatibility
export const defaultKeymap = commandsList
  .filter((command): command is CommandArrayItem & { keybind: NonNullable<Command['keybind']> } => !!command.keybind)
  .map(command => ({
    code: command.keybind.code,
    description: command.name,
    action: command.action,
    shiftKey: command.keybind.shiftKey,
    ctrlKey: command.keybind.ctrlKey,
    metaKey: command.keybind.metaKey,
    altKey: command.keybind.altKey,
    args: command.args, // Include args from the original command
  }));
