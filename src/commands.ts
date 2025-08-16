import { videoActions } from './store/videoStore';
import type { AllKeyCodes } from './client/appKeymap';

export interface Command {
  id: string;
  name: string;
  description: string;
  action: () => void;
  category: string;
  keybind?: {
    code: AllKeyCodes;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
  };
}

export const commands: Command[] = [
  {
    id: 'video.togglePlay',
    name: 'Toggle Play/Pause',
    description: 'Toggle between play and pause states',
    action: videoActions.togglePlay,
    category: 'Video',
    keybind: { code: 'Space' }
  },
  {
    id: 'video.seekForward',
    name: 'Seek Forward',
    description: 'Seek forward 10 seconds',
    action: () => videoActions.seekForward(10),
    category: 'Video',
    keybind: { code: 'ArrowRight' }
  },
  {
    id: 'video.seekBackward',
    name: 'Seek Backward',
    description: 'Seek backward 10 seconds',
    action: () => videoActions.seekBackward(10),
    category: 'Video',
    keybind: { code: 'ArrowLeft' }
  },
  {
    id: 'audio.volumeUp',
    name: 'Increase Volume',
    description: 'Increase volume by 10%',
    action: () => videoActions.increaseVolume(0.1),
    category: 'Audio',
    keybind: { code: 'ArrowUp' }
  },
  {
    id: 'audio.volumeDown',
    name: 'Decrease Volume',
    description: 'Decrease volume by 10%',
    action: () => videoActions.decreaseVolume(0.1),
    category: 'Audio',
    keybind: { code: 'ArrowDown' }
  },
  {
    id: 'audio.toggleMute',
    name: 'Toggle Mute',
    description: 'Mute or unmute audio',
    action: videoActions.toggleMute,
    category: 'Audio',
    keybind: { code: 'KeyM' }
  },
  {
    id: 'view.toggleFullscreen',
    name: 'Toggle Fullscreen',
    description: 'Enter or exit fullscreen mode',
    action: videoActions.toggleFullScreen,
    category: 'View',
    keybind: { code: 'KeyF' }
  },
  {
    id: 'video.nextFrame',
    name: 'Next Frame',
    description: 'Step to next frame',
    action: videoActions.nextFrame,
    category: 'Video',
    keybind: { code: 'Period' }
  },
  {
    id: 'video.previousFrame',
    name: 'Previous Frame',
    description: 'Step to previous frame',
    action: videoActions.previousFrame,
    category: 'Video',
    keybind: { code: 'Comma' }
  },
  {
    id: 'subtitles.toggle',
    name: 'Toggle Subtitles',
    description: 'Show or hide subtitles',
    action: videoActions.toggleSubtitles,
    category: 'Subtitles',
    keybind: { code: 'KeyV' }
  },
  {
    id: 'audio.nextTrack',
    name: 'Next Audio Track',
    description: 'Switch to next audio track',
    action: videoActions.nextAudioTrack,
    category: 'Audio',
    keybind: { code: 'KeyA' }
  },
  {
    id: 'audio.previousTrack',
    name: 'Previous Audio Track',
    description: 'Switch to previous audio track',
    action: videoActions.previousAudioTrack,
    category: 'Audio',
    keybind: { code: 'KeyA', shiftKey: true }
  },
  {
    id: 'help.showKeymap',
    name: 'Show Keymap',
    description: 'Display keyboard shortcuts',
    action: videoActions.toggleKeymapDialog,
    category: 'Help',
    keybind: { code: 'Slash', shiftKey: true }
  },
  {
    id: 'help.showCommandPalette',
    name: 'Show Command Palette',
    description: 'Open command palette to search and execute commands',
    action: videoActions.toggleCommandPalette,
    category: 'Help',
    keybind: { code: 'KeyP', ctrlKey: true, shiftKey: true }
  },
  {
    id: 'video.increaseSpeed',
    name: 'Increase Playback Speed',
    description: 'Increase video playback rate',
    action: videoActions.increasePlaybackRate,
    category: 'Video',
    keybind: { code: 'Equal' }
  },
  {
    id: 'video.decreaseSpeed',
    name: 'Decrease Playback Speed',
    description: 'Decrease video playback rate',
    action: videoActions.decreasePlaybackRate,
    category: 'Video',
    keybind: { code: 'Minus' }
  },
  {
    id: 'video.resetSpeed',
    name: 'Reset Playback Speed',
    description: 'Reset playback rate to 1x',
    action: videoActions.resetPlaybackRate,
    category: 'Video',
    keybind: { code: 'Digit0' }
  },
  {
    id: 'file.open',
    name: 'Open File',
    description: 'Open a video file',
    action: videoActions.loadFile,
    category: 'File',
    keybind: { code: 'KeyO' }
  },
  {
    id: 'view.togglePlaylist',
    name: 'Toggle Playlist',
    description: 'Show or hide playlist sidebar',
    action: videoActions.togglePlaylist,
    category: 'View',
    keybind: { code: 'KeyP' }
  },
  {
    id: 'view.toggleHistory',
    name: 'Toggle File History',
    description: 'Show or hide file history sidebar',
    action: videoActions.toggleHistory,
    category: 'View',
    keybind: { code: 'KeyH' }
  },
  {
    id: 'app.quit',
    name: 'Quit Application',
    description: 'Exit the application',
    action: () => window.electronAPI.quit(),
    category: 'Application',
    keybind: { code: 'KeyQ', ctrlKey: true }
  },
  {
    id: 'window.close',
    name: 'Close Window',
    description: 'Close the current window',
    action: () => window.electronAPI.closeWindow(),
    category: 'Application',
    keybind: { code: 'KeyW', ctrlKey: true }
  },
  {
    id: 'settings.fileAssociation',
    name: 'File Association Settings',
    description: 'Configure file associations for video files',
    action: videoActions.toggleFileAssociationDialog,
    category: 'Settings'
  },
  {
    id: 'debug.testError',
    name: 'Test Error Boundary',
    description: 'Trigger an error to test the error boundary',
    action: () => { throw new Error('Test error for debugging purposes'); },
    category: 'Debug'
  },
  {
    id: 'boss-mode',
    name: 'Boss Mode (Minimize & Pause)',
    description: 'Minimize the window and pause playback',
    action: () => {
      window.electronAPI.minimizeWindow();
      videoActions.pause();
    },
    category: 'Window',
    keybind: { code: 'KeyB' }
  }
];

// Generate keymap actions from commands for backward compatibility
export const defaultKeymap = commands
  .filter(command => command.keybind)
  .map(command => ({
    code: command.keybind!.code,
    description: command.name,
    action: command.action,
    shiftKey: command.keybind!.shiftKey,
    ctrlKey: command.keybind!.ctrlKey,
    metaKey: command.keybind!.metaKey,
    altKey: command.keybind!.altKey,
  }));
