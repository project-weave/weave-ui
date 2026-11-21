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

// Time zones whose rules changed recently. Labels are pinned here so they read correctly even in
// browsers whose built-in time zone data predates the change.
// British Columbia stopped changing clocks on March 8, 2026 and stays on UTC-7 ("Pacific Time") year-round.
const BC_PERMANENT_PACIFIC_TIME = { abbreviation: "PT", offset: "-07:00", since: new Date("2026-03-08T10:00:00Z") };
const TIME_ZONE_LABEL_OVERRIDES: Record<string, typeof BC_PERMANENT_PACIFIC_TIME> = {
  "America/Vancouver": BC_PERMANENT_PACIFIC_TIME,
  "Canada/Pacific": BC_PERMANENT_PACIFIC_TIME
};

function getTimeZoneLabelOverride(timeZone: string) {
  const override = TIME_ZONE_LABEL_OVERRIDES[timeZone];
  return override && now >= override.since ? override : undefined;
}

export function getTimeZoneAbbreviation(timeZone: string): string {
  const override = getTimeZoneLabelOverride(timeZone);
  if (override) return override.abbreviation;

  // Use the current date so the abbreviation matches what is in effect today (e.g. PDT vs PST)
  const timeZoneFormatter = new Intl.DateTimeFormat("en-US", {
    hour12: false,
    timeZone,
    timeZoneName: "short"
  });
  const timeZoneParts = timeZoneFormatter.formatToParts(now);

  return timeZoneParts.find((part) => part.type === "timeZoneName")?.value || timeZone;
}

export function getGMTOffset(timezone: string): string {
  const override = getTimeZoneLabelOverride(timezone);
  if (override) return `GMT ${override.offset}`;

  const zonedTime = utcToZonedTime(now, timezone);
  const offset = format(zonedTime, "xxx", { timeZone: timezone }); // 'xxx' gives the offset in ±HH:mm format
  return `GMT ${offset}`;
}
