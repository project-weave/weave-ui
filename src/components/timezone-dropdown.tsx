"use client";

import { Check, ChevronDown } from "lucide-react";
import { KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useScrollingClass from "@/hooks/useScrollingClass";
import useWheelStep from "@/hooks/useWheelStep";
import { cn } from "@/utils/cn";
import { getGMTOffset, getTimeZoneAbbreviation, getTimeZoneCity } from "@/utils/timeZone";

const NO_TIME_ZONES_FOUND = "No Time Zones Found";

interface TimeZone {
  abbreviation: string;
  city: string;
  offset: string;
  queryLabel: string;
  value: string;
}

export interface TimeZoneDropdownProps {
  // compact shows only the abbreviation (e.g. "PT") in a small trigger, used above the grid's time column
  compact?: boolean;
  error: boolean;
  gridDropdown?: boolean;
  onChange: (timeZone: string) => void;
  originalTimeZone?: string;
  selected: string;
}

function toTimeZoneObject(timeZone: string, gridDropdown?: boolean, originalTimeZone?: string): TimeZone {
  if (timeZone === "") {
    return {
      abbreviation: "",
      city: "",
      offset: "",
      queryLabel: "",
      value: ""
    };
  }

  function getTimeZoneLabel(timeZone: string): string {
    let info = "";
    if (gridDropdown) {
      if (timeZone === originalTimeZone) {
        info = "(Event Default)";
      }
    } else {
      info = `(${getGMTOffset(timeZone)})`;
    }

    return `${getTimeZoneAbbreviation(timeZone)} - ${timeZone.replaceAll("_", " ").split("/").pop() ?? ""} ${info}`;
  }

  return {
    abbreviation: getTimeZoneAbbreviation(timeZone),
    city: getTimeZoneCity(timeZone),
    offset: getGMTOffset(timeZone),
    queryLabel: getTimeZoneLabel(timeZone),
    value: timeZone
  };
}

export default function TimeZoneDropdown({
  compact,
  error,
  gridDropdown,
  onChange,
  originalTimeZone,
  selected
}: TimeZoneDropdownProps) {
  const commandGroupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZone>(
    toTimeZoneObject(selected, gridDropdown, originalTimeZone)
  );

  const allTimeZones = useMemo<TimeZone[]>(() => {
    const timeZones = [
      ...new Set(
        ["UTC", ...Intl.supportedValuesOf("timeZone"), selected, originalTimeZone].filter(
          (zone): zone is string => !!zone
        )
      )
    ];

    return timeZones
      .map((timeZone) => toTimeZoneObject(timeZone, gridDropdown, originalTimeZone))
      .sort((a, b) => a.city.localeCompare(b.city));
  }, [gridDropdown, originalTimeZone, selected]);

  // thin grey scrollbar shows only while the list is being scrolled
  useScrollingClass(commandGroupRef, undefined, open);

  useEffect(() => {
    setSelectedTimeZone(toTimeZoneObject(selected, gridDropdown, originalTimeZone));
  }, [gridDropdown, originalTimeZone, selected]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (commandGroupRef.current && open) {
        const selectedItem = commandGroupRef.current.querySelector(
          `[data-value="${selectedTimeZone.value.toLowerCase()}"]`
        );
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: "center", inline: "start" });
        }
      }
    });
    return () => clearTimeout(timeout);
  }, [open, selectedTimeZone.value]);

  function getTimeZoneJSX(timeZone: TimeZone, isSelected = false): ReactNode {
    let info = "";
    if (gridDropdown) {
      if (timeZone.value === originalTimeZone) info = "(Event Default)";
    } else {
      info = `(${timeZone.offset})`;
    }

    return (
      <span className="flex min-w-0 items-center">
        <span className="truncate">{`${timeZone.abbreviation} - ${timeZone.city}`}</span>
        {info && <span className={cn("ml-2 shrink-0", isSelected ? "text-white/80" : "text-text-light")}>{info}</span>}
      </span>
    );
  }

  function timeZoneFilter(value: string, search: string): number {
    return toTimeZoneObject(value, gridDropdown, originalTimeZone)
      .queryLabel.toLowerCase()
      .includes(search.toLowerCase())
      ? 1
      : 0;
  }

  // same behaviour as the time picker: scroll over the closed dropdown or use the arrow keys to step through
  const triggerRef = useRef<HTMLButtonElement>(null);
  function stepSelectedTimeZone(direction: -1 | 1) {
    const currentIndex = allTimeZones.findIndex(({ value }) => value === selectedTimeZone.value);
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), allTimeZones.length - 1);
    if (currentIndex === -1 || nextIndex === currentIndex) return;
    setSelectedTimeZone(allTimeZones[nextIndex]);
    onChange(allTimeZones[nextIndex].value);
  }
  useWheelStep(triggerRef, stepSelectedTimeZone, !open);
  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (open || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
    e.preventDefault();
    stepSelectedTimeZone(e.key === "ArrowDown" ? 1 : -1);
  }

  const chevron = (
    <ChevronDown
      aria-hidden="true"
      className={cn("shrink-0 text-black transition-transform duration-200", open && "rotate-180")}
      height={compact ? 12 : 15}
      width={compact ? 12 : 15}
    />
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={`${gridDropdown ? "Display time zone" : "Event time zone"}: ${selectedTimeZone.queryLabel}. Scroll or use arrow keys to change.`}
          className={cn("relative h-auto p-0", compact ? "w-auto" : "w-full")}
          onKeyDown={onTriggerKeyDown}
          ref={triggerRef}
          type="button"
          variant="ghost"
        >
          {compact ? (
            // small version above the grid's time column: just the code, e.g. "PT"
            <span className="flex items-center gap-0.5 rounded-md bg-input px-1.5 py-1 text-2xs">
              {selectedTimeZone.abbreviation}
              {chevron}
            </span>
          ) : (
            <div
              className={cn(
                "peer box-border flex h-10 w-full min-w-0 cursor-pointer items-center rounded-xl bg-input px-4 text-left text-sm",
                {
                  "outline-red-500/40 focus-within:outline-red-500 hover:outline-red-500": error
                },
                {
                  "outline-red-500": error && open
                }
              )}
            >
              <span className="flex w-full min-w-0 items-center justify-between gap-2">
                {getTimeZoneJSX(selectedTimeZone)}
                {chevron}
              </span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={gridDropdown ? "start" : "center"}
        className={cn(
          "mb-2 bg-background p-0",
          gridDropdown ? "w-[18rem]" : "w-[var(--radix-popover-trigger-width)] min-w-[18rem]"
        )}
      >
        <Command filter={(value, search) => timeZoneFilter(value, search)}>
          <CommandInput className="py-5 text-base sm:text-sm" placeholder="Search time zones" />
          <CommandEmpty className="m-2 rounded-sm bg-gray-200 py-1.5 text-center text-xs">
            {NO_TIME_ZONES_FOUND}
          </CommandEmpty>
          <CommandGroup
            className="grid-scrollbar my-1 max-h-[105px] overflow-y-scroll sm:max-h-[150px] xl:max-h-[180px]"
            ref={commandGroupRef}
          >
            {allTimeZones.map((timeZone) => {
              const isSelected = selectedTimeZone.value === timeZone.value;
              return (
                <CommandItem
                  className={cn(
                    "my-[1px] mb-1 mr-2 flex cursor-pointer items-center justify-between text-sm",
                    isSelected
                      ? "bg-primary text-white aria-selected:bg-primary"
                      : "aria-selected:bg-primary/20 hover:bg-primary/20"
                  )}
                  data-value={timeZone.value}
                  key={timeZone.value}
                  onSelect={() => {
                    setSelectedTimeZone(timeZone);
                    onChange(timeZone.value);
                    setOpen(false);
                  }}
                  value={timeZone.value}
                >
                  {getTimeZoneJSX(timeZone, isSelected)}
                  <Check
                    aria-hidden="true"
                    className={cn("h-4 w-4 shrink-0 text-white", isSelected ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
