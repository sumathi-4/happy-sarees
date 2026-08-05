// ============================================================
//  server/utils/timezone.js
//  Timezone parsing & formatting utilities for Happy Sarees
//  Consistently handles India Standard Time (IST / Asia/Kolkata)
// ============================================================

const TIMEZONE = 'Asia/Kolkata';

/**
 * Parses a input date into a JavaScript Date object in Asia/Kolkata timezone.
 * Supports:
 * - Date objects
 * - Timezone-aware ISO strings (e.g. "2026-08-05T09:43:00.000Z")
 * - Timezone-naive local datetime-local strings (e.g. "2026-08-05T15:13")
 *
 * @param {string|Date} dateInput
 * @returns {Date|null}
 */
function parseInTimezone(dateInput) {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }

  // If timezone-aware (ends with Z or offset like +05:30)
  if (typeof dateInput === 'string' && (dateInput.endsWith('Z') || /[-+]\d{2}:?\d{2}$/.test(dateInput))) {
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Timezone-naive string: "YYYY-MM-DDTHH:mm"
  try {
    const normalized = String(dateInput).replace(' ', 'T');
    const [datePart, timePart] = normalized.split('T');
    if (!datePart) return null;
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = (timePart || '00:00').split(':').map(Number);

    const t0 = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(t0);
    const getPart = type => Number(parts.find(p => p.type === type).value);

    const yearLocal = getPart('year');
    const monthLocal = getPart('month');
    const dayLocal = getPart('day');
    let hourLocal = getPart('hour');
    if (hourLocal === 24) hourLocal = 0;
    const minuteLocal = getPart('minute');
    const secondLocal = getPart('second');

    const t0LocalParsed = new Date(Date.UTC(yearLocal, monthLocal - 1, dayLocal, hourLocal, minuteLocal, secondLocal));
    const offset = t0LocalParsed.getTime() - t0.getTime();

    return new Date(t0.getTime() - offset);
  } catch (err) {
    console.error('[timezone parse error]', err.message);
    const fallback = new Date(dateInput);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
}

/**
 * Formats a Date object or ISO string into a timezone-naive local string
 * matching the datetime-local input format ("YYYY-MM-DDTHH:mm") in Asia/Kolkata.
 *
 * @param {string|Date} dateInput
 * @returns {string}
 */
function formatInTimezone(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(date);
    const getPart = type => parts.find(p => p.type === type).value;

    const pad = s => String(s).padStart(2, '0');

    const year = getPart('year');
    const month = pad(getPart('month'));
    const day = pad(getPart('day'));
    let hour = getPart('hour');
    if (Number(hour) === 24 || hour === '24') hour = '00';
    else hour = pad(hour);
    const minute = pad(getPart('minute'));

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch (err) {
    console.error('[timezone format error]', err.message);
    return '';
  }
}

module.exports = {
  TIMEZONE,
  parseInTimezone,
  formatInTimezone
};
