import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { videoState, videoActions } from '../store/videoStore';
import { FaTimes, FaCheck } from 'react-icons/fa';

const PlaylistSidebar: React.FC = () => {
  const snap = useSnapshot(videoState);

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  return (
    <AnimatePresence>
      {snap.isPlaylistOpen && (
        <motion.div
          className="playlist-sidebar"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="playlist-header">
            <h3>Playlist</h3>
            <button
              onClick={() => videoActions.togglePlaylist()}
              className="close-button"
            >
              <FaTimes />
            </button>
          </div>
          <div className="playlist-content">
            {snap.playlistFiles.map((file, index) => (
              <div
                key={file}
                className={`playlist-item ${file === snap.currentFile ? 'active' : ''}`}
                onClick={() => videoActions.loadFilePath(file)}
              >
                <span className="file-name">{getFileName(file)}</span>
                {snap.viewedFiles.has(file) && (
                  <FaCheck className="viewed-icon" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaylistSidebar;
