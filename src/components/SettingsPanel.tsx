import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useSnapshot } from 'valtio';
import { settingsState, settingsActions, getSettingsCategories } from '../store/settingsStore';
import { videoState } from '../store/videoStore';
import Modal from './base/Modal';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const snap = useSnapshot(settingsState);
  const videoSnap = useSnapshot(videoState);
  const categories = getSettingsCategories();

  const handleSettingChange = (key: string, value: any) => {
    settingsActions.updateSetting(key as any, value);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      settingsActions.resetSettings();
    }
  };

  return (
    <Modal title="Settings" onClose={onClose}>
      {/* Status Section */}
      <div className="settings-section">
        <h4>Current Status</h4>
        <div className="settings-row">
          <span>Zoom Level:</span>
          <span className="status-value">
            {Math.round(videoSnap.zoomLevel * 100)}%
            {videoSnap.zoomLevel !== 1 && (
              <button 
                onClick={() => videoSnap.zoomLevel !== 1 && require('../store/videoStore').videoActions.resetZoom()}
                className="reset-zoom-btn"
                style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '11px' }}
              >
                Reset
              </button>
            )}
          </span>
        </div>
        <div className="settings-row">
          <span>Position Saving:</span>
          <span className="status-value">
            {snap.player__savePosition ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="settings-row">
          <span>Zoom Enabled:</span>
          <span className="status-value">
            {snap.controls__zoomEnabled ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Settings Categories */}
      {categories.map(category => (
            <div key={category.name} className="settings-section">
              <h4>{category.name}</h4>
              {category.settings.map(setting => (
                <div key={setting.key} className="settings-row">
                  <span title={setting.tip}>{setting.label}</span>
                  {setting.type === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={snap[setting.key] as boolean}
                      onChange={e => handleSettingChange(setting.key, e.target.checked)}
                    />
                  ) : setting.type === 'select' && setting.choices ? (
                    <select
                      value={snap[setting.key] as string}
                      onChange={e => handleSettingChange(setting.key, e.target.value)}
                    >
                      {setting.choices.map(choice => (
                        <option key={choice} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={snap[setting.key] as string}
                      onChange={e => handleSettingChange(setting.key, e.target.value)}
                    />
                  )}
                  {setting.requiresRestart && (
                    <span className="restart-required">Requires restart</span>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div className="settings-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="app-version">{process.env.APP_VERSION || ''}</span>
            <div>
              {snap.isDirty && <span className="unsaved-changes" style={{ marginRight: 12 }}>Unsaved changes</span>}
              <button onClick={handleReset} className="reset-button">
                Reset to Defaults
              </button>
            </div>
          </div>
    </Modal>
  );
};

export default SettingsPanel;
