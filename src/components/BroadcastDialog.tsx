import React from 'react';
import { motion } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { videoState, videoActions } from '../store/videoStore';
import { FaTimes } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';

type BroadcastDialogProps = {
  onClose: () => void;
};

const BroadcastDialog: React.FC<BroadcastDialogProps> = ({ onClose }) => {
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
        className="settings-panel broadcast-panel"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h3>Broadcast</h3>
          <button onClick={onClose} className="close-button"><FaTimes /></button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <div className="section-header">
              <h4>Available Devices</h4>
              <button
                onClick={() => videoActions.scanBroadcastDevices()}
                className="refresh-button"
                disabled={snap.isScanningDevices}
              >
                <MdRefresh className={snap.isScanningDevices ? 'spinning' : ''} />
              </button>
            </div>

            <div className="device-list">
              {snap.broadcastDevices.length === 0 ? (
                <p className="no-devices">
                  {snap.isScanningDevices ? 'Scanning...' : 'No devices found'}
                </p>
              ) : (
                snap.broadcastDevices.map(device => (
                  <button
                    key={device}
                    onClick={() => {
                      videoActions.startBroadcast(device);
                      onClose();
                    }}
                    className={snap.currentBroadcastDevice === device ? 'active' : ''}
                  >
                    {device}
                  </button>
                ))
              )}
            </div>
          </div>

          {snap.isBroadcasting && (
            <div className="settings-section">
              <button
                onClick={() => {
                  videoActions.stopBroadcast();
                  onClose();
                }}
                className="stop-button"
              >
                Stop Broadcasting
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BroadcastDialog;
