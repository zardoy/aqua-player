import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseArg } from '../commands';
import './ArgumentInputDialog.css';

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

  // Reset values when dialog opens
  useEffect(() => {
    if (isOpen) {
      setValues(args.map(arg => arg.defaultValue?.toString() || ''));
      setErrors([]);
    }
  }, [isOpen, args]);

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
    <AnimatePresence>
      <motion.div
        className="argument-dialog-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="argument-dialog"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="argument-dialog-header">
            <h3>Enter Arguments for: {commandName}</h3>
          </div>

          <div className="argument-dialog-args">
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

          <div className="argument-dialog-actions">
            <button className="argument-dialog-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="argument-dialog-button primary" onClick={handleConfirm}>
              Execute
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ArgumentInputDialog;
