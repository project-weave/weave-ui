import { addDays } from "date-fns";

export function isConsecutiveDay(date1: Date, date2: Date): boolean {
  return addDays(date1, 1).getDate() === date2.getDate();
}

export function timeFilter(value: string, search: string) {
  search = search.trim().toLowerCase();
  value = value.toLowerCase();

  if (value.includes(search)) return 1;

  const ampmMatch = search.match(/(a|p)m?$/);
  const ampm = ampmMatch ? ` ${ampmMatch[0]}` : "";
  search = search.replace(/(a|p)m?$/, "").trim();

  const patterns: string[] = [];
  if (search.includes(":")) {
    if (search.split(":").length > 2) return 0;
    const [hours, minutes] = search.split(":");
    patterns.push(`${hours}:${minutes}${ampm}`);
  } else {
    const len = search.length;
    if (len === 1) {
      patterns.push(`${search}:00${ampm}`);
    } else if (len === 2) {
      patterns.push(`${search}:00${ampm}`);
      patterns.push(`${search[0]}:${search[1]}0${ampm}`);
    } else if (len === 3) {
      patterns.push(`${search[0]}:${search.slice(1, 3)}${ampm}`);
      patterns.push(`${search.slice(0, 2)}:${search[2]}0${ampm}`);
    } else if (len === 4) {
      patterns.push(`${search.slice(0, 2)}:${search.slice(2, 4)}${ampm}`);
    }
  }
  return patterns.some((pattern) => value.includes(pattern)) ? 1 : 0;
}
