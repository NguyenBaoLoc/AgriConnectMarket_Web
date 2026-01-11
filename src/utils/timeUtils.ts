const VN_LOCALE = 'vi-VN';

/**
 * Parse a UTC datetime string safely.
 *
 * Handles:
 *  - SQL Server fractional seconds (.3633615)
 *  - Missing timezone (assumes UTC)
 *  - Date objects
 */
function parseUtc(value: string | Date | null | undefined): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  let s = value.trim();

  // Trim fractional seconds to max 3 digits
  s = s.replace(/(\.\d{3})\d+$/, '$1');

  // If there is no timezone info, assume UTC
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) {
    s = s + 'Z';
  }

  const d = new Date(s);

  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format date to dd/MM/yyyy (Vietnamese)
 */
export function formatUtcDate(value: string | Date | null | undefined): string {
  const date = parseUtc(value);
  if (!date) return '';

  return new Intl.DateTimeFormat(VN_LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Format date + time to dd/MM/yyyy HH:mm (Vietnamese)
 */
export function formatUtcDateTime(
  value: string | Date | null | undefined
): string {
  const date = parseUtc(value);
  if (!date) return '';

  return new Intl.DateTimeFormat(VN_LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
