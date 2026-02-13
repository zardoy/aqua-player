import { electronMethods } from '../ipcRenderer';
import { AUDIO_EXTENSIONS, VIDEO_EXTENSIONS } from '../../shared/constants';
import { proxy } from 'valtio';
import { settingsState } from './settingsStore';
import { toast } from 'sonner';

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

export const videoState = proxy({
  // Playback state
  isPlaying: false,
  progress: 0,
  volume: 1,
  isMuted: false,
  isFullScreen: false,
  videoResolutionDisplay: '',
  duration: 0,
  currentTime: 0,
  playbackRate: 1,
  isEnded: false,
  fps: 0, // Add FPS state
  videoBitrate: 0,
  videoCodec: '',

  // File state
  currentFile: '',
  fileType: '',

  // Video zoom state
  zoomLevel: 1,
  zoomEnabled: true,

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
  isCommandPaletteOpen: false,
  isFileAssociationDialogOpen: false,
  isKeybindingsDialogOpen: false,

  // Marker state (in seconds)
  markerTime: null as number | null,
  // Time diff UI
  timeDiffMs: null as number | null,
  showTimeDiff: false,

  // Error handling
  hasError: false,
  errorMessage: '',

  isLooping: false,

  // Playlist state
  currentFolder: '',
  playlistFiles: [] as string[],
  viewedFiles: new Set<string>(),
  isPlaylistOpen: false,

  // File history
  fileHistory: [] as string[],
  openedFiles: new Set<string>(),
  isHistoryOpen: false,
});
globalThis.videoState = videoState

