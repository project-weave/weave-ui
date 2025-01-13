"use client";

import { Label } from "@radix-ui/react-label";
import { format, utcToZonedTime } from "date-fns-tz";
import { Check, ChevronUp } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn";

const TIME_ZONE_LABEL = "Time Zone";
const NO_TIME_ZONES_FOUND = "No Time Zones Found";

interface TimeZone {
  abbreviation: string;
  city: string;
  offset: string;
  queryLabel: string;
  value: string;
}

export interface TimeZoneDropdownProps {
  error: boolean;
  onChange: (timeZone: string) => void;
  selected: string;
  gridDropdown?: boolean;
  originalTimeZone?: string;
}

export default function TimeZoneDropdown({
  error,
  onChange,
  selected,
  gridDropdown,
  originalTimeZone
}: TimeZoneDropdownProps) {
  const commandGroupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZone>(toTimeZoneObject(selected));

  const allTimeZones = useMemo<TimeZone[]>(() => {
    const timeZones = Intl.supportedValuesOf("timeZone");
    return timeZones.map((timeZone) => toTimeZoneObject(timeZone)).sort((a, b) => a.city.localeCompare(b.city));
  }, []);

  useEffect(() => {
    if (gridDropdown) return;
    const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (allTimeZones.find((timeZone) => timeZone.value === detectedTimeZone)) {
      setSelectedTimeZone(toTimeZoneObject(detectedTimeZone));
    }
  }, [allTimeZones, gridDropdown]);

  useEffect(() => {
    setSelectedTimeZone(toTimeZoneObject(selected));
  }, [selected]);

  useEffect(() => {
    setTimeout(() => {
      if (commandGroupRef.current && open) {
        const selectedItem = commandGroupRef.current.querySelector(
          `[data-value="${selectedTimeZone.value.toLowerCase()}"]`
        );
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: "center", inline: "start" });
        }
      }
    });
  }, [open]);

  function toTimeZoneObject(timeZone: string): TimeZone {
    if (timeZone === "") {
      return {
        abbreviation: "",
        city: "",
        offset: "",
        queryLabel: "",
        value: ""
      };
    }

    const now = new Date();

    function getGMTOffset(timezone: string): string {
      const now = new Date();
      const zonedTime = utcToZonedTime(now, timezone);
      const offset = format(zonedTime, "xxx", { timeZone: timezone }); // 'xxx' gives the offset in ±HH:mm format
      return `GMT ${offset}`;
    }

    function getTimeZoneAbbreviation(timeZone: string): string {
      const timeZoneFormatter = new Intl.DateTimeFormat("en-US", {
        hour12: false,
        timeZone,
        timeZoneName: "short"
      });
      const timeZoneParts = timeZoneFormatter.formatToParts(now);

      return timeZoneParts.find((part) => part.type === "timeZoneName")?.value || timeZone;
    }

    function getTimeZoneCity(timeZone: string): string {
      return timeZone.replaceAll("_", " ").split("/").pop() ?? "";
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

  function getTimeZoneJSX(timeZone: TimeZone): ReactNode {
    let info: ReactNode = null;
    if (gridDropdown) {
      if (timeZone.value === originalTimeZone) {
        info = <span className="text-[0.6rem] ml-2 text-gray-400">(Event Default)</span>;
      }
    } else {
      info = <span className="text-[0.85rem] ml-2 text-gray-400">({timeZone.offset})</span>;
    }

    return (
      <span className="flex items-center">
        <span>{`${timeZone.abbreviation} - ${timeZone.value.replaceAll("_", " ").split("/").pop() ?? ""}`}</span>
        {info}
      </span>
    );
  }

  function timeZoneFilter(value: string, search: string): number {
    return toTimeZoneObject(value).queryLabel.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
  }

  const popoverDisplay = (
    <div className="relative w-full">
      {gridDropdown ? (
        <span className="flex w-full space-between items-center">
          <span className="text-xs text-secondary">{getTimeZoneJSX(selectedTimeZone)}</span>
          <ChevronUp
            height={15}
            width={15}
            className={cn("text-secondary align-right ml-2", open && "duration-200 rotate-180")}
          />
        </span>
      ) : (
        <div
          className={cn(
            "peer text-sm transform-none box-border cursor-pointer flex h-10 items-center rounded-2xl bg-background px-4 pb-2.5 pt-3 outline outline-2 outline-primary/40 focus-within:outline-primary hover:outline-primary",
            {
              "outline-primary": open,
              "outline-red-500/40 focus-within:outline-red-500 hover:outline-red-500": error
            },
            {
              "outline-red-500": error && open
            }
          )}
        >
          {getTimeZoneJSX(selectedTimeZone)}
        </div>
      )}
      {!gridDropdown && (
        <Label
          className={cn(
            "absolute font-medium left-1 top-1 z-10 origin-[0] -translate-y-4 scale-75 transform rounded-sm bg-background px-3 text-[.9rem] duration-300 sm:top-1 ",
            {
              "border-primary px-2": open
            }
          )}
        >
          {TIME_ZONE_LABEL}
        </Label>
      )}
    </div>
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>{popoverDisplay}</PopoverTrigger>
      <PopoverContent
        align={gridDropdown ? "start" : "center"}
        className={cn(
          "min-w-[20rem] sm:min-w-[22rem] border-2 border-primary p-0 mb-2",
          gridDropdown && "min-w-[16rem] sm:min-w-[16rem] w-[16rem] border-[1px] border-primary mb-1"
        )}
      >
        <Command className="bg-background" filter={(value, search) => timeZoneFilter(value, search)}>
          <CommandInput className={cn("py-5 text-sm", gridDropdown && "text-2xs h-7 py-0")} />
          <CommandList
            className={cn(
              "scrollbar-primary my-1 overflow-y-scroll max-h-[11rem] sm:max-h-[14rem]",
              gridDropdown && "max-h-[7rem] sm:max-h-[10rem]"
            )}
          >
            <CommandEmpty
              className={cn("my-1 mx-2 rounded-sm bg-gray-200 py-1.5 text-center text-xs", gridDropdown && "text-2xs")}
            >
              {NO_TIME_ZONES_FOUND}
            </CommandEmpty>
            <CommandGroup ref={commandGroupRef}>
              {allTimeZones.map((timeZone) => (
                <CommandItem
                  className={cn(
                    "my-[1px] cursor-pointer mb-1 mr-2 flex items-center justify-between border-[1px] border-transparent text-xs sm:text-sm hover:bg-primary/20 md:border-[1.5px]",
                    {
                      "border-primary": selectedTimeZone.value === timeZone.value
                    },
                    {
                      "text-2xs sm:text-2xs py-[2px] ml-[1px] md:border-[1px]": gridDropdown
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
                    className={cn(
                      "h-5 w-5",
                      selectedTimeZone.value === timeZone.value ? "opacity-100" : "opacity-0",
                      gridDropdown && "h-3 w-3"
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
