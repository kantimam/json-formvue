import {getMaskPatternToRegexMatches, matchMaskPattern} from '@/lib/pattern';

export type DatePartSupplier = (match: string[], order: string[], identifier: string) => number | undefined;
export type DateInjectionResult = [string | null, boolean];
export type DateInjector = (year?: number, month?: number, day?: number) => DateInjectionResult;
export type IsoInterpretable = string | [number, number, number];
export type CompareValue = -1 | 0 | 1;
export type PHPTimeUnit = 'Y' | 'M' | 'D';

/**
 * Formats a date in the ISO8601 UTC format.
 * @param {Date} date The date to format
 * @returns {string} An ISO UTC formatted string with timezone offset.
 */
export function toIsoFormatWithOffset(date: Date): string {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = (num: number) => String(num).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
}

/**
 * Decomposes an ISO date into year, month and date
 * @param {string} dateString An ISO Date as string, e.g. '2021-12-31'
 * @returns {[number, number, number]} A tuple of year, month and date
 */
export function splitIsoDate(dateString: string) {
    return dateString.split('-').map(x => Number(x));
}

/**
 * Checks, if a string is ISO formatted.
 * @param {string} str The string to check.
 * @returns {boolean} True, if the string is ISO formatted.
 */
export function isIsoFormatted(str: string) {
    const pattern = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;
    return pattern.test(str);
}

/**
 * Compares two ISO formatted dates.
 * @param {IsoInterpretable} a Date a in ISO format
 * @param {IsoInterpretable} b Date b in ISO format
 * @returns {number} Either -1, 0 or 1; if Date a is before, the same or after b.
 */
export function compareDateTimes(a: IsoInterpretable, b: IsoInterpretable): CompareValue {
    const [yearA, monthA, dayA] = Array.isArray(a) ? a : splitIsoDate(a);
    const [yearB, monthB, dayB] = Array.isArray(b) ? b : splitIsoDate(b);

    const intcmp = (a: number, b: number) => (a < b) ? -1 : ((a > b) ? 1 : 0);

    const yearCmp = intcmp(yearA, yearB);
    if (yearCmp !== 0) return yearCmp;

    const monthCmp = intcmp(monthA, monthB);
    if (monthCmp !== 0) return monthCmp;

    return intcmp(dayA, dayB);
}

/**
 * Gets the timezone-offset-freed "normalized" date.
 */
export function currentNormalizedDate() {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
}

/**
 * Gets the current date in ISO time.
 * @returns {string} The current date as ISO string. e.g. '2021-12-31'
 */
export function currentIsoTime(): string {
    return getShortIsoString(currentNormalizedDate());
}

/**
 * Converts a date object to a short ISO string, e.g. '2021-12-31'
 *
 * @param {Date} date The date to convert.
 */
export function getShortIsoString(date: Date): string {
    return date.toISOString().substr(0, 10);
}

/**
 * Formats a pattern date to an ISO Date (e.g. '2021-12-31').
 *
 * @param {string} dateStr A pattern formatted date string.
 * @param {string} pattern A masked element pattern.
 * @param {DatePartSupplier} getter An optional getter that supplies date numbers.
 * @param interceptor An optional interceptor that takes year, month and day and returns a result and a boolean, whether to override the functions result with it.
 * @returns {string|null} The ISO formatted string, or null, if there was an error.
 */
export function parseISODateFromPattern(dateStr: string, pattern: string, getter: DatePartSupplier = (match, order, identifier) => {
    const idx = order.indexOf(identifier);
    return idx >= 0 ? Number(match[idx + 1]) : undefined; // order[i] = match[i + 1]
}, interceptor?: DateInjector) {

    const res = matchMaskPattern(dateStr, pattern);
    if (!res) return null;

    const [match, order] = res;

    const year = getter(match, order, "Y");
    const month = getter(match, order, "m");
    const day = getter(match, order, "d");

    if (interceptor) {
        const [res, cancel] = interceptor(year, month, day);
        if (cancel) return res;
    }

    if (year === undefined || month === undefined || day === undefined) return null;

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Formats an ISO Date (e.g. '2021-12-31') according to a masked element pattern.
 *
 * @param {string} date An ISO formatted date string.
 * @param {string} pattern A masked element pattern
 * @param extraSubstitutes A dictionary with character substitutes
 * @returns {string|null} The formatted string, or null, if there was an error.
 */
export function formatISODateFromPattern(date: string, pattern: string, extraSubstitutes: Record<string, string> = {}) {
    const [year, month, day] = splitIsoDate(date);
    const substitutes: Record<string, string> = {
        d: String(day).padStart(2, '0'),
        m: String(month).padStart(2, '0'),
        Y: String(year),
        ...extraSubstitutes
    };

    const matches = getMaskPatternToRegexMatches(pattern);

    let cursor = 0;
    const patternSegments = [];

    matches.forEach((match) => {
        if (match.index === undefined) return;

        const str = match[0];
        const len = str.length;
        const firstChar = str[0];

        const group = firstChar in substitutes ? substitutes[firstChar] : str;
        const preRemainder = pattern.slice(cursor, match.index);
        patternSegments.push(preRemainder, group);
        cursor = match.index + len;
    });

    if (cursor < pattern.length) {
        const remainder = pattern.slice(cursor, pattern.length);
        patternSegments.push(remainder);
    }

    return patternSegments.join("");
}

/**
 * Interprets a timestamp from the backend.
 * Can interpret 'today' => current date, as well as 'today-18Y' => current date, 18 years ago.
 *
 * @param text The date string to be interpreted.
 * @return {string} An ISO formatted date.
 */
export function interpretTime(text: string) {
    if (!text) return text;

    const regex = /^today(?:([-+])([0-9]+)([YMD]))?$/;
    const match = text.match(regex);
    if (!match) return text;

    // matched, but no modifiers
    if (!match[1] || match[1].length <= 0) return currentIsoTime();

    const sign = match[1] === '-' ? -1 : 1;
    const [amount, unit] = match.slice(2);
    const date = addToDate(currentNormalizedDate(), sign * Number(amount), unit as PHPTimeUnit);

    return getShortIsoString(date);
}

/**
 * Adds a given amount of <time unit> to a date.
 *
 * @param subject The date to add to.
 * @param amount The amount of <unit> to add.
 * @param unit The time unit.
 */
function addToDate(subject: Date, amount: number, unit: PHPTimeUnit) {
    switch (unit) {
        case 'Y':
            subject.setFullYear(subject.getFullYear() + amount);
            break;
        case "M":
            subject.setMonth(subject.getMonth() + amount);
            break;
        case "D":
            subject.setDate(subject.getDate() + amount);
            break;
        default:
            break;
    }

    return subject;
}
