import React from 'react';

interface KeybindDisplayProps {
  keybind?: {
    code: string;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
  };
  className?: string;
}

const KeybindDisplay: React.FC<KeybindDisplayProps> = ({ keybind, className = '' }) => {
  if (!keybind) return null;

  const getKeyName = (code: string) => {
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Arrow')) return code.slice(5);
    if (code === 'Space') return 'Space';
    if (code === 'Equal') return '=';
    if (code === 'Minus') return '-';
    if (code === 'Period') return '.';
    if (code === 'Comma') return ',';
    if (code === 'Slash') return '/';
    return code;
  };

  const modifiers = [];
  if (keybind.ctrlKey) modifiers.push('Ctrl');
  if (keybind.metaKey) modifiers.push('Cmd');
  if (keybind.altKey) modifiers.push('Alt');
  if (keybind.shiftKey) modifiers.push('Shift');

  const keys = [...modifiers, getKeyName(keybind.code)];

  return (
    <div className={`keybind-display ${className}`}>
      {keys.map((key, index) => (
        <span key={index} className="keybind-key">
          {key}
        </span>
      ))}
    </div>
  );
};

export default KeybindDisplay;
