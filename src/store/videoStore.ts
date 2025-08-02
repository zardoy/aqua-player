import { proxy } from 'valtio';

type VideoTrack = {
  id: string;
  kind: string;
  label: string;
  language: string;
};

type SubtitleTrack = {
  id: string;
  kind: string;
  label: string;
  language: string;
};

type AudioTrack = {
  id: string;
  kind: string;
  label: string;
  language: string;
};

type KeymapAction = {
  key: string;
  description: string;
  action: () => void;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
};

export const videoState = proxy({
  // Playback state
  isPlaying: false,
  progress: 0,
  volume: 1,
  isMuted: false,
  isFullScreen: false,
  duration: 0,
  currentTime: 0,
  playbackRate: 1,

  // File state
  currentFile: '',
  fileType: '',

  // Tracks
  videoTracks: [] as VideoTrack[],
  audioTracks: [] as AudioTrack[],
  subtitleTracks: [] as SubtitleTrack[],
  currentVideoTrack: 0,
  currentAudioTrack: 0,
  currentSubtitleTrack: -1, // -1 means no subtitle
  showSubtitles: true,

  // Remote playback
  isRemoteServerRunning: false,
  remotePlaybackUrl: '',

  // AirPlay
  airPlayAvailable: false,
  airPlayDevices: [] as string[],
  isAirPlaying: false,
  currentAirPlayDevice: '',

  // UI state
  showControls: true,
  isSettingsOpen: false,
  isKeymapDialogOpen: false,

  // Error handling
  hasError: false,
  errorMessage: '',
});

