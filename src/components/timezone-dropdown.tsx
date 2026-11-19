"use client";

import { Check, ChevronDown } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

  function getTimeZoneJSX(timeZone: TimeZone): ReactNode {
    let info: ReactNode = null;
    if (gridDropdown) {
      if (timeZone.value === originalTimeZone) {
        info = <span className="ml-2 text-[0.7rem] text-text-light ">(Event Default)</span>;
      }
    } else {
      info = <span className="ml-2 text-[0.85rem] text-text-light ">({timeZone.offset})</span>;
    }

    return (
      <span className="mb-1 flex h-full items-center lg:mb-0">
        <span>{`${timeZone.abbreviation} - ${timeZone.value.replaceAll("_", " ").split("/").pop() ?? ""}`}</span>
        <span>{info}</span>
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

  const popoverDisplay = (
    <Button
      aria-label={`${gridDropdown ? "Display time zone" : "Event time zone"}: ${selectedTimeZone.queryLabel}`}
      className={cn(
        "peer box-border flex h-auto w-full transform-none cursor-pointer items-center rounded-xl bg-input px-4 py-2.5 text-sm",
        {
          "px-2.5 py-2 text-xs": gridDropdown,
          "w-auto gap-1 rounded-md px-1.5 py-1 text-2xs font-medium": compact,
          "outline-red-500/40 focus-within:outline-red-500 hover:outline-red-500": error
        },
        {
          "outline-red-500": error && open
        }
      )}
      type="button"
      variant="ghost"
    >
      <span className="flex w-full items-center justify-between">
        {compact ? <span>{selectedTimeZone.abbreviation}</span> : getTimeZoneJSX(selectedTimeZone)}
        <ChevronDown
          aria-hidden="true"
          className={cn("ml-2 shrink-0 text-black transition-transform duration-200", {
            "ml-0.5": compact,
            "rotate-180": open
          })}
          height={compact ? 12 : 15}
          width={compact ? 12 : 15}
        />
      </span>
    </Button>
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>{popoverDisplay}</PopoverTrigger>
      <PopoverContent
        align={gridDropdown ? "start" : "center"}
        className={cn(
          "mb-2 w-[var(--radix-popover-trigger-width)] min-w-[20rem] p-0",
          gridDropdown && "mb-1 w-[18rem] min-w-[18rem]"
        )}
      >
        <Command className="bg-background" filter={(value, search) => timeZoneFilter(value, search)}>
          <CommandInput className="py-5 text-sm" placeholder="Search time zones" />
          <CommandList
            className={cn(
              "scrollbar-primary my-1 max-h-[11rem] overflow-y-scroll sm:max-h-[14rem]",
              gridDropdown && "max-h-[14rem]"
            )}
          >
            <CommandEmpty className="mx-2 my-1 rounded-sm bg-gray-200 py-1.5 text-center text-xs">
              {NO_TIME_ZONES_FOUND}
            </CommandEmpty>
            <CommandGroup ref={commandGroupRef}>
              {allTimeZones.map((timeZone) => (
                <CommandItem
                  className={cn(
                    "my-[1px] mb-1 mr-2 flex cursor-pointer items-center justify-between text-xs sm:text-sm",
                    selectedTimeZone.value === timeZone.value
                      ? "bg-primary text-white aria-selected:bg-primary [&_*]:text-white"
                      : "aria-selected:bg-primary/20 hover:bg-primary/20",
                    {
                      "text-sm sm:text-sm": gridDropdown
                    }
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
                  {getTimeZoneJSX(timeZone)}
                  <Check
                    aria-hidden="true"
                    className={cn(
                      "h-5 w-5 shrink-0 text-white",
                      selectedTimeZone.value === timeZone.value ? "opacity-100" : "opacity-0",
                      gridDropdown && "h-4 w-4"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
