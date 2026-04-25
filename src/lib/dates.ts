import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

export const TZ = 'Asia/Colombo'

/** Format a UTC ISO string (or Date) for display in Colombo time. */
export function colomboFormat(isoOrDate: string | Date, formatStr: string): string {
  return formatInTimeZone(new Date(isoOrDate), TZ, formatStr)
}

/** Current month name in Colombo time (e.g. "April"). */
export function colomboMonth(): string {
  return formatInTimeZone(new Date(), TZ, 'MMMM')
}

/** Current year in Colombo time. */
export function colomboYear(): number {
  return parseInt(formatInTimeZone(new Date(), TZ, 'yyyy'), 10)
}

/**
 * Convert a Colombo-local date + time entered in a form input into a UTC ISO
 * string safe to store in Supabase (timestamptz).
 *
 * dateStr  — "yyyy-MM-dd"  (from <input type="date">)
 * timeStr  — "HH:mm"       (from <input type="time">, optional)
 */
export function colomboToUTC(dateStr: string, timeStr = '00:00'): string {
  return fromZonedTime(`${dateStr}T${timeStr}:00`, TZ).toISOString()
}

/** Extract the Colombo-local date portion (yyyy-MM-dd) from a UTC ISO string, for date inputs. */
export function colomboDateStr(isoOrDate: string | Date): string {
  return formatInTimeZone(new Date(isoOrDate), TZ, 'yyyy-MM-dd')
}

/** Extract the Colombo-local time portion (HH:mm) from a UTC ISO string, for time inputs. */
export function colomboTimeStr(isoOrDate: string | Date): string {
  return formatInTimeZone(new Date(isoOrDate), TZ, 'HH:mm')
}
