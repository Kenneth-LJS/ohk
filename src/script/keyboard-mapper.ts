import { OhkKey } from './types/ohk';

export default class KeyboardMapper {
    keyMap: { [keyCode: string]: OhkKey | undefined }

    constructor(inputKeyMap: { [key in OhkKey]: string | undefined }) {
        this.keyMap = {};
        Object.keys(inputKeyMap).forEach(key => {
            const keycode = inputKeyMap[key];
            if (typeof keycode == 'undefined') {
                return;
            }
            this.keyMap[keycode] = key as OhkKey;
        })
    }

    public getOneHandKeyboardKey(event: KeyboardEvent): OhkKey | undefined {
        if (!event.isTrusted) {
            return undefined;
        } else if (!this.keyMap.hasOwnProperty(event.code)) {
            return undefined;
        }
        return this.keyMap[event.code];
    }
}
