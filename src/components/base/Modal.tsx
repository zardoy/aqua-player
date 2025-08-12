import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, showCloseButton = true }) => {
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h3>{title}</h3>
          {showCloseButton && (
            <button onClick={onClose} className="close-button" aria-label="Close dialog">
              <FaTimes />
            </button>
          )}
        </div>
        <div className="settings-content">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Modal;
