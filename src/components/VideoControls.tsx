import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaExpand, FaFolder, FaCog, FaRedo, FaList, FaHistory } from 'react-icons/fa';
import { MdSubtitles } from 'react-icons/md';
import { videoState, videoActions } from '../store/videoStore';
import { useSettings } from '../store/settingsStore';
import VolumeSlider from './VolumeSlider';
import { electronMethods } from '../renderer/ipcRenderer';

interface VideoControlsProps {
  showControls: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}

type ToolbarItemType = 'playPause' | 'loop' | 'playlist' | 'history' | 'volumeBar' | 'timeDisplay' | 'title' | 'resolution' | 'networkIndicator' | 'subtitles' | 'openFile' | 'settings' | 'fullscreen';

interface ToolbarConfig {
  left: ToolbarItemType[];
  right: ToolbarItemType[];
}

const VideoControlsVisible: React.FC<VideoControlsProps> = ({
  videoRef,
}) => {
  const snap = useSnapshot(videoState);
  const settings = useSettings();

  // Local refs for seek and volume bars
  const seekBarRef = useRef<HTMLInputElement>(null);
  const volumeBarRef = useRef<HTMLInputElement>(null);

  // Handle seek bar input
  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = parseFloat(e.target.value);
    videoActions.setProgress(progress);
  };

  // Update seek bar color
  useEffect(() => {
    const seekBar = seekBarRef.current;
    if (seekBar) {
      const progress = snap.progress;
      const percentage = (progress * 100) + '%';
      seekBar.style.background = `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${percentage}, rgba(255, 255, 255, 0.2) ${percentage})`;
    }
  }, [snap.progress]);

  // Update volume bar color
  useEffect(() => {
    const volumeBar = volumeBarRef.current;
    if (volumeBar) {
      const volume = snap.isMuted ? 0 : snap.volume;
      const percentage = (volume * 100) + '%';
      volumeBar.style.setProperty('--volume-progress', percentage);
    }
  }, [snap.isMuted, snap.volume]);

  // Toolbar configuration
  const toolbarConfig: ToolbarConfig = {
    left: ['playPause', 'volumeBar', 'timeDisplay', 'title', 'resolution', 'zoomIndicator', 'loop', 'playlist', 'history'],
    right: ['networkIndicator', 'subtitles', 'openFile', 'settings', 'fullscreen']
  };


  const toolbarProps = {}

  return (
    <motion.div
      className="video-controls"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.stopPropagation()}
      tabIndex={-1}
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
          tabIndex={-1}
        />
      </div>

      <div className="controls-row">
        <div className="left-controls">
          {toolbarConfig.left.map(type => (
            <ToolbarItem
              key={type}
              type={type}
              {...toolbarProps}
            />
          ))}
        </div>

        <div className="right-controls">
          {toolbarConfig.right.map(type => (
            <ToolbarItem
              key={type}
              type={type}
              {...toolbarProps}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const VideoControls: React.FC<VideoControlsProps> = (props) => {
  const snap = useSnapshot(videoState);
  const settings = useSettings();

  // Update video resolution when video metadata is available
  useEffect(() => {
    const { videoRef } = props;
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      if (videoWidth && videoHeight) {
        videoState.videoResolutionDisplay = videoWidth === 3840 ? '4k' : videoWidth === 1920 ? '1080p' : videoWidth === 1280 ? '720p' : videoWidth === 854 ? '480p' : videoWidth === 640 ? '360p' : `${videoWidth}p`;
      }
    };

    video.addEventListener('canplay', handleCanPlay);
    return () => video.removeEventListener('canplay', handleCanPlay);
  }, [props.videoRef]);

  // Handle mouse buttons for playlist navigation
  useEffect(() => {
    const handleMouseButton = (e: MouseEvent) => {
      if (e.button === 3) { // Mouse4 (back)
        videoActions.loadPreviousFile();
      } else if (e.button === 4) { // Mouse5 (forward)
        videoActions.loadNextFile();
      }
    };

    window.addEventListener('mouseup', handleMouseButton);
    return () => window.removeEventListener('mouseup', handleMouseButton);
  }, []);

  useEffect(() => {
    const { videoRef } = props;
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (videoState.currentFile) {
        videoActions.markFileAsViewed(videoState.currentFile);
      }
    };

    const handleTimeUpdate = () => {
      if (!video || !videoState.currentFile) return;

      // Only mark as viewed if video is longer than 5 seconds and we've watched 80%
      if (video.duration > 5 && (video.currentTime / video.duration) >= 0.8) {
        handleEnded();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [props.videoRef]);

  // Wheel volume control
  useEffect(() => {
    if (!settings.controls__wheelVolumeControl) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent wheel events when hovering over controls
      const target = e.target as HTMLElement;
      let hasScrollableParent = false
      let currentElement = target;
      while (currentElement.parentElement) {
        if (currentElement.scrollHeight > currentElement.clientHeight) {
          hasScrollableParent = true;
          break;
        }
        currentElement = currentElement.parentElement;
      }
      if (hasScrollableParent) return;

      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newVolume = Math.max(0, Math.min(1, snap.volume + delta));
      videoActions.setVolume(newVolume);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [snap.volume]);

  return (
    <AnimatePresence>
      {props.showControls && <VideoControlsVisible {...props} />}
    </AnimatePresence>
  );
};

interface ToolbarItemProps {
  type: ToolbarItemType;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({
  type,
}) => {
  const snap = useSnapshot(videoState);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayTitle = () => {
    if (!snap.currentFile) return '';
    const fileName = snap.currentFile.split(/[/\\]/).slice(-1)[0] || '';
    return fileName.replace(/\.[^/.]+$/, '');
  };

  const getFullPath = () => {
    if (!snap.currentFile) return '';
    return snap.currentFile.replace(/\\/g, '/');
  };

  const handleTitleClick = () => {
    if (snap.currentFile) {
      electronMethods.openFileInExplorer(snap.currentFile);
    }
  };

  switch (type) {
    case 'playPause':
      return (
        <button
          onClick={() => videoActions.togglePlay()}
          className="control-button"
          tabIndex={-1}
        >
          {snap.isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      );

          case 'volumeBar':
        return (
          <div className="volume-control">
            <button
              onClick={() => videoActions.toggleMute()}
              className="control-button"
              tabIndex={-1}
            >
              {snap.isMuted ? <FaVolumeMute /> : snap.volume > 0.5 ? <FaVolumeUp /> : <FaVolumeDown />}
            </button>
            <VolumeSlider
              value={snap.isMuted ? 0 : snap.volume}
              onChange={value => videoActions.setVolume(value)}
              className="volume-bar"
            />
          </div>
        );

    case 'timeDisplay':
      return (
        <div className="time-display">
          {formatTime(snap.currentTime)} / {formatTime(snap.duration)}
        </div>
      );

    case 'title':
      return snap.currentFile ? (
        <div
          className="video-title"
          title={getFullPath()}
          onClick={handleTitleClick}
          style={{ cursor: 'pointer' }}
          tabIndex={-1}
        >
          {getDisplayTitle()}
        </div>
      ) : null;

    case 'resolution':
      return snap.videoResolutionDisplay ? (
        <div className="resolution-badge">
          {snap.videoResolutionDisplay}
        </div>
      ) : null;

    case 'zoomIndicator':
      return snap.zoomLevel !== 1 ? (
        <div 
          className="zoom-badge" 
          title={`Zoom: ${Math.round(snap.zoomLevel * 100)}% (Click to reset)`}
          onClick={() => videoActions.resetZoom()}
        >
          {Math.round(snap.zoomLevel * 100)}%
        </div>
      ) : null;

    case 'loop':
      return (
        <button
          onClick={() => videoActions.toggleLoop()}
          className={`control-button ${!snap.isLooping ? 'inactive' : ''}`}
          tabIndex={-1}
        >
          <FaRedo />
        </button>
      );

    case 'playlist':
      return (
        <button
          onClick={() => videoActions.togglePlaylist()}
          className={`control-button ${!snap.isPlaylistOpen ? 'inactive' : ''}`}
          tabIndex={-1}
          title="Toggle Playlist (P)"
        >
          <FaList />
        </button>
      );

    case 'history':
      return (
        <button
          onClick={() => videoActions.toggleHistory()}
          className={`control-button ${!snap.isHistoryOpen ? 'inactive' : ''}`}
          tabIndex={-1}
          title="Toggle File History"
        >
          <FaHistory />
        </button>
      );

    case 'networkIndicator':
      return (
        <div className="download-speed">
          <div className="speed-indicator">
            <div className="speed-dot"></div>
            1.2 MB/s
          </div>
        </div>
      );

    case 'subtitles':
      return snap.subtitleTracks.length > 0 ? (
        <button
          onClick={() => videoActions.toggleSubtitles()}
          className={`control-button ${snap.showSubtitles ? 'active' : ''}`}
          tabIndex={-1}
        >
          <MdSubtitles />
        </button>
      ) : null;

    case 'openFile':
      return (
        <button onClick={() => videoActions.loadFile()} className="control-button" tabIndex={-1}>
          <FaFolder />
        </button>
      );

    case 'settings':
      return (
        <button onClick={() => videoActions.toggleSettings()} className="control-button" tabIndex={-1}>
          <FaCog />
        </button>
      );

    case 'fullscreen':
      return (
        <button onClick={() => videoActions.toggleFullScreen()} className="control-button" tabIndex={-1}>
          <FaExpand />
        </button>
      );

    default:
      return null;
  }
};

export default VideoControls;
