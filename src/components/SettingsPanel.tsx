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
      className="settings-panel"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="settings-header">
        <h3>Settings</h3>
        <button onClick={onClose} className="close-button"><FaTimes /></button>
      </div>
      
      <div className="settings-content">
        {/* Playback Settings */}
        <div className="settings-section">
          <h4>Playback</h4>
          <div className="settings-row">
            <span>Speed:</span>
            <div className="speed-buttons">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                <button 
                  key={rate} 
                  onClick={() => videoActions.setPlaybackRate(rate)}
                  className={snap.playbackRate === rate ? 'active' : ''}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
        
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
  );
};

export default SettingsPanel;