import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useSnapshot } from 'valtio';
import { settingsState, settingsActions } from '../store/settingsStore';
import Modal from './base/Modal';

interface InitialSetupDialogProps {
  onClose: () => void;
}

const InitialSetupDialog: React.FC<InitialSetupDialogProps> = ({ onClose }) => {
  const snap = useSnapshot(settingsState);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(!!snap['updates.autoUpdate']);

  const handleContinue = () => {
    onClose();
    settingsActions.updateSetting('updates.autoUpdate' as any, autoUpdate as any);
    settingsActions.updateSetting('app.firstRun' as any, false as any);
  };

  const handleRegisterDefaults = () => {
    window.electronAPI.openDefaultAppsSettings();
  };

  return (
    <Modal title="Welcome to Aqua Player" onClose={() => { handleContinue(); }}>
          <div className="settings-section">
            <h4>Updates</h4>
            <div className="settings-row">
              <span>Enable auto-updates</span>
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={e => setAutoUpdate(e.target.checked)}
              />
            </div>
          </div>
          <div className="settings-section">
            <h4>Default app</h4>
            <p>
              Aqua Player can open video/audio files. We will not change your defaults unless you choose to.
            </p>
            <button onClick={handleRegisterDefaults}>Open system default apps settings</button>
          </div>
        <div className="settings-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleContinue} className="reset-button">Continue</button>
        </div>
    </Modal>
  );
};

export default InitialSetupDialog;
