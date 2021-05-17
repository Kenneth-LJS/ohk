import { OhkEmittedKey } from "./types/ohk";

const textInputElem = document.querySelector('#textInput') as HTMLTextAreaElement;
let textInputSelectionDirection = 'forward' as 'forward' | 'backward';

export default class TextInterfaceManager {
    interceptKeyboardEvent: (event: KeyboardEvent) => void;

    constructor(interceptKeyboardEvent: (event: KeyboardEvent) => void) {
        document.body.addEventListener('keydown', (event: KeyboardEvent) => interceptKeyboardEvent(event));
        document.body.addEventListener('keypress', (event: KeyboardEvent) => interceptKeyboardEvent(event));
        document.body.addEventListener('keyup', (event: KeyboardEvent) => interceptKeyboardEvent(event));
    }

    public dispatchKeyboardEvent(event: OhkEmittedKey) {
        const keyboardEvent = new KeyboardEvent(event.type, event.key);
        sendKeyboardEventToTextInput(keyboardEvent);
    }
}

textInputElem.value = '';

export function sendKeyboardEventToTextInput(event: KeyboardEvent) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        handleArrowKeyOnInput(event);
        return;
    }

    if (event.key.length > 1) {
        return;
    }

    if (event.type == 'keyup') {
        return;
    }

    const startIndex = textInputElem.selectionStart;
    const endIndex = textInputElem.selectionEnd;
    const value = textInputElem.value;

    const leftText = value.substring(0, startIndex);
    const rightText = value.substring(endIndex);
    const newText = event.key;

    const newValue = leftText + event.key + rightText;

    textInputElem.value = newValue;
    textInputElem.selectionStart = startIndex + newText.length;
    textInputElem.selectionEnd = textInputElem.selectionStart;
}

function handleArrowKeyOnInput(event: KeyboardEvent) {
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
        if (event.shiftKey && textInputElem.selectionStart == textInputElem.selectionEnd) {
            textInputSelectionDirection = 'backward';
            textInputElem.selectionStart = Math.max(1, textInputElem.selectionStart - 1);
        } else if (event.shiftKey && textInputSelectionDirection == 'backward') {
            textInputElem.selectionStart = Math.max(1, textInputElem.selectionStart - 1);
        } else if (event.shiftKey && textInputSelectionDirection == 'forward') {
            textInputElem.selectionEnd -= 1;
        } else {
            textInputElem.selectionStart = Math.max(0, textInputElem.selectionStart - 1);
            textInputElem.selectionEnd = textInputElem.selectionStart;
        }
        return;
    } else if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
        if (event.shiftKey && textInputElem.selectionStart == textInputElem.selectionEnd) {
            textInputSelectionDirection = 'forward';
            textInputElem.selectionEnd += 1;
        } else if (event.shiftKey && textInputSelectionDirection == 'backward') {
            textInputElem.selectionStart += 1;
        } else if (event.shiftKey && textInputSelectionDirection == 'forward') {
            textInputElem.selectionEnd += 1;    
        } else {
            textInputElem.selectionEnd += 1
            textInputElem.selectionStart = textInputElem.selectionEnd;
        }
        return;
    }
}