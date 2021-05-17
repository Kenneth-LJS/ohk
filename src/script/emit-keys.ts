function rangeArray(start: number, end: number): number[] {
    return new Array(end - start + 1).fill(undefined).map((_, i) => i + start);
}

function initKeys(): { [key: string]: KeyboardEventInit } {
    const keys = {} as { [key: string]: KeyboardEventInit };

    // Letters
    rangeArray(65, 90).concat(rangeArray(97, 122))
        .forEach(keyCode => {
            const key = String.fromCharCode(keyCode);
            const code = `Key${key.toUpperCase()}`;
            keys[key] = { key, code };
        });
    
    // Numbers 0-9
    rangeArray(0, 9).forEach(number => {
        const key = number.toString();
        const code = `Digit${key}`;
        keys[key] = { key, code };
    });

    // Symbol above numbers
    ')!@#$%^&*('.split('').forEach((symbol, i) => {
        const key = symbol;
        const code = `Digit${i}`;
        keys[key] = { key, code };
    });

    // F1-F12
    rangeArray(1, 12).forEach(number => {
        const key = `F${number}`;
        keys[key] = { key, code: key };
    });

    // Arrow keys
    ['Left', 'Right', 'Up', 'Down'].forEach(direction => {
        const key = `Arrow${direction}`;
        keys[key] = { key, code: key };
    });

    // Misc characters
    keys['`'] = { key: '`~`', code: 'Backquote' };
    keys['~'] = { key: '~', code: 'Backquote' };
    keys['-'] = { key: '-', code: 'Minus' };
    keys['_'] = { key: '_', code: 'Minus' };
    keys['='] = { key: '=', code: 'Equal' };
    keys['+'] = { key: '+', code: 'Equal' };    
    keys['['] = { key: '[', code: 'BracketLeft' };
    keys['{'] = { key: '{', code: 'BracketLeft' };
    keys[']'] = { key: ']', code: 'BracketRight' };
    keys['}'] = { key: '}', code: 'BracketRight' };
    keys['\\'] = { key: '\\', code: 'Backslash' };
    keys['|'] = { key: '|', code: 'Backslash' };
    keys[';'] = { key: ';', code: 'Semicolon' };
    keys[':'] = { key: ':', code: 'Semicolon' };
    keys["'"] = { key: "'", code: 'Quote' };
    keys['"'] = { key: '"', code: 'Quote' };
    keys[','] = { key: ',', code: 'Comma' };
    keys['<'] = { key: '<', code: 'Comma' };
    keys['.'] = { key: '.', code: 'Period' };
    keys['>'] = { key: '>', code: 'Period' };
    keys['/'] = { key: '/', code: 'Slash' };
    keys['?'] = { key: '?', code: 'Slash' };
    keys[' '] = { key: ' ', code: 'Space' };

    ['Shift', 'Control', 'Alt'].forEach(key => {
        keys[key] = { key, code: `${key}Left` };
        keys[`${key}Left`] = { key, code: `${key}Left` };
        keys[`${key}Right`] = { key, code: `${key}Right` };
    });

    [
        'Tab', 'CapsLock', 'Escape', 'Enter', 'ContextMenu', 'Backspace',
        'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown'
    ].forEach(key => {
        keys[key] = { key, code: key };
    });

    return keys;
}

const KEYS = initKeys() as { [key: string]: KeyboardEventInit };
export default KEYS;

