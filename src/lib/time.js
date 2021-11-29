/**
 * Formats a date in the ISO8601 format.
 * @param {Date} date The date to format
 * @returns {string} An ISO formatted string with timezone offset.
 */
export function toIsoFormatWithOffset(date) {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = num => String(num).padStart(2, '0');
  
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
}