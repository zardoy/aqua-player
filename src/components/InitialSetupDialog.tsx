import React, { useState } from 'react';
import Modal from './base/Modal';
import { useSnapshot } from 'valtio';
import { settingsState, settingsActions } from '../store/settingsStore';

interface InitialSetupDialogProps {
  onClose: () => void;
}

const InitialSetupDialog: React.FC<InitialSetupDialogProps> = ({ onClose }) => {
  const settings = useSnapshot(settingsState);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(!!settings.app__autoUpdate);

  const handleContinue = () => {
    onClose();
    settingsActions.updateSetting('app__autoUpdate', autoUpdate);
    settingsActions.updateSetting('app__firstRun', false);
  };

  return (
    <Modal title="Welcome to Aqua Player" onClose={() => { handleContinue(); }}>
      <div style={{ maxWidth: '600px', lineHeight: '1.6' }}>
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
          <h4>File Associations</h4>
          <div className="settings-row">
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.app__enableFileAssociations}
                onChange={(e) => settingsActions.updateSetting('app__enableFileAssociations', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              <div>
                <div>Register as default video player</div>
                <div style={{ fontSize: '14px', color: '#888' }}>
                  Allows opening video files directly with Aqua Player
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={handleContinue}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007ACC',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InitialSetupDialog;