export const videoActions = {
  // Playback controls
  togglePlay: () => {
    if (videoState.isPlaying) {
      videoActions.pause();
    } else {
      videoActions.play();
    }
  },
  play: () => {
    if (videoState.isEnded) {
      videoState.progress = 0;
      videoState.currentTime = 0;
      videoState.isEnded = false;
      // Reset video element's time directly when restarting from ended state
      const video = globalThis.video as HTMLVideoElement;
      if (video && video.ended) {
        video.currentTime = 0;
      }
    }
    videoState.isPlaying = true;
  },
  pause: () => {
    videoState.isPlaying = false;
  },
  setProgress: (progress: number) => {
    videoState.progress = progress;
  },
  setCurrentTime: (time: number, canContinuePlaying = true) => {
    videoState.currentTime = time;
    videoState.progress = videoState.duration > 0 ? time / videoState.duration : 0;

    // Save position every 5 seconds
    if (videoState.currentFile && time > 0 && time % 5 < 1) {
      videoActions.savePosition(videoState.currentFile, time);
    }

    if (canContinuePlaying && settingsState.controls__autoPlayOnSeek && !videoState.isPlaying) {
      videoActions.play();
    }
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
    // More robust frame calculation with fallback
    let frameDuration: number;

    if (videoState.fps > 0) {
      frameDuration = 1 / videoState.fps;
    } else if (videoState.duration > 0) {
      // Fallback: estimate 30fps for videos, 1 second for audio
      frameDuration = videoState.fileType && VIDEO_EXTENSIONS.includes(videoState.fileType.toLowerCase()) ? 1/30 : 1;
    } else {
      // Default fallback
      frameDuration = 1/30;
    }

    const newTime = Math.min(videoState.currentTime + frameDuration, videoState.duration);
    videoActions.setCurrentTime(newTime, false);
  },
  previousFrame: () => {
    // More robust frame calculation with fallback
    let frameDuration: number;

    if (videoState.fps > 0) {
      frameDuration = 1 / videoState.fps;
    } else if (videoState.duration > 0) {
      // Fallback: estimate 30fps for videos, 1 second for audio
      frameDuration = videoState.fileType && VIDEO_EXTENSIONS.includes(videoState.fileType.toLowerCase()) ? 1/30 : 1;
    } else {
      // Default fallback
      frameDuration = 1/30;
    }

    const newTime = Math.max(videoState.currentTime - frameDuration, 0);
    videoActions.setCurrentTime(newTime, false);
  },

  // Short and long seek jumps
  seekShortForward: () => {
    const distance = Math.max(1, Math.min(30, settingsState.controls__shortSeekDistance));
    videoActions.seekForward(distance);
  },
  seekShortBackward: () => {
    const distance = Math.max(1, Math.min(30, settingsState.controls__shortSeekDistance));
    videoActions.seekBackward(distance);
  },
  seekLongForward: () => {
    const distance = Math.max(5, Math.min(300, settingsState.controls__longSeekDistance));
    videoActions.seekForward(distance);
  },
  seekLongBackward: () => {
    const distance = Math.max(5, Math.min(300, settingsState.controls__longSeekDistance));
    videoActions.seekBackward(distance);
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

  // Zoom controls
  setZoomLevel: (level: number) => {
    const clampedLevel = Math.max(0.1, Math.min(5, level));
    const oldLevel = videoState.zoomLevel;
    videoState.zoomLevel = clampedLevel;

    // Show toast notification for significant zoom changes
    if (Math.abs(clampedLevel - oldLevel) >= 0.2) {
      toast.info(`Zoom: ${Math.round(clampedLevel * 100)}%`);
    }
  },
  increaseZoom: (amount = 0.1) => {
    if (videoState.zoomEnabled) {
      videoActions.setZoomLevel(videoState.zoomLevel + amount);
    }
  },
  decreaseZoom: (amount = 0.1) => {
    if (videoState.zoomEnabled) {
      videoActions.setZoomLevel(videoState.zoomLevel - amount);
    }
  },
  resetZoom: () => {
    videoActions.setZoomLevel(1);
  },
  toggleZoom: () => {
    videoState.zoomEnabled = !videoState.zoomEnabled;
    if (!videoState.zoomEnabled) {
      videoActions.resetZoom();
    }
  },

  // Position memory
  savePosition: (filePath: string, time: number) => {
    if (filePath) {
      if (!settingsState.player__savePosition) {
        return; // Don't save if disabled
      }

      // Save to localStorage
      try {
        const stored = localStorage.getItem('aqua-player-positions');
        const positions = stored ? JSON.parse(stored) : {};
        positions[filePath] = time;
        localStorage.setItem('aqua-player-positions', JSON.stringify(positions));
      } catch (error) {
        console.error('Failed to save position:', error);
      }
    }
  },
  loadPosition: (filePath: string): number => {
    if (!filePath) return 0;

    if (!settingsState.player__savePosition) {
      return 0; // Don't load if disabled
    }

    // Try to get from localStorage
    try {
      const stored = localStorage.getItem('aqua-player-positions');
      if (stored) {
        const positions = JSON.parse(stored);
        if (positions[filePath]) {
          return positions[filePath];
        }
      }
    } catch (error) {
      console.error('Failed to load position:', error);
    }

    return 0;
  },

  // HTTP streaming support
  loadStreamUrl: (url: string) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      videoState.currentFile = url;
      videoState.fileType = 'stream';
      videoState.hasError = false;
      videoState.errorMessage = '';

      // Add to file history
      videoActions.addToHistory(url);
      videoState.openedFiles.add(url);

      // Update query string
      videoActions.updateQueryString(url);

      toast.success(`Loading stream: ${url}`);

      return url;
    }
    return null;
  },
  getCurrentSrc: (): string => {
    return videoState.currentFile || '';
  },

  // Screen controls
  toggleFullScreen: () => {
    videoState.isFullScreen = !videoState.isFullScreen;
    electronMethods.toggleFullscreen();
  },

  // File operations
  loadFile: async () => {
    const result = await electronMethods.openFileDialog();
    if (!result.canceled && result.filePaths.length > 0) {
      videoActions.loadFilePath(result.filePaths[0]);
    }
  },

  // Load file from path (for drag and drop)
  loadFilePath: async (filePath: string) => {
    try {
      if (filePath) {
        videoState.currentFile = filePath;
        videoState.fileType = filePath.split('.').pop() || '';
        videoState.hasError = false;
        videoState.errorMessage = '';

        // Add to file history and opened files
        videoActions.addToHistory(filePath);
        videoState.openedFiles.add(filePath);

        // Update query string
        videoActions.updateQueryString(filePath);

        // Get video metadata (FPS, duration, etc.)
        try {
          const metadata = await electronMethods.getVideoMetadata(filePath);
          if (metadata) {
            videoState.fps = metadata.fps || 0;
            videoState.duration = metadata.duration || 0;
            videoState.videoBitrate = metadata.bitrate || 0;
            videoState.videoCodec = metadata.codec || '';
          }
        } catch (metadataError) {
          console.warn('Failed to get video metadata:', metadataError);
        }

        // Update playlist with files from the same folder
        const lastSeparatorIndex = Math.max(
          filePath.lastIndexOf('/'),
          filePath.lastIndexOf('\\')
        );
        const folder = lastSeparatorIndex >= 0 ? filePath.slice(0, lastSeparatorIndex) : '';
        videoState.currentFolder = folder;
        const files = await electronMethods.getFolderContents(folder);

        // Determine if current file is video or audio
        const currentExt = filePath.toLowerCase().split('.').pop() || '';
        const videoExts = VIDEO_EXTENSIONS;
        const audioExts = AUDIO_EXTENSIONS;

        const isVideo = videoExts.includes(currentExt);
        const isAudio = audioExts.includes(currentExt);

        // Filter playlist based on file type
        videoState.playlistFiles = files.filter(f => {
          const ext = f.toLowerCase().split('.').pop() || '';
          if (isVideo) {
            return videoExts.includes(ext);
          } else if (isAudio) {
            return audioExts.includes(ext);
          }
          return false;
        });

        // Load saved position for this file
        const savedPosition = videoActions.loadPosition(filePath);
        if (savedPosition > 0) {
          // Set the progress to restore position
          videoState.progress = savedPosition / (videoState.duration || 1);
        }

        return filePath;
      }
      return null;
    } catch (error) {
      videoState.hasError = true;
      videoState.errorMessage = `Failed to load file: ${error.message}`;
      return null;
    }
  },

  markFileAsViewed: (filePath: string) => {
    videoState.viewedFiles.add(filePath);
    // Persist metadata about watched videos
    try {
      electronMethods.syncMetadata({
        watchedVideos: {
          [filePath]: { watchedAt: new Date().toISOString() }
        }
      });
    } catch { /* empty */ }
  },

  loadNextFile: () => {
    const currentIndex = videoState.playlistFiles.indexOf(videoState.currentFile);
    if (currentIndex < videoState.playlistFiles.length - 1) {
      const nextFile = videoState.playlistFiles[currentIndex + 1];
      videoActions.loadFilePath(nextFile);
    }
  },

  loadPreviousFile: () => {
    const currentIndex = videoState.playlistFiles.indexOf(videoState.currentFile);
    if (currentIndex > 0) {
      const prevFile = videoState.playlistFiles[currentIndex - 1];
      videoActions.loadFilePath(prevFile);
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
  nextSubtitleTrack: () => {
    if (videoState.subtitleTracks.length === 0) return;
    const nextIndex = (videoState.currentSubtitleTrack + 1) % videoState.subtitleTracks.length;
    videoActions.selectSubtitleTrack(nextIndex);
  },
  previousSubtitleTrack: () => {
    if (videoState.subtitleTracks.length === 0) return;
    const prevIndex = videoState.currentSubtitleTrack - 1 < 0 ?
      videoState.subtitleTracks.length - 1 : videoState.currentSubtitleTrack - 1;
    videoActions.selectSubtitleTrack(prevIndex);
  },

  // Duration and time
  setDuration: (duration: number) => {
    videoState.duration = duration;
  },

  // Remote playback
  startRemoteServer: async () => {
    try {
      const url = await electronMethods.startRemoteServer();
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
      await electronMethods.stopRemoteServer();
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
      const available = await electronMethods.checkAirPlayAvailability();
      videoState.airPlayAvailable = available;
      return available;
    } catch (error) {
      videoState.airPlayAvailable = false;
      return false;
    }
  },
  getAirPlayDevices: async () => {
    try {
      const devices = await electronMethods.getAirPlayDevices();
      videoState.airPlayDevices = devices;
      return devices;
    } catch (error) {
      videoState.airPlayDevices = [];
      return [];
    }
  },
  startAirPlay: async (deviceName: string) => {
    try {
      await electronMethods.startAirPlay(deviceName);
      videoState.isAirPlaying = true;
      videoState.currentAirPlayDevice = deviceName;
    } catch (error) {
      videoState.hasError = true;
      videoState.errorMessage = `Failed to start AirPlay: ${error.message}`;
    }
  },
  stopAirPlay: async () => {
    try {
      await electronMethods.stopAirPlay();
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
  toggleCommandPalette: () => {
    videoState.isCommandPaletteOpen = !videoState.isCommandPaletteOpen;
  },
  toggleFileAssociationDialog: () => {
    videoState.isFileAssociationDialogOpen = !videoState.isFileAssociationDialogOpen;
  },
  toggleKeybindingsDialog: () => {
    videoState.isKeybindingsDialogOpen = !videoState.isKeybindingsDialogOpen;
  },
  toggleLoop: () => {
    videoState.isLooping = !videoState.isLooping;
  },

  togglePlaylist: () => {
    videoState.isPlaylistOpen = !videoState.isPlaylistOpen;
  },

  toggleHistory: () => {
    videoState.isHistoryOpen = !videoState.isHistoryOpen;
  },

  // Marker functions
  setMarker: (time?: number) => {
    const t = typeof time === 'number' ? time : videoState.currentTime;
    videoState.markerTime = t;
  },
  clearMarker: () => {
    videoState.markerTime = null;
  },
  seekToMarker: () => {
    if (videoState.markerTime !== null) {
      videoActions.setCurrentTime(videoState.markerTime);
    }
  },
  showTimeDiff: () => {
    if (videoState.markerTime === null) return;
    const diff = (videoState.currentTime - videoState.markerTime) * 1000;
    videoState.timeDiffMs = Math.round(diff);
    videoState.showTimeDiff = true;
    setTimeout(() => {
      videoState.showTimeDiff = false;
      videoState.timeDiffMs = null;
    }, 2000);
  },

  // File history management
  addToHistory: (filePath: string) => {
    // Remove if already exists
    videoState.fileHistory = videoState.fileHistory.filter(f => f !== filePath);
    // Add to beginning
    videoState.fileHistory.unshift(filePath);
    const HISTORY_LIMIT = 1000
    videoState.fileHistory = videoState.fileHistory.slice(0, HISTORY_LIMIT);
    // Save to localStorage
    localStorage.setItem('aqua-player-file-history', JSON.stringify(videoState.fileHistory));
  },

  loadHistoryFromStorage: () => {
    try {
      const stored = localStorage.getItem('aqua-player-file-history');
      if (stored) {
        videoState.fileHistory = JSON.parse(stored);
        // Also load opened files
        videoState.openedFiles = new Set(videoState.fileHistory);
      }
    } catch (error) {
      console.error('Failed to load file history:', error);
    }
  },

  // Query string management
  updateQueryString: (filePath: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('file', encodeURIComponent(filePath));
    window.history.replaceState({}, '', url);
  },

  loadFromQueryString: () => {
    const url = new URL(window.location.href);
    const filePath = url.searchParams.get('file');
    const time = url.searchParams.get('time');
    if (filePath) {
      try {
        const decodedPath = decodeURIComponent(filePath);
        videoActions.loadFilePath(decodedPath);
        videoActions.pause()
        if (time) {
          videoActions.setCurrentTime(parseFloat(time));
        }
      } catch (error) {
        console.error('Failed to load file from query string:', error);
      }
    }
  },

  // Error handling
  clearError: () => {
    videoState.hasError = false;
    videoState.errorMessage = '';
  },
  setError: (message: string) => {
    videoState.hasError = true;
    videoState.errorMessage = message;
  },
};
globalThis.videoActions = videoActions;

// Add TypeScript interface for the window utilities
declare global {
  interface Window {
    ipcRenderer: Electron.IpcRenderer;
    electronUtils: {
      platform: string;
      getFilePath: (file: File) => string;
    };
  }
}
