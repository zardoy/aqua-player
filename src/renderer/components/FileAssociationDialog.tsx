import React from 'react';
import Modal from './base/Modal';

interface FileAssociationDialogProps {
  onClose: () => void;
}

const FileAssociationDialog: React.FC<FileAssociationDialogProps> = ({ onClose }) => {
  return (
    <Modal title="File Association Setup" onClose={onClose}>
      <div style={{ maxWidth: '600px', lineHeight: '1.6' }}>
        <p>
          Aqua Player has been registered as a video player on your system. You can now:
        </p>

        <ul style={{ marginTop: '16px', marginBottom: '16px' }}>
          <li>Double-click video files to open them in Aqua Player</li>
          <li>Right-click video files and select "Open with" → "Aqua Player"</li>
          <li>Drag and drop files onto the Aqua Player window</li>
        </ul>

        <p>
          Supported video formats: MP4, MKV, AVI, MOV, WebM
        </p>

        <div style={{ marginTop: '20px' }}>
          <h4>Features</h4>
          <ul>
            <li>Thumbnail previews in file explorer</li>
            <li>Jump list support in taskbar</li>
            <li>Recent files integration</li>
            <li>Drag & drop support</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default FileAssociationDialog;
