import { defaultKeymap } from '../commands';

export interface KeymapAction {
  code: AllKeyCodesWithoutModifiers;
  description: string;
  action: () => void;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

// Export the keymap from commands.ts
export { defaultKeymap };

const FOCUSABLE = 'input:not([type="range"]):not([type="slider"]), textarea, select, [contenteditable="true"]';
export function setupKeymap() {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if any input element is focused
    if (document.activeElement?.matches(FOCUSABLE)) {
      return;
    }

    for (const keyAction of defaultKeymap) {
      if (e.code === keyAction.code &&
          ((keyAction.shiftKey ?? false) === e.shiftKey) &&
          ((keyAction.ctrlKey ?? false) == e.ctrlKey) &&
          ((keyAction.metaKey ?? false) == e.metaKey) &&
          ((keyAction.altKey ?? false) == e.altKey)) {
        e.preventDefault();
        keyAction.action();
        break;
      }
    }
  };

  // on focus element, remove focus
  const handleFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (!target.matches(FOCUSABLE)) {
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
