import React, { useState } from 'react';
import { commandsList, type CommandArrayItem } from '../commands';
import Modal from './base/Modal';

interface KeybindingsDialogProps {
  onClose: () => void;
}

const KeybindingsDialog: React.FC<KeybindingsDialogProps> = ({ onClose }) => {
  // Group commands by category
  const groupedCommands = commandsList.reduce((acc, cmd) => {
    const category = cmd.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, CommandArrayItem[]>);

  const formatKeybind = (cmd: CommandArrayItem) => {
    if (!cmd.keybind) return 'Not bound';
    
    const parts = [];
    if (cmd.keybind.metaKey) parts.push('⌘');
    if (cmd.keybind.ctrlKey) parts.push('Ctrl');
    if (cmd.keybind.altKey) parts.push('Alt');
    if (cmd.keybind.shiftKey) parts.push('Shift');

    const mainKey = cmd.keybind.code
      .replace('Key', '')
      .replace('Digit', '')
      .replace('Arrow', 'Arrow ');

    parts.push(mainKey);
    return parts.join(' + ');
  };

  const categories = Object.keys(groupedCommands).sort();

  return (
    <Modal title="Keybindings Configuration" onClose={onClose}>
      <div className="keybindings-container">
        {categories.map(category => (
          <div key={category} className="keybinding-category">
            <h4 className="keybinding-category-title">{category}</h4>
            <div className="keybinding-list">
              {groupedCommands[category].map(cmd => (
                <div key={cmd.id} className="keybinding-item">
                  <div className="keybinding-info">
                    <div className="keybinding-name">{cmd.name}</div>
                    {cmd.description && (
                      <div className="keybinding-description">{cmd.description}</div>
                    )}
                  </div>
                  <div className="keybinding-key">
                    {formatKeybind(cmd)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default KeybindingsDialog;
