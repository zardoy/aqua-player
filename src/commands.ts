import { videoActions } from './store/videoStore';
import type { AllKeyCodes } from './client/appKeymap';

export interface Command {
  name?: string;
  description?: string;
  action: () => void;
  category?: string;
  keybind?: {
    code: AllKeyCodes;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
  };
}

// Helper type function to create commands with proper typing
const makeCommands = <T extends string>(commands: Record<T, Command>): Record<T, Command> => commands;

// Utility type for when you need the array item with id
export type CommandArrayItem = Command & { id: string };

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
    action: () => window.electronAPI.quit(),
    category: 'Application',
    keybind: { code: 'KeyQ', ctrlKey: true }
  },
  window_close: {
    name: 'Close Window',
    description: 'Close the current window',
    action: () => window.electronAPI.closeWindow(),
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
      window.electronAPI.minimizeWindow();
      videoActions.pause();
    },
    category: 'Window',
    keybind: { code: 'KeyB' }
  }
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
  }));
