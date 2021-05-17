import KEYS from './emit-keys';
import { OhkLog, OhkEvent, OhkKey, OhkType, OhkKeydownMap, OhkState, OhkEmittedKey, ALL_OHK_KEYS } from './types/ohk';

export default class Ohk {
    emitLogCallback: (log: OhkLog) => void;
    emitKeyCallback: (event: OhkEmittedKey) => void;

    keyboardState: OhkState;
    keydownMap: OhkKeydownMap;

    isNewLog: boolean;

    constructor(
        emitLogCallback: (log: OhkLog) => void,
        emitKeyCallback: (event: OhkEmittedKey) => void
    ) {
        this.emitLogCallback = emitLogCallback;
        this.emitKeyCallback = emitKeyCallback;

        this.keyboardState = DEFAULT_OHK_STATE;
        this.keydownMap = ALL_MODIFIER_OHK_KEYS.reduce((result, key) => {
            result[key] = false;
            return result;
        }, {} as OhkKeydownMap);

        this.isNewLog = false;
    }

    public handleKeyEvent(event: OhkEvent): boolean {
        if (!ALL_OHK_KEYS.includes(event.key)) {
            return false;
        }

        if (event.type == 'keydown'
            && ALL_MODIFIER_OHK_KEYS.includes(event.key)
            && this.keydownMap[event.key]
        ) {
            // ignore repeated keydown
            return;
        }

        // event.key != 'KEY-MODIFIER' && console.log('ohkevent', event);
        console.log('ohkevent', event);

        if (event.type == 'keydown') {
            this.keydownMap[event.key] = true;
        } else if (event.type == 'keyup') {
            this.keydownMap[event.key] = false;
        }

        const transition = STATE_TRANSITIONS.reduce((result, curTransition) => {
            if (!isUndefined(result)) {
                return result;
            }
            const isCondSatisfied = doesStateSatisfyCond(
                event,
                this.keyboardState,
                this.keydownMap,
                curTransition.cond
            );
            if (!isCondSatisfied) {
                return undefined;
            }
            return curTransition;
        }, undefined);

        if (transition) {
            console.log('transition', transition.id, transition.nextState);
        }

        if (isDefined(transition?.nextState)) {
            this.keyboardState = transition.nextState;
        }

        this.emitLogCallback({
            keyboard: {
                state: this.keyboardState,
                keydownMap: { ...this.keydownMap },
            },
        });

        if (isDefined(transition?.emitKey)) {
            if (isSingleObject(transition.emitKey)) {
                this.emitKeyCallback(transition.emitKey as OhkEmittedKey);
            } else {
                (transition.emitKey as OhkEmittedKey[]).forEach(emitKey => {
                    this.emitKeyCallback(emitKey);
                });
            }
        }

        return true;
    }
}

function doesStateSatisfyCond(
    event: OhkEvent,
    keyboardState: OhkState,
    keydownMap: OhkKeydownMap,
    cond?: StateTransitionCondition | StateTransitionCondition[]
) {
    if (isUndefined(cond)) {
        return true;
    }
    if (isArray(cond)) {
        return doesStateSatisfyCondsHelper(
            event,
            keyboardState,
            keydownMap,
            cond as StateTransitionCondition[]
        );
    } else {
        return doesStateSatisfyCondHelper(
            event,
            keyboardState,
            keydownMap,
            cond as StateTransitionCondition
        );
    }
}

function doesStateSatisfyCondHelper(
    event: OhkEvent,
    keyboardState: OhkState,
    keydownMap: OhkKeydownMap,
    cond: StateTransitionCondition
): boolean {
    if (isDefined(cond.state)) {
        const condStates = (isArray(cond.state) ? cond.state : [cond.state]) as OhkState[];
        const matchState = condStates.filter(condState => doesStateMatch(keyboardState, condState));
        if (matchState.length == 0) {
            return false;
        }
    }
    if (isDefined(cond.keydown)) {
        // cond.keydown is a key. Check if it's currently pressed
        if (typeof cond.keydown === 'string' && !keydownMap[cond.keydown]) {
            return false;
        }
        let isValid = true;
        Object.keys(cond.keydown).forEach(key => {
            if (cond.keydown[key] != keydownMap[key]) {
                isValid = false;
            }
        })
        if (!isValid) {
            return false;
        }
    }
    if (isDefined(cond.incoming)) {
        if (typeof cond.incoming === 'string') {
            if (event.type !== 'keydown' || event.key !== cond.incoming) {
                return false;
            }
        } else {
            const incoming = cond.incoming as { type?: OhkType, key?: OhkKey };
            if (isDefined(incoming.type) && incoming.type !== event.type) {
                return false;
            } else if (isDefined(incoming.key) && incoming.key !== event.key) {
                return false;
            }
        }
    }
    return true;
}

function doesStateSatisfyCondsHelper(
    event: OhkEvent,
    keyboardState: OhkState,
    keydownMap: OhkKeydownMap,
    cond: StateTransitionCondition[]
): boolean {
    // returns true if any one condition is satisfied
    return cond.reduce((result: boolean, subCond: StateTransitionCondition) => {
        return result || doesStateSatisfyCondHelper(
            event,
            keyboardState,
            keydownMap,
            subCond
        );
    }, false);
}

function doesStateMatch(keyboardState: OhkState, condState: OhkState) {
    if (keyboardState == condState) {
        return true;
    } else if (condState == 'sending-*' && keyboardState.startsWith('sending-')) {
        return true;
    }
    return false;
}

