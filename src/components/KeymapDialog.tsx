import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useSnapshot } from 'valtio';
import { videoState, defaultKeymap } from '../store/videoStore';

type KeymapDialogProps = {
  onClose: () => void;
};

const KeymapDialog: React.FC<KeymapDialogProps> = ({ onClose }) => {
  const snap = useSnapshot(videoState);

  return (
    <motion.div 
      className="keymap-dialog"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="keymap-header">
        <h3>Keyboard Shortcuts</h3>
        <button onClick={onClose} className="close-button"><FaTimes /></button>
      </div>
      
      <div className="keymap-content">
        <table className="keymap-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {defaultKeymap.map((keymap, index) => (
              <tr key={index}>
                <td>
                  {keymap.ctrlKey && 'Ctrl+'}
                  {keymap.altKey && 'Alt+'}
                  {keymap.shiftKey && 'Shift+'}
                  {keymap.key === ' ' ? 'Space' : keymap.key}
                </td>
                <td>{keymap.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default KeymapDialog;