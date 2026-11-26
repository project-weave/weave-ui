"use client";

import { Check, History } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import useScrollingClass from "@/hooks/useScrollingClass";
import { cn } from "@/utils/cn";
import {
  addRecentTimeZone,
  getAllTimeZoneOptions,
  getRecentTimeZones,
  getTimeZoneOption,
  isSupportedTimeZone,
  scoreTimeZone,
  TimeZoneOption
} from "@/utils/timeZone";

const RECENT_PREFIX = "recent:";
const POPULAR_PREFIX = "popular:";
export const POPULAR_TIME_ZONES = [
  "America/Vancouver",
  "America/Los_Angeles",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney"
];

type TimeZoneListProps = {
  // zones already in use: shown with a check and not selectable
  disabledTimeZones?: string[];
  // shown with a small "Event" tag
  eventTimeZone?: string;
  onSelect: (timeZone: string) => void;
  // highlighted in purple and scrolled into view
  selected?: string;
};

/**
 * Searchable, one-line-per-zone list: "GMT-07:00  Pacific Time – Vancouver".
 * Recently picked zones sit at the top, then every zone from west to east.
 */
export default function TimeZoneList({ disabledTimeZones = [], eventTimeZone, onSelect, selected }: TimeZoneListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const allOptions = useMemo(() => {
    const options = getAllTimeZoneOptions();
    // make sure zones the browser doesn't list (aliases like Canada/Pacific) still show up
    const extras = [selected, eventTimeZone]
      .filter((zone): zone is string => !!zone && isSupportedTimeZone(zone))
      .filter((zone) => !options.some((option) => option.value === zone))
      .map(getTimeZoneOption);
    if (extras.length === 0) return options;
    return [...options, ...extras].sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.city.localeCompare(b.city));
  }, [eventTimeZone, selected]);
  const recentOptions = useMemo(() => getRecentTimeZones().map(getTimeZoneOption), []);
  const popularOptions = useMemo(
    () =>
      POPULAR_TIME_ZONES.filter(
        (zone) => isSupportedTimeZone(zone) && !recentOptions.some((option) => option.value === zone)
      ).map(getTimeZoneOption),
    [recentOptions]
  );
  const optionsByValue = useMemo(() => {
    const map = new Map<string, TimeZoneOption>();
    for (const option of [...allOptions, ...recentOptions, ...popularOptions])
      map.set(option.value.toLowerCase(), option);
    return map;
  }, [allOptions, popularOptions, recentOptions]);

  // thin grey scrollbar shows only while the list is being scrolled
  useScrollingClass(listRef);

  // open with the current zone in view
  useEffect(() => {
    if (!selected) return;
    const timeout = setTimeout(() => {
      const item = listRef.current?.querySelector(`[data-zone="${selected}"]`);
      item?.scrollIntoView({ block: "center" });
    });
    return () => clearTimeout(timeout);
  }, [selected]);

  function filter(value: string, query: string) {
    const option = optionsByValue.get(value.replace(RECENT_PREFIX, "").replace(POPULAR_PREFIX, ""));
    if (!option) return 0;
    // cmdk sorts by this score: abbreviations first, then names and cities starting with what was typed
    return scoreTimeZone(option, query) / 3;
  }

  function choose(timeZone: string) {
    addRecentTimeZone(timeZone);
    onSelect(timeZone);
  }

  function renderOption(option: TimeZoneOption, group: "all" | "popular" | "recent") {
    const isRecent = group === "recent";
    const prefix = group === "recent" ? RECENT_PREFIX : group === "popular" ? POPULAR_PREFIX : "";
    const isSelected = option.value === selected;
    const isDisabled = !isSelected && disabledTimeZones.includes(option.value);
    return (
      <CommandItem
        className={cn(
          "mr-2 flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
          isSelected
            ? "bg-primary text-white aria-selected:bg-primary aria-selected:text-white"
            : "aria-selected:bg-primary/20 hover:bg-primary/20",
          isDisabled && "cursor-default opacity-50 aria-selected:bg-transparent hover:bg-transparent"
        )}
        data-zone={group === "all" ? option.value : undefined}
        key={prefix + option.value}
        onSelect={() => !isDisabled && choose(option.value)}
        value={prefix + option.value}
      >
        <span
          className={cn(
            "w-[4.3rem] shrink-0 whitespace-nowrap text-xs tabular-nums",
            isSelected ? "text-white/75" : "text-text-light"
          )}
        >
          {option.offsetLabel}
        </span>
        <span className="min-w-0 flex-1 truncate">
          {option.name}
          <span className={isSelected ? "text-white/75" : "text-text-light"}> – {option.city}</span>
        </span>
        {option.value === eventTimeZone && (
          <span
            className={cn(
              "shrink-0 rounded px-1.5 py-0.5 text-2xs",
              isSelected ? "bg-white/20 text-white" : "bg-input text-text-light"
            )}
          >
            Event
          </span>
        )}
        {isSelected || isDisabled ? (
          <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
        ) : (
          isRecent && <History aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-text-light" />
        )}
      </CommandItem>
    );
  }

  const isSearching = search.trim() !== "";
  const showRecent = !isSearching && recentOptions.length > 0;
  const showPopular = !isSearching && popularOptions.length > 0;

  return (
    <Command filter={filter}>
      <CommandInput
        className="py-5 text-base sm:text-sm"
        onValueChange={setSearch}
        placeholder="Search city, zone or GMT offset"
        value={search}
      />
      <div className="grid-scrollbar max-h-[min(18rem,45dvh)] overflow-y-auto py-1" ref={listRef}>
        <CommandEmpty className="m-2 rounded-sm bg-input py-1.5 text-center text-xs">No time zones found</CommandEmpty>
        {showRecent && (
          <CommandGroup heading="Recent">{recentOptions.map((option) => renderOption(option, "recent"))}</CommandGroup>
        )}
        {showPopular && (
          <CommandGroup heading="Popular">
            {popularOptions.map((option) => renderOption(option, "popular"))}
          </CommandGroup>
        )}
        {(showRecent || showPopular) && <div className="mx-2 my-1 h-px bg-light-gray" />}
        <CommandGroup heading={isSearching ? undefined : "All time zones"}>
          {allOptions.map((option) => renderOption(option, "all"))}
        </CommandGroup>
      </div>
    </Command>
  );
}
