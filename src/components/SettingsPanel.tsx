import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useSnapshot } from 'valtio';
import { videoState, videoActions } from '../store/videoStore';

type SettingsPanelProps = {
  onClose: () => void;
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const snap = useSnapshot(videoState);

  return (
    <motion.div
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="settings-panel"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
      <div className="settings-header">
        <h3>Settings</h3>
        <button onClick={onClose} className="close-button"><FaTimes /></button>
      </div>

            <div className="settings-content">

        {/* Audio Tracks */}
        {snap.audioTracks.length > 0 && (
          <div className="settings-section">
            <h4>Audio</h4>
            <div className="track-list">
              {snap.audioTracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => videoActions.selectAudioTrack(index)}
                  className={snap.currentAudioTrack === index ? 'active' : ''}
                >
                  {track.label || `Audio ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subtitle Tracks */}
        {snap.subtitleTracks.length > 0 && (
          <div className="settings-section">
            <h4>Subtitles</h4>
            <div className="track-list">
              <button
                onClick={() => videoActions.selectSubtitleTrack(-1)}
                className={snap.currentSubtitleTrack === -1 ? 'active' : ''}
              >
                Off
              </button>
              {snap.subtitleTracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => videoActions.selectSubtitleTrack(index)}
                  className={snap.currentSubtitleTrack === index ? 'active' : ''}
                >
                  {track.label || `Subtitle ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AirPlay */}
        {snap.airPlayAvailable && (
          <div className="settings-section">
            <h4>AirPlay</h4>
            <button
              onClick={async () => {
                await videoActions.getAirPlayDevices();
              }}
              className="refresh-button"
            >
              Refresh Devices
            </button>
            <div className="device-list">
              {snap.airPlayDevices.length === 0 ? (
                <p>No devices found</p>
              ) : (
                snap.airPlayDevices.map(device => (
                  <button
                    key={device}
                    onClick={() => videoActions.startAirPlay(device)}
                    className={snap.currentAirPlayDevice === device ? 'active' : ''}
                  >
                    {device}
                  </button>
                ))
              )}
            </div>
            {snap.isAirPlaying && (
              <button onClick={() => videoActions.stopAirPlay()} className="stop-button">
                Stop AirPlay
              </button>
            )}
          </div>
        )}

        {/* Remote Playback */}
        <div className="settings-section">
          <h4>Remote Playback</h4>
          {!snap.isRemoteServerRunning ? (
            <button onClick={() => videoActions.startRemoteServer()} className="start-button">
              Start Remote Server
            </button>
          ) : (
            <>
              <div className="remote-url">
                <p>Access your video at:</p>
                <code>{snap.remotePlaybackUrl}</code>
              </div>
              <button onClick={() => videoActions.stopRemoteServer()} className="stop-button">
                Stop Remote Server
              </button>
            </>
          )}
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPanel;
