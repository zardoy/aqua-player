import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { videoState, videoActions } from '../store/videoStore';
import { FaTimes, FaCheck, FaCheckDouble } from 'react-icons/fa';

const FileHistoryPanel: React.FC = () => {
  const snap = useSnapshot(videoState);

  const getFileName = (path: string) => {
    // Handle both Windows and Unix paths
    const normalized = path.replace(/\\/g, '/');
    return normalized.split('/').pop() || path;
  };

  return (
    <AnimatePresence>
      {snap.isHistoryOpen && (
        <motion.div
          className={`playlist-sidebar ${window.electronAPI.platform === 'win32' ? 'windows' : ''}`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="playlist-header">
            <h3>File History</h3>
            <button
              onClick={() => videoActions.toggleHistory()}
              className="close-button"
            >
              <FaTimes />
            </button>
          </div>
          <div className="playlist-content">
            {snap.fileHistory.map((file, index) => (
              <div
                key={`${file}-${index}`}
                className={`playlist-item ${file === snap.currentFile ? 'active' : ''}`}
                onClick={() => videoActions.loadFilePath(file)}
              >
                <span className="file-name">{getFileName(file)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {snap.openedFiles.has(file) && (
                    <FaCheck className="viewed-icon" style={{ color: '#4CAF50' }} />
                  )}
                  {snap.viewedFiles.has(file) && (
                    <FaCheckDouble className="viewed-icon" style={{ color: '#4CAF50' }} />
                  )}
                </div>
              </div>
            ))}
            {snap.fileHistory.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                No files in history
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileHistoryPanel;
