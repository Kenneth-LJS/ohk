export interface OhkLog {
    keyboard: {
        state: OhkState;
        keydownMap: OhkKeydownMap;
    };
}

export interface OhkEvent {
    type: OhkType;
    key: OhkKey;
}

export type OhkType = 'keydown' | 'keypress' | 'keyup';

export type OhkKey = 
'KEY-1' | 'KEY-2' | 'KEY-3' |
'KEY-4' | 'KEY-5' | 'KEY-6' |
'KEY-7' | 'KEY-8' | 'KEY-9' |
'KEY-MODIFIER' | 'KEY-FORWARD-TAB' | 'KEY-BACKWARD-TAB';

export const ALL_OHK_KEYS = [
    'KEY-1', 'KEY-2', 'KEY-3',
    'KEY-4', 'KEY-5', 'KEY-6',
    'KEY-7', 'KEY-8', 'KEY-9',
    'KEY-MODIFIER', 'KEY-FORWARD-TAB', 'KEY-BACKWARD-TAB'
];

export type OhkState =
    'none' |
    'panel-0' | 'panel-1' | 'panel-2' | 'panel-3' | 'panel-4' | 'panel-5' | 'panel-6' |
    `sending-${string}`;
export type OhkKeydownMap = { [key: string]: boolean };

export interface OhkEmittedKey {
    type: 'keydown' | 'keypress' | 'keyup';
    key: KeyboardEventInit;
}