/**
 * Replaces all supported format specifiers in a string (%s, %d, %f) with their substitues (if given).
 * Escape a % with another % ('%%s' will result in '%s')
 * @param {string} text The string to search
 * @param  {...any} param Substitutes
 * @return {string} The processed string.
 */
export function replaceFormatSpecifiers(text: string, ...param: any[]): string {
    const matches = Array.from(text.matchAll(/%[sdf]/g));
    const segments: string[] = [];
    let cursor = 0;

    matches.forEach((match, nMatch) => {
        const str = match[0];
        const idx = match['index'];
        if (idx === undefined || (idx > 0 && text[idx - 1] === '%')) return;  // no match or escaped match

        let prefix = text.substring(cursor, idx);
        if (prefix.length > 0) segments.push(prefix);  // prepend prefix

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

    if (cursor < text.length)
        segments.push(text.substring(cursor, text.length));

    return segments.join('');
}

/**
 * Replace pluralization tokens in the form of (idx|singular|plural).
 * Where <b>idx</b> is the index of a numerical parameter of the passed parameter array.
 * The index is used as reference when determining whether to use singular or plural.
 * <b>Singular</b> and <b>plural</b> are both strings, representing the different pluralization values.
 *
 * Pluralization tokens can be escaped by prefixing them with a backslash.
 *
 * @param {string} text The text to replace tokens in.
 * @param {...any} param The replacements parameters.
 * @return {string} The same string, but with pluralization tokens substituted, where possible.
 */
export function replacePluralizationTokens(text: string, ...param: any[]): string {
    const matches = Array.from(text.matchAll(/\((\d+)\|([^()]+)\|([^()]+)\)/g));
    const segments: string[] = [];
    let cursor = 0;

    matches.forEach(match => {
        const idx = match['index'];
        if (idx === undefined || (idx > 0 && text[idx - 1] === '\\')) return;  // no match or escaped match

        const amountParamRef = Number(match[1]);
        if (amountParamRef < 0 || amountParamRef >= param.length) return; // invalid index

        let prefix = text.substring(cursor, idx);
        if (prefix.length > 0) segments.push(prefix); // prepend prefix (text before token)

        // get the actual amount from params
        const amount = Number(param[amountParamRef]);
        if (isNaN(amount)) return; // param is NaN

        // determine pluralization
        let repl;
        if (amount === 1) {
            // singular
            repl = match[2];
        } else {
            // plural
            repl = match[3];
        }

        segments.push(repl);
        // adjust the cursor
        // match[0] is the total match string
        cursor += prefix.length + match[0].length;
    });

    if (cursor < text.length) {
        segments.push(text.substring(cursor, text.length));
    }

    return segments.join('');
}