function buildStateTransition(): StateTransition[] {
    const stateTransitions = [] as StateTransition[];

    function makeSendKeyMapping(key: string, requiredKey: OhkKey, requiredPanel: number, isModified: boolean) {
        const keyboardEventInit = KEYS[key];
        // Keydown
        stateTransitions.push({
            id: `keydown-${key}`,
            cond: {
                state: [`panel-${requiredPanel}` as OhkState,, 'sending-*'],
                keydown: { 'KEY-MODIFIER': isModified },
                incoming: requiredKey,
            },
            nextState: `sending-${key}` as OhkState,
            emitKey: { type: 'keydown', key: keyboardEventInit },
        });
        // Key up
        (new Array(7)).fill(undefined).forEach((_, panelNumber) => {
            if (panelNumber != 0 && (
                (panelNumber === 1 || panelNumber === 2 || panelNumber === 3)
                != (requiredPanel === 1 || requiredPanel === 2 || requiredPanel === 3)
            )) { return; }
            stateTransitions.push({
                id: `keyup-${key}-panel-${panelNumber}`,
                cond: {
                    state: `sending-${key}` as OhkState,
                    keydown: {
                        'KEY-7': panelNumber === 1 || panelNumber === 4,
                        'KEY-8': panelNumber === 2 || panelNumber === 5,
                        'KEY-9': panelNumber === 3 || panelNumber === 6,
                    },
                    incoming: { type: 'keyup', key: requiredKey },
                },
                nextState: `panel-${panelNumber}` as OhkState,
                emitKey: { type: 'keyup', key: keyboardEventInit },
            });
        });
    }

    function makePanelKeyMapping(panelNumber: number, keys: string) {
        keys.split('').forEach((key, i) => {
            // Non-modified key
            makeSendKeyMapping(
                key,
                `KEY-${i + 1}` as OhkKey,
                panelNumber,
                false
            );
            // Modified key
            makeSendKeyMapping(
                MODIFIED_KEY_MAP[key],
                `KEY-${i + 1}` as OhkKey,
                panelNumber,
                true
            );
        });
    }

    makePanelKeyMapping(0, 'etaino');
    makePanelKeyMapping(1, 'hurdls');
    makePanelKeyMapping(2, 'cfmgbp');
    makePanelKeyMapping(3, ` ,.'";`);
    makePanelKeyMapping(4, 'vjqk .');
    makePanelKeyMapping(5, 'wxyz');

    function addTransitionPanel(panelNumber: number) {
        const stateCond = (new Array(7)).fill(0)
            .map((_, i) => i)
            .filter(j => j != panelNumber)
            .map(j => `panel-${j}`) as OhkState[];
        const incomingCond = `KEY-${7 + ((panelNumber - 1) % 3)}` as OhkKey;

        // Enter panel
        stateTransitions.push({
            id: `enter-panel-${panelNumber}`,
            cond: {
                state: stateCond,
                keydown: { 'KEY-MODIFIER': panelNumber > 3 },
                incoming: incomingCond,
            },
            nextState: `panel-${panelNumber}` as OhkState,
        });

        // Exit panel
        stateTransitions.push({
            id: `exit-panel-${panelNumber}`,
            cond: {
                state: `panel-${panelNumber}` as OhkState,
                keydown: { 'KEY-MODIFIER': panelNumber > 3 },
                incoming: incomingCond,
            },
            nextState: 'panel-0' as OhkState,
        });
    }

    for (let i = 1; i <= 6; i++) {
        addTransitionPanel(i);
    }

    return stateTransitions;
}

const MODIFIED_KEY_MAP = {
    a: 'A', b: 'B', c: 'C', d: 'D', e: 'E', f: 'F', g: 'G', h: 'H', i: 'I', j: 'J', k: 'K', l: 'L', m: 'M',
    n: 'N', o: 'O', p: 'P', q: 'Q', r: 'R', s: 'S', t: 'T', u: 'U', v: 'V', w: 'W', x: 'X', y: 'Y', z: 'Z',
    '0': ')', '1': '!', '2': '@', '3': '#', '4': '$',
    '5': '%', '6': '^', '7': '&', '8': '*', '9': '(',
    '-': '_', '=': '+', '`': '~', '[': '{', ']': '}', '\\': '|',
    ';': ':', "'": '"', ',': '<', '.': '>', '/': '?',
};

const STATE_TRANSITIONS = buildStateTransition();

const ALL_MODIFIER_OHK_KEYS = ['KEY-7', 'KEY-8', 'KEY-9', 'KEY-MODIFIER'];

const isArray = (obj: any) => Array.isArray(obj);
const isSingleObject = (obj: any) => !isArray(obj); // is non-array
const isUndefined = (obj: any) => typeof obj === 'undefined';
const isDefined = (obj: any) => !isUndefined(obj); // is not undefined

const DEFAULT_OHK_STATE = 'panel-0' as OhkState;

interface StateTransition {
    id?: string;
    cond?: StateTransitionCondition | StateTransitionCondition[];
    nextState?: OhkState;
    emitKey?: OhkEmittedKey | OhkEmittedKey[];
}

interface StateTransitionCondition {
    state?: OhkState | OhkState[];
    keydown?: OhkKey | OhkKeydownMap;
    incoming?: OhkKey | { type?: OhkType, key?: OhkKey };
}

