import { OhkLog, OhkState } from "./types/ohk";

export default class OhkLogger {
    prevOhkState: OhkState

    constructor() {
        this.prevOhkState = 'none';
    }

    public handleOhkLog(ohkLog: OhkLog) {
        let isNewLog = false;
        if (this.prevOhkState == 'none') {
            isNewLog = true;
        } else if (this.prevOhkState.startsWith('sending-')
                && !ohkLog.keyboard.state.startsWith('sending-')) {
            isNewLog = true;
        }
        if (isNewLog) {
            this.addLog(ohkLog);
        } else {
            this.updateLastLog(ohkLog);
        }
        this.prevOhkState = ohkLog.keyboard.state;
    }

    private addLog(ohkLog: OhkLog) {
        const html = keyboardLogToHtml(ohkLog);
        addKeyboardLogItem(html);
    }

    private updateLastLog(ohkLog: OhkLog) {
        const html = keyboardLogToHtml(ohkLog);
        updateLastKeyboardLogItem(html);
    }

}

const panelNames = [
    ['Panel 0 [etaino]', 'Panel 0* [ETAINO]'],
    ['Panel 1 [hurdls]', 'Panel 1* [HURDLS]'],
    ['Panel 2 [cfmgbp]', 'Panel 2* [CFMGBP]'],
    ['Panel 3 [vkqj]', 'Panel 3* [VKQJ]'],
    ['Panel 4 [wxyz]', 'Panel 4* [WXYZ]'],
    ['Panel 5 [??????]', 'Panel 5* [??????]'],
    ['Panel 6 [??????]', 'Panel 6* [??????]'],
]

function keyboardLogToHtml(ohkLog: OhkLog): string {
    const { state, keydownMap } = ohkLog.keyboard;
    if (state.startsWith('sending-')) {
        const sendingKey = state.split('-').slice(1).join('-');
        return `Sending: ${sendingKey}`;
    } else if (state.startsWith('panel-')) {
        const panelNumber = parseInt(state.split('-')[1]);
        const isModifierDown = keydownMap['KEY-MODIFIER'];
        const panelName = panelNames[panelNumber][isModifierDown ? 1 : 0];
        return panelName;
    }
}

const keyboardLogItemsElem = document.querySelector('#keyboardLogItems') as HTMLElement;

async function addKeyboardLogItem(html: string) {
    // @ts-ignore
    const itemElem = document.querySelector('#keyboardLogItemTemplate').content.cloneNode(true).children[0];
    itemElem.querySelector('.keyboardLogItemContent').innerHTML = html;

    itemElem.classList.add('hidden');
    await insertFirstChildAndWait(keyboardLogItemsElem, itemElem);
    await sleep(100);
    itemElem.classList.remove('hidden');

    while (keyboardLogItemsElem.children.length > 30) {
        keyboardLogItemsElem.lastChild.remove();
    }
}

function updateLastKeyboardLogItem(html: string) {
    keyboardLogItemsElem.children[0].querySelector('.keyboardLogItemContent').innerHTML = html;
}

async function insertFirstChildAndWait(parentElem: HTMLElement, elem: HTMLElement) {
    const promise = new Promise<void>(resolve => {
        var observer = new MutationObserver(() => {
            if (parentElem.contains(elem)) {
                observer.disconnect();
                resolve();
            }
        });
        observer.observe(parentElem, { childList: true });
    });
    parentElem.insertBefore(elem, parentElem.firstChild);
    return promise;
}

async function sleep(duration: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, duration);
    });
}
