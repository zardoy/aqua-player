import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaExpand, FaFolder, FaCog, FaTimes } from 'react-icons/fa';
import { MdSubtitles, MdAirplay } from 'react-icons/md';
import './index.css';
import { videoState, videoActions, defaultKeymap } from './store/videoStore';

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekBarRef = useRef<HTMLInputElement>(null);
  const volumeBarRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  const snap = useSnapshot(videoState);

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set up event listeners
    const handlePlay = () => videoActions.play();
    const handlePause = () => videoActions.pause();
    const handleTimeUpdate = () => {
      videoActions.setCurrentTime(video.currentTime);
    };
    const handleDurationChange = () => {
      videoActions.setDuration(video.duration);
    };
    const handleVolumeChange = () => {
      videoActions.setVolume(video.volume);
    };
    const handleEnded = () => {
      videoActions.pause();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Handle playback state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (snap.isPlaying && video.paused) {
      video.play().catch(error => {
        videoActions.setError(`Failed to play video: ${error.message}`);
      });
    } else if (!snap.isPlaying && !video.paused) {
      video.pause();
    }
  }, [snap.isPlaying]);

  // Handle volume changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = snap.volume;
    video.muted = snap.isMuted;
  }, [snap.volume, snap.isMuted]);

  // Handle playback rate changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = snap.playbackRate;
  }, [snap.playbackRate]);

  // Handle seeking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.seeking) return;

    const targetTime = snap.progress * snap.duration;
    if (Math.abs(video.currentTime - targetTime) > 0.5) {
      video.currentTime = targetTime;
    }
  }, [snap.progress]);

  // Handle file loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !snap.currentFile) return;

    try {
      // For local files, we need to use a blob URL
      if (snap.currentFile.startsWith('file://') || snap.currentFile.startsWith('/')) {
        video.src = snap.currentFile;
      } else {
        video.src = snap.currentFile;
      }

      // Add error handling for video loading
      const handleError = (e) => {
        console.error('Video error:', e);
        videoActions.setError(`Failed to load video: ${e.target.error?.message || 'Unknown error'}`);
      };

      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('error', handleError);
      };
    } catch (error) {
      console.error('Error setting video source:', error);
      videoActions.setError(`Failed to load video: ${error.message}`);
    }
  }, [snap.currentFile]);

  // Handle keymap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keys if an input element is focused
      if (document.activeElement?.tagName === 'INPUT') return;

      for (const keyAction of defaultKeymap) {
        if (keyAction.key === e.key &&
            (!keyAction.shiftKey || e.shiftKey) &&
            (!keyAction.ctrlKey || e.ctrlKey) &&
            (!keyAction.altKey || e.altKey)) {
          e.preventDefault();
          keyAction.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);

      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }

      const timeout = setTimeout(() => {
        if (snap.isPlaying) {
          setShowControls(false);
        }
      }, 3000);

      setControlsTimeout(timeout);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout, snap.isPlaying]);

  // Handle seek bar input
  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = parseFloat(e.target.value);
    videoActions.setProgress(progress);
  };

  // Handle volume bar input
  const handleVolumeBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    videoActions.setVolume(volume);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle file open
  const handleOpenFile = async () => {
    await videoActions.loadFile();
  };

  // Handle drag and drop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.add('drag-over');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.remove('drag-over');
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.remove('drag-over');

      if (e.dataTransfer?.files.length) {
        const file = e.dataTransfer.files[0];
        // In Electron, we need to access the path property differently
        // @ts-ignore - path is available in Electron but not in standard File interface
        const filePath = file.path;

        if (!filePath) {
          videoActions.setError('Cannot access file path. Try using the open file button instead.');
          return;
        }

        // Check if it's a video file
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'wmv', 'm4v'];
        const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';

        if (videoExtensions.includes(fileExtension)) {
          videoActions.loadFilePath(filePath);
        } else {
          videoActions.setError('Unsupported file format. Please select a video file.');
        }
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="title-bar">
        <div className="window-controls">
          <button onClick={() => window.electronAPI.minimizeWindow()} className="window-control minimize">—</button>
          <button onClick={() => window.electronAPI.maximizeWindow()} className="window-control maximize">□</button>
          <button onClick={() => window.electronAPI.closeWindow()} className="window-control close">×</button>
        </div>
        <div className="system-time">{new Date().toLocaleTimeString()}</div>
        <div className="title">Electron Video Player</div>
        <div className="settings-icon">
          <button onClick={() => videoActions.toggleSettings()} className="control-button settings-button">
            <FaCog />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="video-container" onClick={() => videoActions.togglePlay()}>
        <video
          ref={videoRef}
          className="video-player"
          onClick={(e) => e.stopPropagation()}
        />

        <AnimatePresence>
          {showControls && (
            <motion.div
              className="video-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="progress-container">
                <input
                  type="range"
                  ref={seekBarRef}
                  className="seek-bar"
                  min="0"
                  max="1"
                  step="0.001"
                  value={snap.progress}
                  onChange={handleSeekBarChange}
                />
                <div className="time-display">
                  {formatTime(snap.currentTime)} / {formatTime(snap.duration)}
                </div>
              </div>

              <div className="controls-row">
                <div className="left-controls">
                  <button onClick={() => videoActions.togglePlay()} className="control-button">
                    {snap.isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <button onClick={() => videoActions.seekBackward(10)} className="control-button"><FaBackward /></button>
                  <button onClick={() => videoActions.seekForward(10)} className="control-button"><FaForward /></button>

                  <div className="volume-control">
                    <button onClick={() => videoActions.toggleMute()} className="control-button">
                      {snap.isMuted ? <FaVolumeMute /> : snap.volume > 0.5 ? <FaVolumeUp /> : <FaVolumeDown />}
                    </button>
                    <input
                      type="range"
                      ref={volumeBarRef}
                      className="volume-bar"
                      min="0"
                      max="1"
                      step="0.1"
                      value={snap.isMuted ? 0 : snap.volume}
                      onChange={handleVolumeBarChange}
                    />
                  </div>
                </div>

                <div className="right-controls">
                  <div className="playback-rate">
                    <span>{snap.playbackRate}x</span>
                  </div>

                  <button onClick={handleOpenFile} className="control-button"><FaFolder /></button>

                  {snap.subtitleTracks.length > 0 && (
                    <button
                      onClick={() => videoActions.toggleSubtitles()}
                      className={`control-button ${snap.showSubtitles ? 'active' : ''}`}
                    >
                      <MdSubtitles />
                    </button>
                  )}

                  {snap.airPlayAvailable && (
                    <button
                      onClick={() => videoActions.toggleSettings()}
                      className={`control-button ${snap.isAirPlaying ? 'active' : ''}`}
                    >
                      <MdAirplay />
                    </button>
                  )}

                  <button onClick={() => videoActions.toggleFullScreen()} className="control-button"><FaExpand /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {snap.isSettingsOpen && (
            <SettingsPanel onClose={() => videoActions.toggleSettings()} />
          )}
        </AnimatePresence>

        {/* Keymap Dialog */}
        <AnimatePresence>
          {snap.isKeymapDialogOpen && (
            <KeymapDialog onClose={() => videoActions.toggleKeymapDialog()} />
          )}
        </AnimatePresence>

        {/* Keymap Dialog */}
        <AnimatePresence>
          {snap.isKeymapDialogOpen && (
            <motion.div
              className="keymap-dialog"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="keymap-header">
                <h3>Keyboard Shortcuts</h3>
                <button onClick={() => videoActions.toggleKeymapDialog()} className="close-button"><FaTimes /></button>
              </div>

              <div className="keymap-content">
                <table className="keymap-table">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaultKeymap.map((keymap, index) => (
                      <tr key={index}>
                        <td>
                          {keymap.ctrlKey && 'Ctrl+'}
                          {keymap.altKey && 'Alt+'}
                          {keymap.shiftKey && 'Shift+'}
                          {keymap.key === ' ' ? 'Space' : keymap.key}
                        </td>
                        <td>{keymap.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {snap.hasError && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <p>{snap.errorMessage}</p>
              <button onClick={() => videoActions.clearError()} className="close-button"><FaTimes /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const App = () => {
  return <VideoPlayer />;
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
