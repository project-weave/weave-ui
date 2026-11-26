"use client";

import { Check, History } from "lucide-react";
import { useCallback, useMemo } from "react";

import { POPULAR_TIME_ZONES } from "@/components/time-zone-list";
import Combobox, { ComboboxOption } from "@/components/ui/combobox";
import { cn } from "@/utils/cn";
import {
  addRecentTimeZone,
  getAllTimeZoneOptions,
  getRecentTimeZones,
  getTimeZoneOption,
  isSupportedTimeZone,
  searchTimeZones,
  TimeZoneOption
} from "@/utils/timeZone";

export interface TimeZoneDropdownProps {
  error: boolean;
  onChange: (timeZone: string) => void;
  selected: string;
}

type TimeZoneComboboxOption = { isRecent: boolean; zone: TimeZoneOption } & ComboboxOption;

function toComboboxOption(zone: TimeZoneOption, group: string, isRecent = false): TimeZoneComboboxOption {
  return { group, isRecent, key: `${group}:${zone.value}`, value: zone.value, zone };
}

// The event time zone field on the create page: type to search ("p" lists PST, PDT…) or pick from the list.
export default function TimeZoneDropdown({ error, onChange, selected }: TimeZoneDropdownProps) {
  const allZones = useMemo(() => {
    const zones = getAllTimeZoneOptions();
    if (!selected || !isSupportedTimeZone(selected) || zones.some((zone) => zone.value === selected)) return zones;
    return [...zones, getTimeZoneOption(selected)];
  }, [selected]);

  const getOptions = useCallback(
    (query: string): TimeZoneComboboxOption[] => {
      if (query.trim() !== "") return searchTimeZones(allZones, query).map((zone) => toComboboxOption(zone, "Results"));
      const recent = getRecentTimeZones();
      const popular = POPULAR_TIME_ZONES.filter((zone) => isSupportedTimeZone(zone) && !recent.includes(zone));
      return [
        ...recent.map((zone) => toComboboxOption(getTimeZoneOption(zone), "Recent", true)),
        ...popular.map((zone) => toComboboxOption(getTimeZoneOption(zone), "Popular")),
        ...allZones.map((zone) => toComboboxOption(zone, "All time zones"))
      ];
    },
    [allZones]
  );

  return (
    <Combobox<TimeZoneComboboxOption>
      ariaLabel="Event time zone. Type to search."
      displayValue={(value) => {
        if (!value) return "";
        const zone = getTimeZoneOption(value);
        return `${zone.name} – ${zone.city}`;
      }}
      emptyMessage="No time zones found"
      error={error}
      getOptions={getOptions}
      onChange={(timeZone) => {
        addRecentTimeZone(timeZone);
        onChange(timeZone);
      }}
      placeholder="Search time zones"
      renderOption={({ isRecent, zone }, { isSelected }) => (
        <span className="flex w-full min-w-0 items-center gap-2">
          <span
            className={cn(
              "w-[4.3rem] shrink-0 whitespace-nowrap text-xs tabular-nums",
              isSelected ? "text-white/75" : "text-text-light"
            )}
          >
            {zone.offsetLabel}
          </span>
          <span className="min-w-0 flex-1 truncate">
            {zone.name}
            <span className={isSelected ? "text-white/75" : "text-text-light"}> – {zone.city}</span>
          </span>
          {isSelected ? (
            <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
          ) : (
            isRecent && <History aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-text-light" />
          )}
        </span>
      )}
      showChevron
      value={selected}
    />
  );
}
