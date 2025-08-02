import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { FaTimes } from 'react-icons/fa';
import './index.css';
import { videoState, videoActions } from './store/videoStore';
import { settingsState, settingsActions } from './store/settingsStore';
import SettingsPanel from './components/SettingsPanel';
import KeymapDialog from './components/KeymapDialog';
import VideoControls from './components/VideoControls';
import { Toaster, toast } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekBarRef = useRef<HTMLInputElement>(null);
  const volumeBarRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDragEndRef = useRef<number>(0);

  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState('');

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

    // Update progress bar on Windows
    window.electronAPI.setProgressBar(snap.isPlaying, snap.progress);
  }, [snap.isPlaying, snap.progress]);

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
      // Set window title with full filename
      const fileName = snap.currentFile.split(/[/\\]/).pop() || '';
      window.electronAPI.setWindowTitle(fileName);

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

  // Update system time every second
  useEffect(() => {
    setCurrentTime(new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date()));
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

      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }

      const timeout = setTimeout(() => {
        if (snap.isPlaying && !isForceHidden) {
          setShowControls(false);
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



  const handleOpenFile = async () => {
    await videoActions.loadFile();
  };

  // Handle window dragging
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDragging = false;
    let dragged = false
    let startBounds: any = null;
    let startMouseX = 0;
    let startMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      // Only start dragging if clicking directly on the container (not on controls)
      if (e.target === container) {
        isDragging = true;
        startMouseX = e.screenX;
        startMouseY = e.screenY;
        window.electronAPI.startWindowDrag(e.screenX, e.screenY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !startBounds) return;

      if (e.screenX === startMouseX && e.screenY === startMouseY) return;

      dragged = true
      window.electronAPI.moveWindow(
        e.screenX,
        e.screenY,
        startBounds,
        startMouseX,
        startMouseY
      );
    };

    const handleMouseUp = () => {
      if (dragged) {
        lastDragEndRef.current = Date.now();
      }
      dragged = false
      isDragging = false;
      startBounds = null;
    };

    // Listen for the drag enabled event from main process
    const handleDragEnabled = (event: any, data: any) => {
      startBounds = data.startBounds;
    };

    window.electronAPI.on('window-drag-enabled', handleDragEnabled);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.electronAPI.off('window-drag-enabled', handleDragEnabled);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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

  // Load settings on mount
  useEffect(() => {
    settingsActions.loadSettings();
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Toaster position="top-right" richColors theme='dark' offset={{ top: 30 }} />
        <div className={`floating-time-container ${window.electronAPI.platform === 'win32' ? 'windows' : ''}`}>
          <div className="floating-time">{currentTime}</div>
        </div>

        <div
          style={{ cursor: showControls ? 'default' : 'none' }}
          ref={containerRef}
          className="video-container"
          onClick={(e) => {
            if (e.target !== e.currentTarget) return;
            if (Date.now() - lastDragEndRef.current > 50) {
              videoActions.togglePlay();
            }
          }}
          onDoubleClick={(e) => {
            if (e.target !== e.currentTarget) return;
            if (Date.now() - lastDragEndRef.current > 50) {
              videoActions.toggleFullScreen()
            }
          }}
        >
          <video
            ref={videoRef}
            className="video-player"
            onClick={(e) => e.stopPropagation()}
          />

          <VideoControls
            showControls={showControls}
            onSeekBarChange={handleSeekBarChange}
            onVolumeBarChange={handleVolumeBarChange}
            onOpenFile={handleOpenFile}
            seekBarRef={seekBarRef}
            volumeBarRef={volumeBarRef}
            videoRef={videoRef}
          />

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
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <VideoPlayer />
    </ErrorBoundary>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
