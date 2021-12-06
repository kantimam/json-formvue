import { getMaskPatternToRegexMatches, matchMaskPattern } from "./pattern";

/**
 * Formats a date in the ISO8601 UTC format.
 * @param {Date} date The date to format
 * @returns {string} An ISO UTC formatted string with timezone offset.
 */
export function toIsoFormatWithOffset(date) {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = num => String(num).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
}

/**
 * Decomposes an ISO date into year, month and date
 * @param {string} date An ISO Date as string, e.g. '2021-12-31'
 * @returns {[number, number, number]} A tuple of year, month and date
 */
export function splitIsoDate(date) {
    return date.split('-').map(x => Number(x));
}

/**
 * Compares two ISO formatted dates.
 * @param {string|[number, number, number]} a Date a in ISO format
 * @param {string|[number, number, number]} $b Date b in ISO format
 * @returns {number} Either -1, 0 or 1; if Date a is before, the same or after b.
 */
export function compareDateTimes(a, b) {
    const [yearA, monthA, dayA] = Array.isArray(a) ? a : splitIsoDate(a);
    const [yearB, monthB, dayB] = Array.isArray(b) ? b : splitIsoDate(b);

    const intcmp = (a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0);

    const yearCmp = intcmp(yearA, yearB);
    if (yearCmp !== 0) return yearCmp;

    const monthCmp = intcmp(monthA, monthB);
    if (monthCmp !== 0) return monthCmp;

    return intcmp(dayA, dayB);
}

/**
 * Gets the current date in ISO time.
 * @returns {string} The current date as ISO string. e.g. '2021-12-31'
 */
export function currentIsoTime() {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10);
}

/**
 * Formats a pattern date to an ISO Date (e.g. '2021-12-31').
 * 
 * @param {string} date A pattern formatted date string.
 * @param {string} pattern A masked element pattern.
 * @param {function(string[], string[], string):number} getter An optional getter that supplies date numbers.
 * @param {function(number, number, number):[string|null, boolean]} interceptor An optional interceptor that takes year, month and day and returns a result and a boolean, whether to override the functions result with it.
 * @returns {string|null} The ISO formatted string, or null, if there was an error.
 */
export function parseISODateFromPattern(date, pattern, getter = (match, order, identifier) => {
    const idx = order.indexOf(identifier);
    return idx >= 0 ? Number(match[idx + 1]) : undefined; // order[i] = match[i + 1]
}, interceptor = undefined) {
    const res = matchMaskPattern(date, pattern);
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

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
    )}`;
}

/**
 * Formats an ISO Date (e.g. '2021-12-31') according to a masked element pattern.
 * 
 * @param {string} date An ISO formatted date string.
 * @param {string} pattern A masked element pattern
 * @param {object} substitutes A dictionary with character substitutes
 * @returns {string|null} The formatted string, or null, if there was an error.
 */
export function formatISODateFromPattern(date, pattern, extraSubstitutes = {}) {
    const [year, month, day] = splitIsoDate(date);
    const substitutes = {
        d: String(day).padStart(2, '0'),
        m: String(month).padStart(2, '0'),
        Y: String(year),
        ...extraSubstitutes
    };

    const matches = getMaskPatternToRegexMatches(pattern);

    let cursor = 0;
    const patternSegments = [];

    matches.forEach((match) => {
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