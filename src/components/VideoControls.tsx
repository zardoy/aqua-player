import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaExpand, FaFolder, FaCog } from 'react-icons/fa';
import { MdSubtitles, MdCast } from 'react-icons/md';
import { videoState, videoActions } from '../store/videoStore';
import { settingsState } from '../store/settingsStore';
import BroadcastDialog from './BroadcastDialog';

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
  const settings = useSnapshot(settingsState);
  const [videoResolution, setVideoResolution] = useState<string>('');
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);

  // Update video resolution when video metadata is available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      if (videoWidth && videoHeight) {
        setVideoResolution(`${videoHeight}p`);
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

    // Handle both forward and backward slashes
    const fileName = snap.currentFile.split(/[/\\]/).slice(-1)[0] || '';
    return fileName.replace(/\.[^/.]+$/, ''); // Remove file extension
  };

  const getFullPath = () => {
    if (!snap.currentFile) return '';

    // Normalize path separators for display
    return snap.currentFile.replace(/\\/g, '/');
  };

  return (
    <>
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
                onChange={onSeekBarChange}
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
                    onChange={onVolumeBarChange}
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
                  >
                    {getDisplayTitle()}
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

                {settings.broadcast.enabled && (
                  <button
                    onClick={() => {
                      if (snap.isBroadcasting) {
                        videoActions.stopBroadcast();
                      } else {
                        videoActions.scanBroadcastDevices();
                        setShowBroadcastDialog(true);
                      }
                    }}
                    className={`control-button ${snap.isBroadcasting ? 'active' : ''}`}
                    title={snap.isBroadcasting ? `Broadcasting to ${snap.currentBroadcastDevice}` : 'Start broadcast'}
                  >
                    <MdCast />
                  </button>
                )}

                <button onClick={onOpenFile} className="control-button"><FaFolder /></button>
                <button onClick={() => videoActions.toggleSettings()} className="control-button"><FaCog /></button>
                <button onClick={() => videoActions.toggleFullScreen()} className="control-button"><FaExpand /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBroadcastDialog && (
          <BroadcastDialog onClose={() => setShowBroadcastDialog(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoControls;