export const videoActions = {
  // Playback controls
  togglePlay: () => {
    videoState.isPlaying = !videoState.isPlaying;
  },
  play: () => {
    videoState.isPlaying = true;
  },
  pause: () => {
    videoState.isPlaying = false;
  },
  setProgress: (progress: number) => {
    videoState.progress = progress;
  },
  setCurrentTime: (time: number) => {
    videoState.currentTime = time;
    videoState.progress = videoState.duration > 0 ? time / videoState.duration : 0;
  },
  seekForward: (seconds = 10) => {
    const newTime = Math.min(videoState.currentTime + seconds, videoState.duration);
    videoActions.setCurrentTime(newTime);
  },
  seekBackward: (seconds = 10) => {
    const newTime = Math.max(videoState.currentTime - seconds, 0);
    videoActions.setCurrentTime(newTime);
  },
  nextFrame: () => {
    // Assuming 30fps as default
    const frameDuration = 1/30;
    const newTime = Math.min(videoState.currentTime + frameDuration, videoState.duration);
    videoActions.setCurrentTime(newTime);
  },
  previousFrame: () => {
    // Assuming 30fps as default
    const frameDuration = 1/30;
    const newTime = Math.max(videoState.currentTime - frameDuration, 0);
    videoActions.setCurrentTime(newTime);
  },

  // Volume controls
  setVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    videoState.volume = clampedVolume;
    videoState.isMuted = clampedVolume === 0;
  },
  increaseVolume: (amount = 0.1) => {
    videoActions.setVolume(videoState.volume + amount);
  },
  decreaseVolume: (amount = 0.1) => {
    videoActions.setVolume(videoState.volume - amount);
  },
  toggleMute: () => {
    videoState.isMuted = !videoState.isMuted;
  },

  // Playback rate
  setPlaybackRate: (rate: number) => {
    videoState.playbackRate = rate;
  },
  increasePlaybackRate: () => {
    const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const currentIndex = rates.indexOf(videoState.playbackRate);
    if (currentIndex < rates.length - 1) {
      videoState.playbackRate = rates[currentIndex + 1];
    }
  },
  decreasePlaybackRate: () => {
    const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const currentIndex = rates.indexOf(videoState.playbackRate);
    if (currentIndex > 0) {
      videoState.playbackRate = rates[currentIndex - 1];
    }
  },
  resetPlaybackRate: () => {
    videoState.playbackRate = 1;
  },

  // Screen controls
  toggleFullScreen: () => {
    videoState.isFullScreen = !videoState.isFullScreen;
    window.electronAPI.toggleFullscreen();
  },

  // File operations
  loadFile: async () => {
    try {
      const result = await window.electronAPI.openFileDialog();
      if (!result.canceled && result.filePaths.length > 0) {
        videoState.currentFile = result.filePaths[0];
        videoState.fileType = result.filePaths[0].split('.').pop() || '';
        videoState.hasError = false;
        videoState.errorMessage = '';
        return result.filePaths[0];
      }
      return null;
    } catch (error) {
      videoState.hasError = true;
      videoState.errorMessage = `Failed to load file: ${error.message}`;
      return null;
    }
  },

  // Load file from path (for drag and drop)
  loadFilePath: (filePath: string) => {
    try {
      if (filePath) {
        videoState.currentFile = filePath;
        videoState.fileType = filePath.split('.').pop() || '';
        videoState.hasError = false;
        videoState.errorMessage = '';
        return filePath;
      }
      return null;
    } catch (error) {
      videoState.hasError = true;
      videoState.errorMessage = `Failed to load file: ${error.message}`;
      return null;
    }
  },

  // Track management
  setVideoTracks: (tracks: VideoTrack[]) => {
    videoState.videoTracks = tracks;
  },
  setAudioTracks: (tracks: AudioTrack[]) => {
    videoState.audioTracks = tracks;
  },
  setSubtitleTracks: (tracks: SubtitleTrack[]) => {
    videoState.subtitleTracks = tracks;
  },
  selectVideoTrack: (index: number) => {
    if (index >= 0 && index < videoState.videoTracks.length) {
      videoState.currentVideoTrack = index;
    }
  },
  selectAudioTrack: (index: number) => {
    if (index >= 0 && index < videoState.audioTracks.length) {
      videoState.currentAudioTrack = index;
    }
  },
  selectSubtitleTrack: (index: number) => {
    if (index >= -1 && index < videoState.subtitleTracks.length) {
      videoState.currentSubtitleTrack = index;
    }
  },
  toggleSubtitles: () => {
    videoState.showSubtitles = !videoState.showSubtitles;
  },
  nextAudioTrack: () => {
    const nextIndex = (videoState.currentAudioTrack + 1) % videoState.audioTracks.length;
    videoActions.selectAudioTrack(nextIndex);
  },
  previousAudioTrack: () => {
    const prevIndex = videoState.currentAudioTrack - 1 < 0 ?
      videoState.audioTracks.length - 1 : videoState.currentAudioTrack - 1;
    videoActions.selectAudioTrack(prevIndex);
  },

  // Duration and time
  setDuration: (duration: number) => {
    videoState.duration = duration;
  },

  // Remote playback
  startRemoteServer: async () => {
    try {
      const url = await window.electronAPI.startRemoteServer();
      videoState.isRemoteServerRunning = true;
      videoState.remotePlaybackUrl = url;
      return url;
    } catch (error) {
      videoState.hasError = true;
      videoState.errorMessage = `Failed to start remote server: ${error.message}`;
      return null;
    }
  },
  stopRemoteServer: async () => {
    try {
      await window.electronAPI.stopRemoteServer();
      videoState.isRemoteServerRunning = false;
      videoState.remotePlaybackUrl = '';
    } catch (error) {
      videoState.hasError = true;
      videoState.errorMessage = `Failed to stop remote server: ${error.message}`;
    }
  },

  // AirPlay
  checkAirPlayAvailability: async () => {
    try {
      const available = await window.electronAPI.checkAirPlayAvailability();
      videoState.airPlayAvailable = available;
      return available;
    } catch (error) {
      videoState.airPlayAvailable = false;
      return false;
    }
  },
  getAirPlayDevices: async () => {
    try {
      const devices = await window.electronAPI.getAirPlayDevices();
      videoState.airPlayDevices = devices;
      return devices;
    } catch (error) {
      videoState.airPlayDevices = [];
      return [];
    }
  },
  startAirPlay: async (deviceName: string) => {
    try {
      await window.electronAPI.startAirPlay(deviceName);
      videoState.isAirPlaying = true;
      videoState.currentAirPlayDevice = deviceName;
    } catch (error) {
      videoState.hasError = true;
      videoState.errorMessage = `Failed to start AirPlay: ${error.message}`;
    }
  },
  stopAirPlay: async () => {
    try {
      await window.electronAPI.stopAirPlay();
      videoState.isAirPlaying = false;
      videoState.currentAirPlayDevice = '';
    } catch (error) {
      videoState.hasError = true;
      videoState.errorMessage = `Failed to stop AirPlay: ${error.message}`;
    }
  },

  // UI controls
  toggleControls: () => {
    videoState.showControls = !videoState.showControls;
  },
  toggleSettings: () => {
    videoState.isSettingsOpen = !videoState.isSettingsOpen;
  },
  toggleKeymapDialog: () => {
    videoState.isKeymapDialogOpen = !videoState.isKeymapDialogOpen;
  },

  // Error handling
  clearError: () => {
    videoState.hasError = false;
    videoState.errorMessage = '';
  },
  setError: (message: string) => {
    videoState.hasError = true;
    videoState.errorMessage = message;
  }
};

