import KeyboardMapper from './keyboard-mapper';
import OneHandKeyboard from './one-hand-keyboard';
import OhkLogger from './ohk-logger';
import { OhkLog, OhkEvent, OhkType, OhkEmittedKey } from './types/ohk';
import TextInterfaceManager, { sendKeyboardEventToTextInput } from './text-interface-manager';

export default class KeyboardManager {
    keyboardMapper: KeyboardMapper;
    oneHandKeyboard: OneHandKeyboard;
    ohkLogger: OhkLogger;
    textInterfaceManager: TextInterfaceManager;

    constructor() {
        const interceptKeyboardEvent = (event: KeyboardEvent) => {
            // if (event.type === 'keydown') {
            //     event.preventDefault();
            //     const untrustedEvent = new KeyboardEvent(event.type, event);
            //     sendKeyboardEventToTextInput(untrustedEvent);
            // }
            
            // if (event.type == 'keydown') {
            //     console.log('key', event.key, 'code', event.code, 'chr', event.key.charCodeAt(0));
            // }

            const oneHandKeyboardKey = this.keyboardMapper.getOneHandKeyboardKey(event);
            if (typeof oneHandKeyboardKey === 'undefined') {
                return;
            }
            const eventType = event.type as OhkType;
            const oneHandKeyboardEvent = {
                type: eventType,
                key: oneHandKeyboardKey,
            } as OhkEvent;
            const result = this.oneHandKeyboard.handleKeyEvent(oneHandKeyboardEvent);
            if (!result) {
                return;
            }
            event.preventDefault();
        }

        const keyboardEmitLogCallback = (ohkLog: OhkLog) => {
            this.ohkLogger.handleOhkLog(ohkLog);
        };

        const keyboardEmitKeyCallback = (event: OhkEmittedKey) => {
            this.textInterfaceManager.dispatchKeyboardEvent(event);
        };

        this.keyboardMapper = new KeyboardMapper(keymap);
        this.oneHandKeyboard = new OneHandKeyboard(keyboardEmitLogCallback, keyboardEmitKeyCallback);
        this.ohkLogger = new OhkLogger();
        this.textInterfaceManager = new TextInterfaceManager(interceptKeyboardEvent);
    }
}

const keymap = {
    'KEY-1': 'Numpad7',
    'KEY-2': 'Numpad8',
    'KEY-3': 'Numpad9',
    'KEY-4': 'Numpad4',
    'KEY-5': 'Numpad5',
    'KEY-6': 'Numpad6',
    'KEY-7': 'Numpad1',
    'KEY-8': 'Numpad2',
    'KEY-9': 'Numpad3',
    'KEY-MODIFIER': 'Numpad0',
    'KEY-FORWARD-TAB': 'NumpadDivide',
    'KEY-BACKWARD-TAB': 'NumpadMultiply',
};

// function creat

const emitKeyMap = {
    'a': 0
};