import { commands, defaultKeymap, runCommand } from '../commands';
import { showArgumentInputDialog } from '../components/ArgumentInputService';
import { electronMethods } from '../ipcRenderer';

export interface KeymapAction {
  code: AllKeyCodes;
  description: string;
  action: (args?: any[]) => void;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  args?: any[]; // BaseArg[] from commands
}

// Export the keymap from commands.ts
export { defaultKeymap };

export const FOCUSABLE_SELECTOR = 'input:not([type="range"]):not([type="slider"]), textarea, select, [contenteditable="true"]';

export function setupKeymap() {
  const handleKeyDown = async (e: KeyboardEvent) => {
    // Ignore if any input element is focused
    if (document.activeElement?.matches(FOCUSABLE_SELECTOR)) {
      return;
    }

    for (const keyAction of defaultKeymap) {
      if (e.code === keyAction.code &&
          ((keyAction.shiftKey ?? false) === e.shiftKey) &&
          ((keyAction.ctrlKey ?? false) == e.ctrlKey) &&
          ((keyAction.metaKey ?? false) == e.metaKey) &&
          ((keyAction.altKey ?? false) == e.altKey)) {
        e.preventDefault();

         // Check if command needs arguments
        if (keyAction.args && keyAction.args.length > 0) {
          // Find the command by description to get the full command info
          const commandEntry = Object.entries(commands).find(([_, cmd]) => cmd.name === keyAction.description);
          if (commandEntry) {
            const [commandId, command] = commandEntry;
            showArgumentInputDialog({
              args: command.args || [],
              commandName: command.name || commandId,
              onConfirm: (args) => {
                runCommand[commandId](args);
              },
              onCancel: () => {
                // Command cancelled
              }
            });
          } else {
            // Fallback: execute without args
            keyAction.action();
          }
        } else {
          // Execute the command action directly
          keyAction.action();
        }
        break;
      }
    }
  };

  // on focus element, remove focus
  const handleFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (!target.matches(FOCUSABLE_SELECTOR)) {
      target.blur();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('focusin', handleFocus);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('focusin', handleFocus);
  };
}

setupKeymap();

type SingleNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type DigitKeys = `Digit${SingleNumber}`

export type Fnumbers = Exclude<SingleNumber, 0> | 10 | 11 | 12

export type ModifierOnlyKeys = `${'Meta' | 'Control' | 'Alt' | 'Shift'}${'' | 'Left' | 'Right'}`

export type OtherKeys =
  | 'Space'
  | 'Esc'
  | 'Tab'
  | 'Enter'
  | 'Equal'
  | 'Minus'
  | 'Backslash'
  | 'Slash'
  | 'Period'
  | 'Comma'
  | 'Capslock'
  | 'Numlock'
  | 'PrintScreen'
  | 'Scrolllock'
  | 'Pause'
  | 'Backspace'
  | 'Delete'
  | 'Insert'
  | 'Backquote'
  | 'BracketLeft'
  | 'BracketRight'
  | `Arrow${'Up' | 'Down' | 'Left' | 'Right'}`
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'

export type NumpadKeys = `Numpad${SingleNumber}` | `Numpad${'Divide' | 'Multiply' | 'Subtract' | 'Add' | 'Enter' | 'Decimal'}`

type LetterKey = `Key${Capitalize<
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
>}`

type MouseSideKeys = `Mouse${0 | 1 | 2 | 3 | 4}`

type AllKeyCodesWithoutModifiers = `${DigitKeys}` | LetterKey | `F${Fnumbers}` | NumpadKeys | OtherKeys | MouseSideKeys
export type AllKeyCodes = `${ModifierOnlyKeys}` | AllKeyCodesWithoutModifiers | `${ModifierOnlyKeys}+${AllKeyCodesWithoutModifiers}`

export type AllKeyCodesWithModifiers = `${AllKeyCodes}` | `${ModifierOnlyKeys}+${AllKeyCodesWithoutModifiers}`
