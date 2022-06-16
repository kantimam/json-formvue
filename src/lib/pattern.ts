export type DateRule = [minValue: number, maxValue: number, minDigits: number] | [minValue: number, maxValue: undefined];
export type MaskPatternMapping = Record<string, DateRule>;
export type MaskPatternRegex = [string, string[]];
export type MaskMatches = [string[], string[]];

/**
 * Gets the default pattern mapping.
 * The rule tuples (rules) are defined like the following:
 * @example [
 *   'min_value': 'The minimum integer value accepted',
 *   'max_value': 'The maximum integer value accepted',
 *   'min_digits': 'The minimum amount of digits which can be parsed of the character in a group'
 * ]
 * @returns {MaskPatternMapping} A dictionary that holds records for every known identifier and it's rule tuple
 */
export function getMaskPatternMapping(): MaskPatternMapping {
    return {
        // identifier (char): [min_value, max_value, min_digits]
        // omit min_digits to set to max_digits (derived by given format)
        'H': [0, 23, 1],    // hour
        'i': [0, 59, 1],    // minute
        'd': [0, 31, 1],    // day of month
        'm': [1, 12, 1],    // month
        'Y': [0, undefined] // year
    };
}

/**
 * Gets all matches in the process mask pattern to regex.
 *
 * @param {string} format The mask pattern to convert.
 * @param mapping The identifier dictionary.
 * @returns {RegExpMatchArray[]} An array of string matches.
 */
export function getMaskPatternToRegexMatches(format: string, mapping = getMaskPatternMapping()): RegExpMatchArray[] {
    const intermediaryPattern = Object.keys(mapping)
        .map(c => c.concat('+'))
        .join('|');
    const intermediaryRegex = new RegExp(intermediaryPattern, 'g');
    return Array.from(format.matchAll(intermediaryRegex));
}

/**
 * Converts a mask pattern to a regex pattern.
 *
 * @example
 * convertMaskPatternToRegex('dd.mm.YYYY', getMaskPatternMapping())
 * -> [
 *      '[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}',
 *      ['d','m','Y']
 *    ]
 *
 * @param {string} format The fornmat to convert
 * @param {object} mapping The identifier dictionary.
 * @returns {[string, string[]]} A tuple with first, the generated pattern string; and second, an ordered array with the occurrences of identifiers.
 */
export function convertMaskPatternToRegex(format: string, mapping: MaskPatternMapping): MaskPatternRegex {
    const matches = getMaskPatternToRegexMatches(format, mapping);

    let cursor = 0;
    const patternSegments: string[] = [];
    const groupOrder: string[] = [];

    matches.forEach(match => {
        if (match.index === undefined) return;

        const str = match[0];
        const len = str.length;
        const firstChar = str[0];
        const minDigits = mapping[firstChar][2];
        groupOrder.push(firstChar);

        const group = `([0-9]{${minDigits || len},${len}})`;
        const preRemainder = escapeRegexSpecialChars(format.slice(cursor, match.index))
        patternSegments.push(preRemainder, group);
        cursor = match.index + len;
    });

    if (cursor < format.length) {
        const remainder = escapeRegexSpecialChars(format.slice(cursor, format.length));
        patternSegments.push(remainder);
    }

    return [patternSegments.join(''), groupOrder];
}

export function escapeRegexSpecialChars(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole match
}

/**
 * Matches an input against a mask pattern and returns the matches as well as their mapping.
 *
 * @example
 *
 * matchMaskPattern('31.12.2021', 'dd.mm.YYYY')
 * -> [
 *      ['31', '12', '2021'],
 *      ['d', 'm', 'Y']
 *    ]
 *
 * @param {string} input The input string to process
 * @param {string} maskPattern The mask pattern
 * @param {object} mapping The pattern identifier dictionary to match against
 * @returns {[string[], string[]] | null} A tuple with first, an ordered array of matches in the input;
 * and second, an ordered array of the order of occurrences of identifiers, so that the match types can be identified.
 * Returns null, if the input doesn't match the maskPattern
 */
export function matchMaskPattern(input: string, maskPattern: string, mapping = getMaskPatternMapping()): MaskMatches | null {
    const [pattern, order] = convertMaskPatternToRegex(maskPattern, mapping);
    const regex = new RegExp(pattern);

    const match = input.match(regex);
    if (!match) return null;

    return [match, order];
}
