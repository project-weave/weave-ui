import { addDays, format, isSameDay, isSameYear, parseISO } from "date-fns";

export function isConsecutiveDay(date1: Date, date2: Date): boolean {
  return isSameDay(addDays(date1, 1), date2);
}

export function formatEventDateRange(dates: string[], isSpecificDates = true): string {
  if (dates.length === 0) return "";
  const first = parseISO(dates[0]);
  const last = parseISO(dates[dates.length - 1]);
  if (!isSpecificDates) {
    return dates.length === 1 ? `Every ${format(first, "EEEE")}` : `${format(first, "EEE")} – ${format(last, "EEE")}`;
  }
  if (isSameDay(first, last)) return format(first, "MMM d, yyyy");
  return `${format(first, isSameYear(first, last) ? "MMM d" : "MMM d, yyyy")} – ${format(last, "MMM d, yyyy")}`;
}
