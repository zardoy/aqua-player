import { videoActions } from '../store/videoStore';

export interface KeymapAction {
  code: AllKeyCodesWithoutModifiers;
  description: string;
  action: () => void;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

export const defaultKeymap: KeymapAction[] = [
  { code: 'Space', description: 'Play/Pause', action: videoActions.togglePlay },
  { code: 'ArrowRight', description: 'Seek forward 10s', action: () => videoActions.seekForward(10) },
  { code: 'ArrowLeft', description: 'Seek backward 10s', action: () => videoActions.seekBackward(10) },
  { code: 'ArrowUp', description: 'Increase volume', action: () => videoActions.increaseVolume(0.1) },
  { code: 'ArrowDown', description: 'Decrease volume', action: () => videoActions.decreaseVolume(0.1) },
  { code: 'KeyM', description: 'Mute/Unmute', action: videoActions.toggleMute },
  { code: 'KeyF', description: 'Toggle fullscreen', action: videoActions.toggleFullScreen },
  { code: 'Period', description: 'Next frame', action: videoActions.nextFrame, shiftKey: true },
  { code: 'Comma', description: 'Previous frame', action: videoActions.previousFrame, shiftKey: true },
  { code: 'KeyV', description: 'Toggle subtitles', action: videoActions.toggleSubtitles },
  { code: 'KeyA', description: 'Next audio track', action: videoActions.nextAudioTrack },
  { code: 'KeyA', description: 'Previous audio track', action: videoActions.previousAudioTrack, shiftKey: true },
  { code: 'Slash', description: 'Show keymap', action: videoActions.toggleKeymapDialog, shiftKey: true },
  { code: 'Equal', description: 'Increase playback rate', action: videoActions.increasePlaybackRate },
  { code: 'Minus', description: 'Decrease playback rate', action: videoActions.decreasePlaybackRate },
  { code: 'Digit0', description: 'Reset playback rate', action: videoActions.resetPlaybackRate },
  { code: 'KeyO', description: 'Open file', action: videoActions.loadFile },
];

export function setupKeymap() {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if any input element is focused
    if (document.activeElement?.matches('input, textarea, select, [contenteditable="true"]')) {
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

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
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
