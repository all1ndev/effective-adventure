/**
 * Convert a UTC Date to a "fake" Date whose getters return wall-clock values
 * in the given IANA timezone (e.g. "Europe/Bucharest").
 */
export function toTimezone(date: Date, timezone: string): Date {
	const str = date.toLocaleString("en-US", { timeZone: timezone });
	return new Date(str);
}

/**
 * Format a Date as YYYY-MM-DD.
 */
export function formatDate(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Format a Date as HH:MM.
 */
export function formatHHMM(date: Date): string {
	return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * Convert a date string + time string in a given timezone to a proper UTC Date.
 * e.g. toUTC("2026-04-10", "08:00", "Europe/Bucharest") → Date for UTC 05:00
 */
export function toUTC(
	dateStr: string,
	timeStr: string,
	timezone: string,
): Date {
	const utcNow = new Date();
	const local = toTimezone(utcNow, timezone);
	const offsetMs = local.getTime() - utcNow.getTime();
	return new Date(new Date(`${dateStr}T${timeStr}:00`).getTime() - offsetMs);
}
