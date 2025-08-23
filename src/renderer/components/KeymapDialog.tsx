import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { defaultKeymap } from '../client/appKeymap';
import Modal from './base/Modal';

interface KeymapDialogProps {
  onClose: () => void;
}

const KeymapDialog: React.FC<KeymapDialogProps> = ({ onClose }) => {
  const formatKey = (keyAction: typeof defaultKeymap[0]) => {
    const parts = [];
    if (keyAction.metaKey) parts.push('⌘');
    if (keyAction.ctrlKey) parts.push('Ctrl');
    if (keyAction.altKey) parts.push('Alt');
    if (keyAction.shiftKey) parts.push('Shift');

    const mainKey = keyAction.code
      .replace('Key', '')
      .replace('Digit', '')
      .replace('Arrow', 'Arrow ');

    parts.push(mainKey);
    return parts.join(' + ');
  };

  return (
    <Modal title="Keyboard Shortcuts" onClose={onClose}>
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
    </Modal>
  );
};

export default KeymapDialog;