// Define the default keymap
export const defaultKeymap: KeymapAction[] = [
  { key: ' ', description: 'Play/Pause', action: videoActions.togglePlay },
  { key: 'ArrowRight', description: 'Seek forward 10s', action: () => videoActions.seekForward(10) },
  { key: 'ArrowLeft', description: 'Seek backward 10s', action: () => videoActions.seekBackward(10) },
  { key: 'ArrowUp', description: 'Increase volume', action: () => videoActions.increaseVolume(0.1) },
  { key: 'ArrowDown', description: 'Decrease volume', action: () => videoActions.decreaseVolume(0.1) },
  { key: 'm', description: 'Mute/Unmute', action: videoActions.toggleMute },
  { key: 'f', description: 'Toggle fullscreen', action: videoActions.toggleFullScreen },
  { key: '.', description: 'Next frame', action: videoActions.nextFrame, shiftKey: true },
  { key: ',', description: 'Previous frame', action: videoActions.previousFrame, shiftKey: true },
  { key: 'v', description: 'Toggle subtitles', action: videoActions.toggleSubtitles },
  { key: 'a', description: 'Next audio track', action: videoActions.nextAudioTrack },
  { key: 'a', description: 'Previous audio track', action: videoActions.previousAudioTrack, shiftKey: true },
  { key: '/', description: 'Show keymap', action: videoActions.toggleKeymapDialog, shiftKey: true },
  { key: '+', description: 'Increase playback rate', action: videoActions.increasePlaybackRate },
  { key: '-', description: 'Decrease playback rate', action: videoActions.decreasePlaybackRate },
  { key: '0', description: 'Reset playback rate', action: videoActions.resetPlaybackRate },
  { key: 'o', description: 'Open file', action: videoActions.loadFile },
];

// Add TypeScript interface for the window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      platform: string;
      openFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      getFilePath: (file: File) => string;
      openFileInExplorer: (filePath: string) => Promise<void>;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      toggleFullscreen: () => void;
      checkAirPlayAvailability: () => Promise<boolean>;
      startAirPlay: (deviceName: string) => Promise<void>;
      stopAirPlay: () => Promise<void>;
      getAirPlayDevices: () => Promise<string[]>;
      startRemoteServer: () => Promise<string>;
      stopRemoteServer: () => Promise<void>;
      getRemotePlaybackUrl: () => Promise<string>;
      loadSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<boolean>;
      startWindowDrag: (mouseX: number, mouseY: number) => void;
      moveWindow: (mouseX: number, mouseY: number, startBounds: any, startMouseX: number, startMouseY: number) => void;
      on: (channel: string, callback: (...args: any[]) => void) => void;
      off: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
