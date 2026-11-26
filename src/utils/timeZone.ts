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
const BC_PERMANENT_PACIFIC_TIME = {
  abbreviation: "PT",
  name: "Pacific Time",
  offset: "-07:00",
  since: new Date("2026-03-08T10:00:00Z")
};
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

function getTimeZoneNamePart(timeZone: string, style: "long" | "longOffset"): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: style }).formatToParts(now);
    return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

// e.g. "Pacific Daylight Time"
export function getTimeZoneLongName(timeZone: string): string {
  const override = getTimeZoneLabelOverride(timeZone);
  if (override) return override.name;
  return getTimeZoneNamePart(timeZone, "long") || getTimeZoneAbbreviation(timeZone);
}

// minutes east of UTC right now, e.g. -420 for UTC-7
export function getTimeZoneOffsetMinutes(timeZone: string): number {
  const override = getTimeZoneLabelOverride(timeZone);
  const offset = override ? `GMT${override.offset}` : getTimeZoneNamePart(timeZone, "longOffset");
  const match = offset.match(/([+-])(\d{2}):?(\d{2})?/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return match[1] === "-" ? -minutes : minutes;
}

// e.g. "GMT-07:00", always with hours and minutes so the list lines up
export function formatGMTOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? "-" : "+";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  return `GMT${sign}${hours}:${minutes}`;
}

export type TimeZoneOption = {
  abbreviation: string;
  city: string;
  name: string;
  offsetLabel: string;
  offsetMinutes: number;
  // everything a search can match on, lowercased
  searchText: string;
  value: string;
};

const timeZoneOptionCache = new Map<string, TimeZoneOption>();

export function getTimeZoneOption(timeZone: string): TimeZoneOption {
  const cached = timeZoneOptionCache.get(timeZone);
  if (cached) return cached;
  const offsetMinutes = getTimeZoneOffsetMinutes(timeZone);
  const option: TimeZoneOption = {
    abbreviation: getTimeZoneAbbreviation(timeZone),
    city: timeZone === "UTC" ? "Coordinated Universal Time" : getTimeZoneCity(timeZone),
    name: timeZone === "UTC" ? "UTC" : getTimeZoneLongName(timeZone),
    offsetLabel: formatGMTOffset(offsetMinutes),
    offsetMinutes,
    searchText: "",
    value: timeZone
  };
  option.searchText = [
    option.abbreviation,
    option.city,
    option.name,
    option.offsetLabel,
    option.offsetLabel.replace(":00", ""),
    timeZone.replaceAll("_", " ")
  ]
    .join(" ")
    .toLowerCase();
  timeZoneOptionCache.set(timeZone, option);
  return option;
}

let allTimeZoneOptions: null | TimeZoneOption[] = null;

// every time zone the browser knows, west to east, then by city
export function getAllTimeZoneOptions(): TimeZoneOption[] {
  if (!allTimeZoneOptions) {
    const zones = new Set(["UTC", ...Intl.supportedValuesOf("timeZone")]);
    allTimeZoneOptions = [...zones]
      .filter(isSupportedTimeZone)
      .map(getTimeZoneOption)
      .sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.city.localeCompare(b.city));
  }
  return allTimeZoneOptions;
}

// ---- recently picked time zones (this browser only) ----
const RECENT_TIME_ZONES_KEY = "recentTimeZones";
const MAX_RECENT_TIME_ZONES = 4;

export function getRecentTimeZones(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_TIME_ZONES_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((zone) => typeof zone === "string" && isSupportedTimeZone(zone)) : [];
  } catch {
    return [];
  }
}

export function addRecentTimeZone(timeZone: string) {
  try {
    const recent = [timeZone, ...getRecentTimeZones().filter((zone) => zone !== timeZone)].slice(
      0,
      MAX_RECENT_TIME_ZONES
    );
    localStorage.setItem(RECENT_TIME_ZONES_KEY, JSON.stringify(recent));
  } catch {}
}
