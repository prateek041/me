/**
 * A post's date is a calendar day with no time. It is stored internally as
 * midnight UTC of that day and always formatted in UTC, so the day a reader
 * sees never depends on the server's or the reader's timezone.
 */
export function calendarDay(value: unknown): Date | null {
  if (value instanceof Date) {
    // YAML reads `date: 2026-11-20` as midnight UTC already.
    return Number.isNaN(value.getTime()) ? null : new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  if (value == null) return null;
  const s = String(value).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));
    return d.getUTCDate() === +iso[3] ? d : null;
  }
  // Other formats ("October 28, 2024") are read as local midnight; keep the day as written.
  const local = new Date(s);
  if (Number.isNaN(local.getTime())) return null;
  return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
}
