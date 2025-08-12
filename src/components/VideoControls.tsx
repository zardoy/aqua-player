import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaExpand, FaFolder, FaCog, FaRedo, FaList } from 'react-icons/fa';
import { MdSubtitles } from 'react-icons/md';
import { videoState, videoActions } from '../store/videoStore';

interface VideoControlsProps {
  showControls: boolean;
  onSeekBarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVolumeBarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFile: () => void;
  seekBarRef: React.RefObject<HTMLInputElement>;
  volumeBarRef: React.RefObject<HTMLInputElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  showControls,
  onSeekBarChange,
  onVolumeBarChange,
  onOpenFile,
  seekBarRef,
  volumeBarRef,
  videoRef
}) => {
  const snap = useSnapshot(videoState);
  const [videoResolution, setVideoResolution] = useState<string>('');

  // Update video resolution when video metadata is available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      if (videoWidth && videoHeight) {
        setVideoResolution(videoWidth === 3840 ? '4k' : videoWidth === 1920 ? '1080p' : videoWidth === 1280 ? '720p' : videoWidth === 854 ? '480p' : videoWidth === 640 ? '360p' : `${videoWidth}p`);
      }
    };

    video.addEventListener('canplay', handleCanPlay);
    return () => video.removeEventListener('canplay', handleCanPlay);
  }, [videoRef]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTitleClick = () => {
    if (snap.currentFile) {
      window.electronAPI.openFileInExplorer(snap.currentFile);
    }
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

  useEffect(() => {
    // Update volume bar color
    const volumeBar = volumeBarRef.current;
    if (volumeBar) {
      const volume = snap.isMuted ? 0 : snap.volume;
      const percentage = (volume * 100) + '%';
      volumeBar.style.setProperty('--volume-progress', percentage);
    }
  }, [snap.isMuted, snap.volume, showControls]);

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

  // Mark file as viewed when it ends
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (snap.currentFile) {
        videoActions.markFileAsViewed(snap.currentFile);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [snap.currentFile]);

  return (
    <AnimatePresence>
      {showControls && (
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
              onChange={onSeekBarChange}
              tabIndex={-1}
            />
          </div>

          <div className="controls-row">
            <div className="left-controls">
              <button
                onClick={() => videoActions.togglePlay()}
                className="control-button"
                tabIndex={-1}
              >
                {snap.isPlaying ? <FaPause /> : <FaPlay />}
              </button>

              <div className="volume-control">
                <button
                  onClick={() => videoActions.toggleMute()}
                  className="control-button"
                  tabIndex={-1}
                >
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
                  onChange={onVolumeBarChange}
                  tabIndex={-1}
                />
              </div>

              <div className="time-display">
                {formatTime(snap.currentTime)} / {formatTime(snap.duration)}
              </div>

              {snap.currentFile && (
                <div
                  className="video-title"
                  title={getFullPath()}
                  onClick={handleTitleClick}
                  style={{ cursor: 'pointer' }}
                  tabIndex={-1}
                >
                  {getDisplayTitle()}
                </div>
              )}

              {videoResolution && (
                <div className="resolution-badge">
                  {videoResolution}
                </div>
              )}

              <button
                onClick={() => videoActions.toggleLoop()}
                className={`control-button ${!snap.isLooping ? 'inactive' : ''}`}
                tabIndex={-1}
              >
                <FaRedo />
              </button>

              <button
                onClick={() => videoActions.togglePlaylist()}
                className={`control-button ${!snap.isPlaylistOpen ? 'inactive' : ''}`}
                tabIndex={-1}
                title="Toggle Playlist (P)"
              >
                <FaList />
              </button>
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
                  tabIndex={-1}
                >
                  <MdSubtitles />
                </button>
              )}

              <button onClick={onOpenFile} className="control-button" tabIndex={-1}><FaFolder /></button>
              <button onClick={() => videoActions.toggleSettings()} className="control-button" tabIndex={-1}><FaCog /></button>
              <button onClick={() => videoActions.toggleFullScreen()} className="control-button" tabIndex={-1}><FaExpand /></button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoControls;
