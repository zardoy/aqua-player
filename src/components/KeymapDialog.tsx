import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { defaultKeymap } from '../client/appKeymap';

interface KeymapDialogProps {
  onClose: () => void;
}

const KeymapDialog: React.FC<KeymapDialogProps> = ({ onClose }) => {
  const formatKey = (keyAction: typeof defaultKeymap[0]) => {
    const parts = [];
    if (keyAction.metaKey) parts.push('⌘');
    if (keyAction.ctrlKey) parts.push('Ctrl');
    if (keyAction.altKey) parts.push('Alt');
    if (keyAction.shiftKey) parts.push('⇧');

    const mainKey = keyAction.code
      .replace('Key', '')
      .replace('Digit', '')
      .replace('Arrow', 'Arrow ');

    parts.push(mainKey);
    return parts.join(' + ');
  };

  return (
    <motion.div
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="settings-panel"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="settings-header">
          <h3>Keyboard Shortcuts</h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        <div className="settings-content">
          <table className="keymap-table">
            <thead>
              <tr>
                <th>Shortcut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {defaultKeymap.map((keyAction, index) => (
                <tr key={index}>
                  <td>{formatKey(keyAction)}</td>
                  <td>{keyAction.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default KeymapDialog;
