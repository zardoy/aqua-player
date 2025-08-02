import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useSnapshot } from 'valtio';
import { settingsState, settingsActions, getSettingsCategories } from '../store/settingsStore';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const snap = useSnapshot(settingsState);
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
          <h3>Settings</h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        <div className="settings-content">
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

          <div className="settings-footer">
            {snap.isDirty && <span className="unsaved-changes">Unsaved changes</span>}
            <button onClick={handleReset} className="reset-button">
              Reset to Defaults
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPanel;
