import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { FaTimes } from 'react-icons/fa';
import './index.css';
import { videoState, videoActions } from './store/videoStore';
import { settingsState, settingsActions, useSettings } from './store/settingsStore';
import SettingsPanel from './components/SettingsPanel';
import KeymapDialog from './components/KeymapDialog';
import VideoControls from './components/VideoControls';
import VideoDisplay from './components/VideoDisplay';
import GlobalListeners from './components/GlobalListeners';
import { Toaster, toast } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import PlaylistSidebar from './components/PlaylistSidebar';
import FileHistoryPanel from './components/FileHistoryPanel';
import CommandPalette from './components/CommandPalette';
import FileAssociationDialog from './components/FileAssociationDialog';
import InitialSetupDialog from './components/InitialSetupDialog';

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDragEndRef = useRef<number>(0);

  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  const snap = useSnapshot(videoState);

  // Load settings and volume on mount
  useEffect(() => {
    settingsActions.loadSettings().then(() => {
      // Load volume from settings
      const settings = settingsState;
      if (settings && settings.player__volume) {
        videoActions.setVolume(settings.player__volume / 100);
      }
    });

    // Load file history from storage
    videoActions.loadHistoryFromStorage();

    // Load positions from storage
    videoActions.loadPositionsFromStorage();

    // Load file from query string if present
    videoActions.loadFromQueryString();
  }, []);

  // Handle thumbnail control events
  useEffect(() => {
    const handler = (_event: any, action: string) => {
      switch (action) {
        case 'prev':
          videoActions.loadPreviousFile();
          break;
        case 'playpause':
          videoActions.togglePlay();
          break;
        case 'next':
          videoActions.loadNextFile();
          break;
        case 'fullscreen':
          videoActions.toggleFullScreen();
          break;
      }
    };
    window.ipcRenderer.on('thumbnail-control', handler);
    return () => {
      window.ipcRenderer.off('thumbnail-control', handler);
    };
  }, []);

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


  const settings = useSettings();

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Toaster position="top-right" richColors theme='dark' offset={{ top: 30 }} />
        <AnimatePresence>
          {settings.app__firstRun && (
            <InitialSetupDialog
              onClose={() => settingsActions.updateSetting('app__firstRun', false)}
            />
          )}
        </AnimatePresence>
        <div className={`floating-time-container ${window.electronUtils.platform === 'win32' ? 'windows' : ''}`}>
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
          <VideoDisplay videoRef={videoRef} />

          <VideoControls
            showControls={showControls}
            videoRef={videoRef}
          />

          <GlobalListeners
            containerRef={containerRef}
            lastDragEndRef={lastDragEndRef}
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

          {/* Playlist Sidebar */}
          <PlaylistSidebar />

          {/* File History Panel */}
          <FileHistoryPanel />

                    {/* Command Palette */}
          <CommandPalette
            isOpen={snap.isCommandPaletteOpen}
            onClose={() => videoActions.toggleCommandPalette()}
          />

          {/* File Association Dialog */}
          <AnimatePresence>
            {snap.isFileAssociationDialogOpen && (
              <FileAssociationDialog onClose={() => videoActions.toggleFileAssociationDialog()} />
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
