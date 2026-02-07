import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { commands, commandsList, runCommand, Command, CommandArrayItem, BaseArg } from '../commands';
import KeybindDisplay from './KeybindDisplay';
import './CommandPalette.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandPaletteState {
  recentCommands: string[];
}

// Simple state for command usage tracking
const commandPaletteState: CommandPaletteState = {
  recentCommands: JSON.parse(localStorage.getItem('aqua-player-recent-commands') || '[]')
};

const saveRecentCommands = () => {
  localStorage.setItem('aqua-player-recent-commands', JSON.stringify(commandPaletteState.recentCommands));
};

const addRecentCommand = (commandId: string) => {
  const recent = commandPaletteState.recentCommands.filter(id => id !== commandId);
  recent.unshift(commandId);
  commandPaletteState.recentCommands = recent.slice(0, 10); // Keep only 10 recent commands
  saveRecentCommands();
};

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter and sort commands
  const filteredCommands = React.useMemo(() => {
    let filtered = commandsList;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = commandsList.filter(command =>
        command.name.toLowerCase().includes(search) ||
        command.description.toLowerCase().includes(search) ||
        command.category.toLowerCase().includes(search)
      );
    }

    // Sort by recent usage, then alphabetically
    return filtered.sort((a, b) => {
      const aRecentIndex = commandPaletteState.recentCommands.indexOf(a.id);
      const bRecentIndex = commandPaletteState.recentCommands.indexOf(b.id);

      if (aRecentIndex !== -1 && bRecentIndex !== -1) {
        return aRecentIndex - bRecentIndex;
      }
      if (aRecentIndex !== -1) return -1;
      if (bRecentIndex !== -1) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [searchTerm]);

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear search input and reset selection when reopened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      // ensure input gets focus after clearing
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  const scrollSelectedIntoView = (index: number) => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[index] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'instant'
        });
      }
    }
  };

  const executeCommand = (command: CommandArrayItem) => {
    try {
      command.action();
      addRecentCommand(command.id);
      onClose();
    } catch (error) {
      console.error('Error executing command:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown': {
        e.preventDefault();
          const newDownIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
          setSelectedIndex(newDownIndex);
          scrollSelectedIntoView(newDownIndex);
          break;
        }
        break;
      case 'ArrowUp': {
        e.preventDefault();
          const newUpIndex = Math.max(selectedIndex - 1, 0);
          setSelectedIndex(newUpIndex);
          scrollSelectedIntoView(newUpIndex);
          break;
        }
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="command-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="command-palette"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <input
              ref={inputRef}
              type="text"
              className="command-palette-input"
              placeholder="Type a command or search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="command-palette-results" ref={resultsRef}>
              {filteredCommands.length === 0 ? (
                <div className="command-palette-empty">
                  No commands found matching "{searchTerm}"
                </div>
              ) : (
                filteredCommands.map((command, index) => (
                  <div
                    key={command.id}
                    className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeCommand(command)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="command-info">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="command-category">{command.category}</span>
                        <span className="command-name">{command.name}</span>
                      </div>
                      <div className="command-description">{command.description}</div>
                    </div>
                    <KeybindDisplay keybind={command.keybind || undefined} />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Simple argument input dialog component
interface ArgumentInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (args: any[]) => void;
  args: BaseArg[];
  commandName: string;
}

const ArgumentInputDialog: React.FC<ArgumentInputDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  args,
  commandName
}) => {
  const [values, setValues] = useState<string[]>(args.map(arg => arg.defaultValue?.toString() || ''));
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Clear error for this field
    const newErrors = [...errors];
    newErrors[index] = '';
    setErrors(newErrors);
  };

  const handleConfirm = () => {
    const validatedArgs: any[] = [];
    const newErrors: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const value = values[i];

      if (arg.required && !value.trim()) {
        newErrors[i] = `${arg.name} is required`;
        continue;
      }

      try {
        if (value.trim() || arg.required) {
          const validatedValue = arg.validate(value);
          validatedArgs.push(validatedValue);
        } else {
          validatedArgs.push(arg.defaultValue);
        }
      } catch (error) {
        newErrors[i] = error.message;
      }
    }

    if (newErrors.some(error => error)) {
      setErrors(newErrors);
      return;
    }

    onConfirm(validatedArgs);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="command-palette-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="command-palette"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="command-palette-header">
          <h3>Enter Arguments for: {commandName}</h3>
        </div>

        <div className="command-palette-args">
          {args.map((arg, index) => (
            <div key={index} className="arg-input-group">
              <label className="arg-label">
                {arg.name}
                {arg.required && <span className="required">*</span>}
                <span className="arg-description">({arg.description})</span>
              </label>
              <input
                type="text"
                className={`arg-input ${errors[index] ? 'error' : ''}`}
                placeholder={arg.getPromptText()}
                value={values[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus={index === 0}
              />
              {errors[index] && <div className="arg-error">{errors[index]}</div>}
            </div>
          ))}
        </div>

        <div className="command-palette-actions">
          <button className="command-palette-button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="command-palette-button primary" onClick={handleConfirm}>
            Execute
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommandPalette;
