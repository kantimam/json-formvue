/**
 * Replaces all supported format specifiers in a string (%s, %d, %f) with their substitues (if given).
 * Escape a % with another % ('%%s' will result in '%s')
 * @param {string} text The string to search
 * @param  {...any} param Substitutes
 * @return {string} The processed string.
 */
export function replaceFormatSpecifiers(text, ...param) {
    const matches = Array.from(text.matchAll(/%[sdf]/g));
    const segments = [];
    let cursor = 0;

    matches.forEach((match, nMatch) => {
        const str = match[0];
        const idx = match['index'];
        if (idx > 0 && text[idx - 1] === '%') return; // escaped

        let prefix = text.substring(cursor, idx);
        if (prefix.length > 0) segments.push(prefix); // prepend prefix

        let repl = str;
        if (nMatch < param.length) {
            // there is a substitute parameter for this match
            const subst = param[nMatch];

            // use correct stringification
            switch (str[1]) {
                case 's':
                case 'f':
                    repl = String(subst)
                    break;
                case 'd':
                    repl = Number(subst).toFixed(0); // integer
                    break;

                default:
                    break;
            }
        }

        segments.push(repl);
        cursor += prefix.length + str.length;
    });

    if (cursor < text.length) segments.push(text.substring(cursor, text.length));

    return segments.join('');
}