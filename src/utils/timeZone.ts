// These util functions assume that timeZone is one of Intl.supportedValuesOf("timeZone")
import { format, utcToZonedTime } from "date-fns-tz";

const now = new Date();

export function isSupportedTimeZone(timeZone: string) {
  return Intl.supportedValuesOf("timeZone").includes(timeZone);
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
