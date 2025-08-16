import React from 'react';
import Modal from './base/Modal';

interface FileAssociationDialogProps {
  onClose: () => void;
}

const FileAssociationDialog: React.FC<FileAssociationDialogProps> = ({ onClose }) => {
  const handleOpenDefaultAppsSettings = async () => {
    try {
      const opened = await window.electronAPI.openDefaultAppsSettings();
      if (opened) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to open default apps settings:', error);
    }
  };

  const registryInfo = `
[HKEY_CURRENT_USER\\Software\\Classes\\Applications\\aqua-player.exe\\shell\\open\\command]
@="\\"C:\\\\Path\\\\To\\\\Your\\\\Aqua Player.exe\\" \\"%1\\""

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.mp4\\OpenWithList]
"aqua-player.exe"=""

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.mkv\\OpenWithList]
"aqua-player.exe"=""

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.avi\\OpenWithList]
"aqua-player.exe"=""

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.mov\\OpenWithList]
"aqua-player.exe"=""

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.webm\\OpenWithList]
"aqua-player.exe"=""
`.trim();

  return (
    <Modal title="File Association Setup" onClose={onClose}>
      <div style={{ maxWidth: '600px', lineHeight: '1.6' }}>
        <p>
          To register Aqua Player as a default video player in Windows, you have a few options:
        </p>

        <div style={{ marginBottom: '20px' }}>
          <h4>Option 1: Windows Settings (Recommended)</h4>
          <p>
            The easiest way is to use Windows built-in settings. Click the button below to open
            the Default Apps settings where you can set Aqua Player as the default for video files.
          </p>
          <button
            onClick={handleOpenDefaultAppsSettings}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007ACC',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            Open Default Apps Settings
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4>Option 2: Right-click Context Menu</h4>
          <p>
            Right-click on any video file → "Open with" → "Choose another app" →
            Browse for Aqua Player.exe and check "Always use this app".
          </p>
        </div>

        <div>
          <h4>Option 3: Registry Editing (Advanced)</h4>
          <p>
            For advanced users, you can manually edit the Windows registry.
            Save the following as a .reg file and run it (update the path accordingly):
          </p>
          <textarea
            readOnly
            value={registryInfo}
            style={{
              width: '100%',
              height: '200px',
              fontFamily: 'Courier New, monospace',
              fontSize: '12px',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              border: '1px solid #464647',
              padding: '8px',
              marginTop: '8px'
            }}
          />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
            ⚠️ Warning: Editing the registry can be dangerous. Make sure to backup your registry first.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Additional Registry Benefits</h4>
          <p>By registering properly in Windows registry, you can also enable:</p>
          <ul>
            <li>Thumbnail previews in Windows Explorer</li>
            <li>File properties integration</li>
            <li>Jump list support in taskbar</li>
            <li>Recent files integration</li>
            <li>Better shell integration for drag & drop</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default FileAssociationDialog;
