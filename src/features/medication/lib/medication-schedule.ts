type MedicationLike = {
	frequency: string;
	startDate: string;
	endDate?: string | null;
};

function parseDate(dateStr: string): Date {
	const [y, m, d] = dateStr.split("-").map(Number);
	return new Date(y, m - 1, d);
}

function daysBetween(a: string, b: string): number {
	const dateA = parseDate(a);
	const dateB = parseDate(b);
	return Math.round(
		(dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24),
	);
}

function lastDayOfMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns the number of doses expected per due day.
 * "2x pe zi" → 2, "Săptămânal" → 1, etc.
 */
export function getDailyDoseCount(frequency: string): number {
	const match = frequency.match(/^(\d+)x pe zi$/);
	if (match) return parseInt(match[1], 10);
	return 1;
}

/**
 * Checks whether a medication is due on a specific date,
 * considering its frequency, startDate, and endDate.
 */
export function isMedicationDueOnDate(
	med: MedicationLike,
	dateStr: string,
): boolean {
	// Not yet started
	if (dateStr < med.startDate) return false;
	// Already ended
	if (med.endDate && dateStr > med.endDate) return false;

	const freq = med.frequency;

	// Daily: "1x pe zi", "2x pe zi", etc.
	if (/^\d+x pe zi$/.test(freq)) {
		return true;
	}

	// Every 2 days
	if (freq === "La 2 zile") {
		const diff = daysBetween(med.startDate, dateStr);
		return diff >= 0 && diff % 2 === 0;
	}

	// Weekly: same day of week as startDate
	if (freq === "Săptămânal") {
		const startDay = parseDate(med.startDate).getDay();
		const targetDay = parseDate(dateStr).getDay();
		return startDay === targetDay;
	}

	// Monthly: same day of month as startDate (handle month-end)
	if (freq === "Lunar") {
		const startDayOfMonth = parseDate(med.startDate).getDate();
		const target = parseDate(dateStr);
		const targetDayOfMonth = target.getDate();
		const maxDay = lastDayOfMonth(target.getFullYear(), target.getMonth());

		// If start was on 31st and this month has 28 days, due on 28th
		const effectiveDay = Math.min(startDayOfMonth, maxDay);
		return targetDayOfMonth === effectiveDay;
	}

	// Unknown frequency — default to daily
	return true;
}

/**
 * Returns all dates (YYYY-MM-DD) in [start, end] range where the medication is due.
 */
export function getDueDatesInRange(
	med: MedicationLike,
	rangeStart: string,
	rangeEnd: string,
): string[] {
	const dates: string[] = [];
	const current = parseDate(rangeStart);
	const end = parseDate(rangeEnd);

	while (current <= end) {
		const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
		if (isMedicationDueOnDate(med, dateStr)) {
			dates.push(dateStr);
		}
		current.setDate(current.getDate() + 1);
	}

	return dates;
}
