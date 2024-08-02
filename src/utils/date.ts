import { addDays } from "date-fns";

export function isConsecutiveDay(date1: Date, date2: Date): boolean {
  return addDays(date1, 1).getDate() === date2.getDate();
}

