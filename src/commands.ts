import { videoActions } from './store/videoStore';
import type { AllKeyCodes } from './client/appKeymap';
import { electronMethods } from './renderer/ipcRenderer';

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
  video_zoomIn: {
    name: 'Zoom In',
    description: 'Increase video zoom level',
    action: () => videoActions.increaseZoom(0.1),
    category: 'Video',
    keybind: { code: 'Equal', ctrlKey: true }
  },
  video_zoomOut: {
    name: 'Zoom Out',
    description: 'Decrease video zoom level',
    action: () => videoActions.decreaseZoom(0.1),
    category: 'Video',
    keybind: { code: 'Minus', ctrlKey: true }
  },
  video_resetZoom: {
    name: 'Reset Zoom',
    description: 'Reset video zoom to 100%',
    action: videoActions.resetZoom,
    category: 'Video',
    keybind: { code: 'Digit0', ctrlKey: true }
  },
  video_resetZoomAlt: {
    name: 'Reset Zoom (Alt)',
    description: 'Reset video zoom to 100% (alternative shortcut)',
    action: videoActions.resetZoom,
    category: 'Video',
    keybind: { code: 'Digit0', altKey: true }
  },
  video_toggleZoom: {
    name: 'Toggle Zoom',
    description: 'Enable or disable video zooming',
    action: videoActions.toggleZoom,
    category: 'Video',
    keybind: { code: 'KeyZ', ctrlKey: true }
  },
  video_toggleZoomAlt: {
    name: 'Toggle Zoom (Alt)',
    description: 'Enable or disable video zooming (alternative shortcut)',
    action: videoActions.toggleZoom,
    category: 'Video',
    keybind: { code: 'KeyZ', altKey: true }
  },
  video_showZoomLevel: {
    name: 'Show Zoom Level',
    description: 'Display current zoom level',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
      toast.info(`Current zoom: ${Math.round(videoState.zoomLevel * 100)}%`);
    },
    category: 'Video',
    keybind: { code: 'KeyZ', ctrlKey: true, shiftKey: true }
  },
  stream_pasteUrl: {
    name: 'Paste Stream URL',
    description: 'Paste HTTP/HTTPS URL from clipboard to load stream',
    action: async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
          videoActions.loadStreamUrl(text);
        } else {
          // Show error toast for invalid URL
          const { toast } = require('sonner');
          toast.error('Invalid URL format. Please copy a valid HTTP/HTTPS URL.');
        }
      } catch (error) {
        console.error('Failed to read clipboard:', error);
        // Show error toast
        try {
          const { toast } = require('sonner');
          toast.error('Failed to read clipboard');
        } catch (toastError) {
          // Toast not available
        }
      }
    },
    category: 'Streaming',
    keybind: { code: 'KeyV', ctrlKey: true }
  },
  stream_copyUrl: {
    name: 'Copy Stream URL',
    description: 'Copy current video source URL to clipboard',
    action: async () => {
      try {
        const src = videoActions.getCurrentSrc();
        if (src) {
          await navigator.clipboard.writeText(src);
          // Show success toast
          const { toast } = require('sonner');
          toast.success('URL copied to clipboard');
        }
      } catch (error) {
        console.error('Failed to write to clipboard:', error);
        // Show error toast
        try {
          const { toast } = require('sonner');
          toast.error('Failed to copy URL');
        } catch (toastError) {
          // Toast not available
        }
      }
    },
    category: 'Streaming',
    keybind: { code: 'KeyC', ctrlKey: true, shiftKey: true }
  },
  player_togglePositionSaving: {
    name: 'Toggle Position Saving',
    description: 'Enable or disable automatic position saving',
    action: () => {
      const { settingsActions } = require('./store/settingsStore');
      const currentValue = require('./store/settingsStore').settingsState.player__savePosition;
      settingsActions.updateSetting('player__savePosition', !currentValue);
    },
    category: 'Player',
    keybind: { code: 'KeyP', ctrlKey: true, altKey: true }
  },
  player_showPosition: {
    name: 'Show Current Position',
    description: 'Display current playback position and duration',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
      const currentTime = Math.floor(videoState.currentTime);
      const duration = Math.floor(videoState.duration);
      const currentTimeStr = `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}`;
      const durationStr = `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;
      toast.info(`Position: ${currentTimeStr} / ${durationStr}`);
    },
    category: 'Player',
    keybind: { code: 'KeyI', ctrlKey: true }
  },
  player_savePosition: {
    name: 'Save Current Position',
    description: 'Manually save current playback position',
    action: () => {
      const { videoState, videoActions } = require('./store/videoStore');
      if (videoState.currentFile && videoState.currentTime > 0) {
        videoActions.savePosition(videoState.currentFile, videoState.currentTime);
        const { toast } = require('sonner');
        toast.success('Position saved manually');
      } else {
        const { toast } = require('sonner');
        toast.error('No file loaded or invalid position');
      }
    },
    category: 'Player',
    keybind: { code: 'KeyS', ctrlKey: true, altKey: true }
  },
  player_clearPositions: {
    name: 'Clear All Positions',
    description: 'Clear all saved playback positions',
    action: () => {
      if (confirm('Are you sure you want to clear all saved positions?')) {
        const { videoState } = require('./store/videoStore');
        videoState.filePositions = {};
        localStorage.removeItem('aqua-player-positions');
        const { toast } = require('sonner');
        toast.success('All positions cleared');
      }
    },
    category: 'Player',
    keybind: { code: 'KeyX', ctrlKey: true, altKey: true }
  },
  player_clearCurrentPosition: {
    name: 'Clear Current Position',
    description: 'Clear saved position for current file',
    action: () => {
      const { videoState } = require('./store/videoStore');
      if (videoState.currentFile && videoState.filePositions[videoState.currentFile]) {
        delete videoState.filePositions[videoState.currentFile];
        try {
          const stored = localStorage.getItem('aqua-player-positions');
          if (stored) {
            const positions = JSON.parse(stored);
            delete positions[videoState.currentFile];
            localStorage.setItem('aqua-player-positions', JSON.stringify(positions));
          }
        } catch (error) {
          console.error('Failed to clear position from storage:', error);
        }
        const { toast } = require('sonner');
        toast.success('Current file position cleared');
      } else {
        const { toast } = require('sonner');
        toast.info('No saved position for current file');
      }
    },
    category: 'Player',
    keybind: { code: 'KeyC', ctrlKey: true, altKey: true }
  },
  player_showAllPositions: {
    name: 'Show All Positions',
    description: 'Display all saved playback positions',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
      const positions = videoState.filePositions;
      const count = Object.keys(positions).length;
      if (count > 0) {
        const files = Object.entries(positions).slice(0, 5); // Show first 5
        const message = files.map(([file, time]) => {
          const fileName = file.split(/[/\\]/).pop() || file;
          const timeStr = `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
          return `${fileName}: ${timeStr}`;
        }).join('\n');
        toast.info(`Saved positions (${count} total):\n${message}${count > 5 ? '\n...and more' : ''}`);
      } else {
        toast.info('No saved positions');
      }
    },
    category: 'Player',
    keybind: { code: 'KeyL', ctrlKey: true, altKey: true }
  },
  player_showCurrentFilePosition: {
    name: 'Show Current File Position',
    description: 'Display saved position for current file',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
      if (videoState.currentFile) {
        const savedPosition = videoState.filePositions[videoState.currentFile];
        if (savedPosition) {
          const timeStr = `${Math.floor(savedPosition / 60)}:${Math.floor(savedPosition % 60).toString().padStart(2, '0')}`;
          toast.info(`Saved position: ${timeStr}`);
        } else {
          toast.info('No saved position for current file');
        }
      } else {
        toast.error('No file loaded');
      }
    },
    category: 'Player',
    keybind: { code: 'KeyP', ctrlKey: true, shiftKey: true }
  },
  player_jumpToSavedPosition: {
    name: 'Jump to Saved Position',
    description: 'Jump to saved position for current file',
    action: () => {
      const { videoState, videoActions } = require('./store/videoStore');
      const { toast } = require('sonner');
      if (videoState.currentFile) {
        const savedPosition = videoState.filePositions[videoState.currentFile];
        if (savedPosition) {
          videoActions.setCurrentTime(savedPosition);
          const timeStr = `${Math.floor(savedPosition / 60)}:${Math.floor(savedPosition % 60).toString().padStart(2, '0')}`;
          toast.success(`Jumped to saved position: ${timeStr}`);
        } else {
          toast.info('No saved position for current file');
        }
      } else {
        toast.error('No file loaded');
      }
    },
    category: 'Player',
    keybind: { code: 'KeyJ', ctrlKey: true, altKey: true }
  },
  stream_showCurrentUrl: {
    name: 'Show Current URL',
    description: 'Display current video source URL',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
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
    keybind: { code: 'KeyU', ctrlKey: true }
  },
  stream_openInBrowser: {
    name: 'Open URL in Browser',
    description: 'Open current video URL in default browser',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
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
    name: 'Reload Stream',
    description: 'Reload current video stream',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
      const src = videoState.currentFile;
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        // Reload by setting the same URL again
        const currentSrc = src;
        videoState.currentFile = '';
        setTimeout(() => {
          videoState.currentFile = currentSrc;
        }, 100);
        toast.success('Reloading stream...');
      } else {
        toast.error('Not a valid stream URL');
      }
    },
    category: 'Streaming',
    keybind: { code: 'KeyR', ctrlKey: true, altKey: true }
  },
  stream_showInfo: {
    name: 'Show Stream Info',
    description: 'Display information about current stream',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
      const src = videoState.currentFile;
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        const info = [
          `Type: Stream`,
          `URL: ${src}`,
          `Duration: ${videoState.duration > 0 ? `${Math.floor(videoState.duration / 60)}:${Math.floor(videoState.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}`,
          `Resolution: ${videoState.videoResolutionDisplay || 'Unknown'}`,
          `Codec: ${videoState.videoCodec || 'Unknown'}`,
          `FPS: ${videoState.fps || 'Unknown'}`,
          `Bitrate: ${videoState.videoBitrate ? `${Math.round(videoState.videoBitrate / 1000)} kbps` : 'Unknown'}`
        ].join('\n');
        toast.info(`Stream Information:\n${info}`);
      } else {
        toast.error('Not a valid stream URL');
      }
    },
    category: 'Streaming',
    keybind: { code: 'KeyI', ctrlKey: true, altKey: true }
  },
  file_showInfo: {
    name: 'Show File Info',
    description: 'Display information about current file',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
      const src = videoState.currentFile;
      if (src && !(src.startsWith('http://') || src.startsWith('https://'))) {
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
      } else {
        toast.error('Not a valid local file');
      }
    },
    category: 'File',
    keybind: { code: 'KeyI', ctrlKey: true, shiftKey: true }
  },
  media_showInfo: {
    name: 'Show Media Info',
    description: 'Display information about current media (file or stream)',
    action: () => {
      const { videoState } = require('./store/videoStore');
      const { toast } = require('sonner');
      const src = videoState.currentFile;
      if (src) {
        const isStream = src.startsWith('http://') || src.startsWith('https://');
        const fileName = isStream ? src : src.split(/[/\\]/).pop() || src;
        const info = [
          `Type: ${isStream ? 'Stream' : 'Local File'}`,
          `Source: ${isStream ? 'URL' : 'Path'}`,
          `Name: ${fileName}`,
          `Duration: ${videoState.duration > 0 ? `${Math.floor(videoState.duration / 60)}:${Math.floor(videoState.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}`,
          `Resolution: ${videoState.videoResolutionDisplay || 'Unknown'}`,
          `Codec: ${videoState.videoCodec || 'Unknown'}`,
          `FPS: ${videoState.fps || 'Unknown'}`,
          `Bitrate: ${videoState.videoBitrate ? `${Math.round(videoState.videoBitrate / 1000)} kbps` : 'Unknown'}`,
          `Current Time: ${Math.floor(videoState.currentTime / 60)}:${Math.floor(videoState.currentTime % 60).toString().padStart(2, '0')}`,
          `Volume: ${Math.round(videoState.volume * 100)}%`,
          `Playback Rate: ${videoState.playbackRate}x`,
          `Zoom: ${Math.round(videoState.zoomLevel * 100)}%`
        ].join('\n');
        toast.info(`Media Information:\n${info}`);
      } else {
        toast.error('No media loaded');
      }
    },
    category: 'Media',
    keybind: { code: 'KeyI', ctrlKey: true }
  },
  help_showZoomHelp: {
    name: 'Show Zoom Help',
    description: 'Display zoom controls help information',
    action: () => {
      const { toast } = require('sonner');
      const help = [
        `Zoom Controls:`,
        `• Ctrl + Mouse Wheel: Zoom in/out`,
        `• Ctrl + =: Zoom in`,
        `• Ctrl + -: Zoom out`,
        `• Ctrl + 0: Reset zoom`,
        `• Ctrl + Z: Toggle zoom on/off`,
        `• Alt + Z: Alternative toggle`,
        `• Click zoom badge to reset`,
        `• Settings: Adjust sensitivity`
      ].join('\n');
      toast.info(help);
    },
    category: 'Help',
    keybind: { code: 'KeyH', ctrlKey: true, shiftKey: true }
  },
  help_showPositionHelp: {
    name: 'Show Position Help',
    description: 'Display position memory help information',
    action: () => {
      const { toast } = require('sonner');
      const help = [
        `Position Memory:`,
        `• Auto-saves every 5 seconds`,
        `• Auto-restores on file load`,
        `• Ctrl + Alt + P: Toggle saving`,
        `• Ctrl + Alt + S: Save manually`,
        `• Ctrl + Alt + J: Jump to saved`,
        `• Ctrl + Alt + C: Clear current`,
        `• Ctrl + Alt + X: Clear all`,
        `• Ctrl + Alt + L: Show all`,
        `• Ctrl + Shift + P: Show current`
      ].join('\n');
      toast.info(help);
    },
    category: 'Help',
    keybind: { code: 'KeyH', ctrlKey: true, altKey: true }
  },
  help_showStreamingHelp: {
    name: 'Show Streaming Help',
    description: 'Display streaming help information',
    action: () => {
      const { toast } = require('sonner');
      const help = [
        `Streaming Controls:`,
        `• Ctrl + V: Paste stream URL`,
        `• Ctrl + Shift + C: Copy current URL`,
        `• Ctrl + U: Show current URL`,
        `• Ctrl + Alt + O: Open in browser`,
        `• Ctrl + Alt + R: Reload stream`,
        `• Ctrl + Alt + I: Show stream info`,
        `• Ctrl + I: Show media info`,
        `• Supports HTTP/HTTPS URLs`,
        `• Auto-detects stream type`
      ].join('\n');
      toast.info(help);
    },
    category: 'Help',
    keybind: { code: 'KeyH', ctrlKey: true, metaKey: true }
  },
  help_showAllHelp: {
    name: 'Show All Help',
    description: 'Display comprehensive help information',
    action: () => {
      const { toast } = require('sonner');
      const help = [
        `Aqua Player - Complete Help:`,
        ``,
        `🎥 Video Controls:`,
        `• Space: Play/Pause`,
        `• Arrow Keys: Seek ±10s`,
        `• Ctrl + Wheel: Zoom in/out`,
        `• Ctrl + =/-: Zoom in/out`,
        `• Ctrl + 0: Reset zoom`,
        `• Ctrl + Z: Toggle zoom`,
        ``,
        `💾 Position Memory:`,
        `• Auto-saves every 5s`,
        `• Ctrl + Alt + P: Toggle saving`,
        `• Ctrl + Alt + S: Save manually`,
        `• Ctrl + Alt + J: Jump to saved`,
        ``,
        `🌐 Streaming:`,
        `• Ctrl + V: Paste URL`,
        `• Ctrl + Shift + C: Copy URL`,
        `• Ctrl + U: Show URL`,
        ``,
        `ℹ️ Information:`,
        `• Ctrl + I: Media info`,
        `• Ctrl + Shift + I: File info`,
        `• Ctrl + Alt + I: Stream info`,
        ``,
        `🔧 Settings:`,
        `• Ctrl + Shift + H: Zoom help`,
        `• Ctrl + Alt + H: Position help`,
        `• Ctrl + Meta + H: Streaming help`
      ].join('\n');
      toast.info(help, { duration: 10000 });
    },
    category: 'Help',
    keybind: { code: 'KeyH', ctrlKey: true }
  },
  help_showKeyboardShortcuts: {
    name: 'Show Keyboard Shortcuts',
    description: 'Display all keyboard shortcuts',
    action: () => {
      const { toast } = require('sonner');
      const shortcuts = [
        `🎹 Keyboard Shortcuts:`,
        ``,
        `🎥 Video:`,
        `• Space: Play/Pause`,
        `• ←/→: Seek ±10s`,
        `• ↑/↓: Volume ±10%`,
        `• M: Mute/Unmute`,
        `• F: Fullscreen`,
        `• ,/. : Frame by frame`,
        `• =/-: Speed ±`,
        `• 0: Reset speed`,
        ``,
        `🔍 Zoom:`,
        `• Ctrl + Wheel: Zoom in/out`,
        `• Ctrl + =/-: Zoom in/out`,
        `• Ctrl + 0: Reset zoom`,
        `• Ctrl + Z: Toggle zoom`,
        `• Alt + Z: Alt toggle`,
        ``,
        `💾 Position:`,
        `• Ctrl + Alt + P: Toggle saving`,
        `• Ctrl + Alt + S: Save manually`,
        `• Ctrl + Alt + J: Jump to saved`,
        `• Ctrl + Alt + C: Clear current`,
        `• Ctrl + Alt + X: Clear all`,
        `• Ctrl + Alt + L: Show all`,
        `• Ctrl + Shift + P: Show current`,
        ``,
        `🌐 Streaming:`,
        `• Ctrl + V: Paste URL`,
        `• Ctrl + Shift + C: Copy URL`,
        `• Ctrl + U: Show URL`,
        `• Ctrl + Alt + O: Open in browser`,
        `• Ctrl + Alt + R: Reload stream`,
        `• Ctrl + Alt + I: Stream info`,
        ``,
        `ℹ️ Info:`,
        `• Ctrl + I: Media info`,
        `• Ctrl + Shift + I: File info`,
        `• Ctrl + Alt + I: Stream info`,
        `• Ctrl + P: Toggle playlist`,
        `• Ctrl + H: Toggle history`,
        ``,
        `🔧 Help:`,
        `• Ctrl + H: All help`,
        `• Ctrl + Shift + H: Zoom help`,
        `• Ctrl + Alt + H: Position help`,
        `• Ctrl + Meta + H: Streaming help`,
        `• Ctrl + Shift + ?: Keymap dialog`
      ].join('\n');
      toast.info(shortcuts, { duration: 15000 });
    },
    category: 'Help',
    keybind: { code: 'KeyK', ctrlKey: true }
  },
  help_showFeatureSummary: {
    name: 'Show Feature Summary',
    description: 'Display summary of all features',
    action: () => {
      const { toast } = require('sonner');
      const features = [
        `🚀 Aqua Player Features:`,
        ``,
        `🎥 Video Playback:`,
        `• Local file support (MP4, AVI, MKV, etc.)`,
        `• HTTP/HTTPS streaming support`,
        `• Frame-by-frame navigation`,
        `• Variable playback speeds`,
        `• Fullscreen mode`,
        `• Playlist management`,
        `• File history tracking`,
        ``,
        `🔍 Video Zoom:`,
        `• Ctrl + Mouse wheel zooming`,
        `• Keyboard zoom controls`,
        `• Adjustable sensitivity`,
        `• Zoom level indicator`,
        `• Toggle zoom on/off`,
        `• Reset zoom functionality`,
        ``,
        `💾 Position Memory:`,
        `• Automatic position saving`,
        `• Position restoration`,
        `• Manual position saving`,
        `• Position management tools`,
        `• Settings integration`,
        `• Local storage persistence`,
        ``,
        `🌐 HTTP Streaming:`,
        `• URL paste support (Ctrl+V)`,
        `• URL copying (Ctrl+Shift+C)`,
        `• Stream information display`,
        `• Browser integration`,
        `• Stream reloading`,
        `• Auto-detection`,
        ``,
        `⚙️ Settings & Controls:`,
        `• Configurable zoom sensitivity`,
        `• Position saving toggle`,
        `• Keyboard shortcut customization`,
        `• Status indicators`,
        `• Help system`,
        `• Toast notifications`
      ].join('\n');
      toast.info(features, { duration: 20000 });
    },
    category: 'Help',
    keybind: { code: 'KeyF', ctrlKey: true }
  },
  help_showVersion: {
    name: 'Show Version Info',
    description: 'Display application version information',
    action: () => {
      const { toast } = require('sonner');
      const version = process.env.APP_VERSION || '0.0.0-alpha.0';
      const info = [
        `ℹ️ Aqua Player Version Info:`,
        ``,
        `Version: ${version}`,
        `Platform: ${navigator.platform}`,
        `User Agent: ${navigator.userAgent}`,
        `Language: ${navigator.language}`,
        `Cookies Enabled: ${navigator.cookieEnabled}`,
        `Online: ${navigator.onLine}`,
        `Hardware Concurrency: ${navigator.hardwareConcurrency || 'Unknown'}`,
        `Memory: ${(performance as any).memory ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)}MB` : 'Unknown'}`,
        ``,
        `Features Added:`,
        `• Video zooming (Ctrl+wheel)`,
        `• Position memory system`,
        `• HTTP streaming support`,
        `• Enhanced keyboard shortcuts`,
        `• Comprehensive help system`
      ].join('\n');
      toast.info(info, { duration: 15000 });
    },
    category: 'Help',
    keybind: { code: 'KeyV', ctrlKey: true, shiftKey: true }
  },
  help_showCredits: {
    name: 'Show Credits',
    description: 'Display application credits and acknowledgments',
    action: () => {
      const { toast } = require('sonner');
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
        ``,
        `🎨 Features:`,
        `• Video zooming with Ctrl+wheel`,
        `• Position memory system`,
        `• HTTP streaming support`,
        `• Enhanced keyboard shortcuts`,
        `• Comprehensive help system`,
        `• Settings management`,
        `• Playlist and history`,
        `• File associations`,
        ``,
        `📱 Platforms:`,
        `• Windows`,
        `• macOS`,
        `• Linux`,
        ``,
        `📄 License: MIT`,
        `🌐 Open Source: Yes`
      ].join('\n');
      toast.info(credits, { duration: 20000 });
    },
    category: 'Help',
    keybind: { code: 'KeyC', ctrlKey: true, shiftKey: true, altKey: true }
  },
  help_showTips: {
    name: 'Show Tips',
    description: 'Display useful tips and tricks',
    action: () => {
      const { toast } = require('sonner');
      const tips = [
        `💡 Aqua Player Tips & Tricks:`,
        ``,
        `🎥 Video Playback:`,
        `• Double-click video to toggle fullscreen`,
        `• Right-click for context menu`,
        `• Drag & drop files to load them`,
        `• Use mouse wheel for volume control`,
        `• Middle-click to toggle play/pause`,
        ``,
        `🔍 Zoom Features:`,
        `• Ctrl + wheel for precise zooming`,
        `• Click zoom badge to reset zoom`,
        `• Adjust sensitivity in settings`,
        `• Zoom works on any video content`,
        `• Toggle zoom on/off as needed`,
        ``,
        `💾 Position Memory:`,
        `• Positions auto-save every 5 seconds`,
        `• Use Ctrl+Alt+S to save manually`,
        `• Jump to saved position with Ctrl+Alt+J`,
        `• Clear positions when needed`,
        `• Works with both files and streams`,
        ``,
        `🌐 Streaming:`,
        `• Copy URLs from browser with Ctrl+V`,
        `• Use Ctrl+Shift+C to copy current URL`,
        `• Reload streams with Ctrl+Alt+R`,
        `• Open streams in browser if needed`,
        `• Supports most HTTP/HTTPS streams`,
        ``,
        `⌨️ Keyboard:`,
        `• Use Ctrl+H for comprehensive help`,
        `• Ctrl+K shows all shortcuts`,
        `• Ctrl+F shows feature summary`,
        `• Customize shortcuts in settings`,
        `• Most actions have keyboard shortcuts`,
        ``,
        `⚙️ Settings:`,
        `• Adjust zoom sensitivity`,
        `• Toggle position saving`,
        `• Configure volume wheel control`,
        `• Customize UI elements`,
        `• Save preferences automatically`
      ].join('\n');
      toast.info(tips, { duration: 25000 });
    },
    category: 'Help',
    keybind: { code: 'KeyT', ctrlKey: true }
  },
  help_showTroubleshooting: {
    name: 'Show Troubleshooting',
    description: 'Display troubleshooting information',
    action: () => {
      const { toast } = require('sonner');
      const troubleshooting = [
        `🔧 Aqua Player Troubleshooting:`,
        ``,
        `🎥 Video Issues:`,
        `• File won't play: Check format support`,
        `• No audio: Check volume and mute`,
        `• Stuttering: Try different playback speed`,
        `• Black screen: Check video codec support`,
        `• Crashes: Restart application`,
        ``,
        `🔍 Zoom Problems:`,
        `• Zoom not working: Check Ctrl+wheel`,
        `• Zoom too sensitive: Adjust in settings`,
        `• Zoom disabled: Use Ctrl+Z to enable`,
        `• Zoom stuck: Use Ctrl+0 to reset`,
        `• Zoom badge missing: Zoom level is 100%`,
        ``,
        `💾 Position Issues:`,
        `• Positions not saving: Check settings`,
        `• Wrong position: Clear and re-save`,
        `• No restoration: Check file path`,
        `• Storage full: Clear old positions`,
        `• Corrupted data: Reset positions`,
        ``,
        `🌐 Streaming Issues:`,
        `• Stream won't load: Check URL format`,
        `• Buffering: Check internet connection`,
        `• Authentication: Use proper credentials`,
        `• CORS errors: Try different browser`,
        `• Format not supported: Check stream type`,
        ``,
        `⌨️ Keyboard Issues:`,
        `• Shortcuts not working: Check focus`,
        `• Conflicts: Check other applications`,
        `• Custom shortcuts: Reset to defaults`,
        `• Help not showing: Check key combinations`,
        `• Commands failing: Restart app`,
        ``,
        `⚙️ Settings Problems:`,
        `• Settings not saving: Check permissions`,
        `• Defaults not working: Reset settings`,
        `• UI not updating: Refresh window`,
        `• Performance issues: Check hardware`,
        `• Crashes: Update to latest version`
      ].join('\n');
      toast.info(troubleshooting, { duration: 30000 });
    },
    category: 'Help',
    keybind: { code: 'KeyT', ctrlKey: true, shiftKey: true }
  },
  help_showChangelog: {
    name: 'Show Changelog',
    description: 'Display recent changes and updates',
    action: () => {
      const { toast } = require('sonner');
      const changelog = [
        `📝 Aqua Player Changelog:`,
        ``,
        `🚀 New Features (Latest Update):`,
        `• Video zooming with Ctrl+wheel`,
        `• Position memory system`,
        `• HTTP streaming support`,
        `• Enhanced keyboard shortcuts`,
        `• Comprehensive help system`,
        `• Zoom sensitivity settings`,
        `• Position management tools`,
        `• Stream URL management`,
        `• Toast notifications`,
        `• Status indicators`,
        ``,
        `🔧 Improvements:`,
        `• Better error handling`,
        `• Enhanced user feedback`,
        `• Improved settings UI`,
        `• More keyboard shortcuts`,
        `• Better help documentation`,
        `• Performance optimizations`,
        ``,
        `🐛 Bug Fixes:`,
        `• Fixed position saving issues`,
        `• Improved zoom behavior`,
        `• Better stream handling`,
        `• Enhanced error messages`,
        `• Fixed keyboard conflicts`,
        `• Improved stability`
      ].join('\n');
      toast.info(changelog, { duration: 25000 });
    },
    category: 'Help',
    keybind: { code: 'KeyL', ctrlKey: true, shiftKey: true }
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
