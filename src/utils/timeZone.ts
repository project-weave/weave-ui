// These helpers accept IANA time zones supported by the browser, including UTC and aliases.
import { format, utcToZonedTime } from "date-fns-tz";

const now = new Date();

export function isSupportedTimeZone(timeZone: string) {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export function getTimeZoneCity(timeZone: string): string {
  return timeZone.replaceAll("_", " ").split("/").pop() ?? "";
}

export function getTimeZoneAbbreviation(timeZone: string): string {
  // Use a winter date (January 15) to get standard time abbreviations instead of daylight saving time
  const winterDate = new Date(2024, 0, 15);

  const timeZoneFormatter = new Intl.DateTimeFormat("en-US", {
    hour12: false,
    timeZone,
    timeZoneName: "short"
  });
  const timeZoneParts = timeZoneFormatter.formatToParts(winterDate);

  return timeZoneParts.find((part) => part.type === "timeZoneName")?.value || timeZone;
}

export function getGMTOffset(timezone: string): string {
  const zonedTime = utcToZonedTime(now, timezone);
  const offset = format(zonedTime, "xxx", { timeZone: timezone }); // 'xxx' gives the offset in ±HH:mm format
  return `GMT ${offset}`;
}
