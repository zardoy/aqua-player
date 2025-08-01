import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaExpand, FaFolder, FaCog, FaTimes } from 'react-icons/fa';
import { MdSubtitles, MdAirplay } from 'react-icons/md';
import './index.css';
import { videoState, videoActions, defaultKeymap } from './store/videoStore';
import SettingsPanel from './components/SettingsPanel';
import KeymapDialog from './components/KeymapDialog';
import { Toaster, toast } from 'sonner';

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekBarRef = useRef<HTMLInputElement>(null);
  const volumeBarRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [videoResolution, setVideoResolution] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');

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

      // Update progress bar color
      if (seekBarRef.current) {
        const progress = video.currentTime / video.duration;
        const percentage = (progress * 100) + '%';
        seekBarRef.current.style.background = `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${percentage}, rgba(255, 255, 255, 0.2) ${percentage})`;
      }
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
      // Use custom protocol for local files to avoid CSP issues
      const fileUrl = snap.currentFile.startsWith('local-file://') ? snap.currentFile : `file://${snap.currentFile}`;
      video.src = fileUrl;

      // Add error handling for video loading
      const handleError = (e: Event) => {
        const target = e.target as HTMLVideoElement;
        const errorMessage = `Failed to load video: ${target.error?.message || 'Unknown error'}`;
        videoActions.setError(errorMessage);
        toast.error(errorMessage);
      };

      const handleLoadStart = () => {
        // toast.info('Loading video...');
      };

      const handleCanPlay = () => {
        // Get video metadata
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        if (videoWidth && videoHeight) {
          setVideoResolution(`${videoHeight}p`);
        }

        // Extract title from filename
        const fileName = snap.currentFile.split('/').slice(-1)[0] || snap.currentFile.split('\\').slice(-1)[0] || '';
        setVideoTitle(fileName.replace(/\.[^/.]+$/, '')); // Remove file extension

        // Auto-play the video when it's ready
        video.play().catch(error => {
          console.error('Auto-play failed:', error);
        });
      };

      video.addEventListener('error', handleError);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('canplay', handleCanPlay);

      return () => {
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('canplay', handleCanPlay);
      };
    } catch (error) {
      console.error('Error setting video source:', error);
      const errorMessage = `Failed to load video: ${error.message}`;
      videoActions.setError(errorMessage);
      toast.error(errorMessage);
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

  // Update system time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-hide controls with improved logic
  useEffect(() => {
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isForceHidden = false;

    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;

      // Check for small mouse jitter (less than 5px movement)
      const deltaX = Math.abs(currentX - lastMouseX);
      const deltaY = Math.abs(currentY - lastMouseY);

      if (deltaX < 5 && deltaY < 5) {
        return; // Ignore small movements
      }

      lastMouseX = currentX;
      lastMouseY = currentY;

      if (isForceHidden) {
        isForceHidden = false;
      }

      setShowControls(true);
      // Show cursor when UI is shown
      document.body.style.cursor = 'default';

      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }

      const timeout = setTimeout(() => {
        if (snap.isPlaying && !isForceHidden) {
          setShowControls(false);
          // Hide cursor when UI is hidden
          document.body.style.cursor = 'none';
        }
      }, 3000);

      setControlsTimeout(timeout);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        isForceHidden = true;
        setShowControls(false);
        if (controlsTimeout) {
          clearTimeout(controlsTimeout);
        }
      } else if (e.key === ' ') {
        // Space key - hide UI and cursor
        e.preventDefault();
        isForceHidden = true;
        setShowControls(false);
        if (controlsTimeout) {
          clearTimeout(controlsTimeout);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout, snap.isPlaying]);

  // Handle seek bar input
  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = parseFloat(e.target.value);
    videoActions.setProgress(progress);

    // Update progress bar color
    const seekBar = e.target;
    const percentage = (progress * 100) + '%';
    seekBar.style.background = `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${percentage}, rgba(255, 255, 255, 0.2) ${percentage})`;
  };

  // Handle volume bar input
  const handleVolumeBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    videoActions.setVolume(volume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenFile = async () => {
    await videoActions.loadFile();
  };

    // Handle drag and drop
  useEffect(() => {
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];

        try {
          // Use the modern webUtils approach to get file path
          const filePath = window.electronAPI.getFilePath(file);

          if (filePath) {
            videoActions.loadFilePath(filePath);
            // toast.success('File loaded via drag & drop');
          }
        } catch (error) {
          console.error('Error getting file path:', error);
          toast.error('Failed to load file via drag & drop');
        }
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);

    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  return (
    <div className="app-container">
      <Toaster position="top-right" richColors theme='dark' offset={{ top: 30 }} />
                  {/* Floating window controls - positioned based on platform */}
      <div className={`floating-controls ${window.electronAPI.platform === 'darwin' ? 'macos' : 'windows'}`}>
        {window.electronAPI.platform === 'darwin' ? (
          // macOS controls on the left
          <div className="window-controls">
            {/* <button onClick={() => window.electronAPI.closeWindow()} className="window-control close">×</button>
            <button onClick={() => window.electronAPI.minimizeWindow()} className="window-control minimize">—</button>
            <button onClick={() => window.electronAPI.maximizeWindow()} className="window-control maximize">□</button> */}
          </div>
        ) : (
          // Windows controls on the right
          <div className="window-controls">
            <button onClick={() => window.electronAPI.minimizeWindow()} className="window-control minimize">—</button>
            <button onClick={() => window.electronAPI.maximizeWindow()} className="window-control maximize">□</button>
            <button onClick={() => window.electronAPI.closeWindow()} className="window-control close">×</button>
          </div>
        )}

        {/* Time display on the right */}
        <div className="floating-time">{currentTime}</div>
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
              </div>

              <div className="controls-row">
                <div className="left-controls">
                  <button onClick={() => videoActions.togglePlay()} className="control-button">
                    {snap.isPlaying ? <FaPause /> : <FaPlay />}
                  </button>

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

                                    <div className="time-display">
                    {formatTime(snap.currentTime)} / {formatTime(snap.duration)}
                  </div>

                  {videoTitle && (
                    <div className="video-title" title={videoTitle}>
                      {videoTitle}
                    </div>
                  )}

                  {videoResolution && (
                    <div className="resolution-badge">
                      {videoResolution}
                    </div>
                  )}
                </div>

                                <div className="right-controls">
                  <div className="download-speed">
                    <div className="speed-indicator">
                      <div className="speed-dot"></div>
                      1.2 MB/s
                    </div>
                  </div>

                  {snap.subtitleTracks.length > 0 && (
                    <button
                      onClick={() => videoActions.toggleSubtitles()}
                      className={`control-button ${snap.showSubtitles ? 'active' : ''}`}
                    >
                      <MdSubtitles />
                    </button>
                  )}

                  <button onClick={handleOpenFile} className="control-button"><FaFolder /></button>
                  <button onClick={() => videoActions.toggleSettings()} className="control-button"><FaCog /></button>
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
