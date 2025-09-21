"use client";

import { Check, ChevronDown } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

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
  error: boolean;
  gridDropdown?: boolean;
  onChange: (timeZone: string) => void;
  originalTimeZone?: string;
  selected: string;
}

export default function TimeZoneDropdown({
  error,
  gridDropdown,
  onChange,
  originalTimeZone,
  selected
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
    return toTimeZoneObject(value).queryLabel.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
  }

  const popoverDisplay = (
    <div
      className={cn(
        "ext-sm peer box-border flex transform-none cursor-pointer items-center rounded-xl bg-input px-4 py-2.5",
        {
          "px-2.5 py-2 text-xs": gridDropdown,
          "outline-primary": open,
          "outline-red-500/40 focus-within:outline-red-500 hover:outline-red-500": error
        },
        {
          "outline-red-500": error && open
        }
      )}
    >
      <span className="flex w-full items-center justify-between">
        {getTimeZoneJSX(selectedTimeZone)}
        <ChevronDown className="ml-2 text-black" height={15} width={15} />
      </span>
    </div>
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>{popoverDisplay}</PopoverTrigger>
      <PopoverContent
        align={gridDropdown ? "start" : "center"}
        className={cn(
          "mb-2 min-w-[20rem] p-0 sm:min-w-[22rem]",
          gridDropdown && "mb-1 w-[16rem] min-w-[16rem] border-[1px] border-primary sm:min-w-[16rem]"
        )}
      >
        <Command className="bg-background" filter={(value, search) => timeZoneFilter(value, search)}>
          <CommandInput className={cn("py-5 text-sm", gridDropdown && "h-7 py-0 text-2xs")} />
          <CommandList
            className={cn(
              "scrollbar-primary my-1 max-h-[11rem] overflow-y-scroll sm:max-h-[14rem]",
              gridDropdown && "max-h-[7rem] sm:max-h-[10rem]"
            )}
          >
            <CommandEmpty
              className={cn("mx-2 my-1 rounded-sm bg-gray-200 py-1.5 text-center text-xs", gridDropdown && "text-2xs")}
            >
              {NO_TIME_ZONES_FOUND}
            </CommandEmpty>
            <CommandGroup ref={commandGroupRef}>
              {allTimeZones.map((timeZone) => (
                <CommandItem
                  className={cn(
                    "my-[1px] mb-1 mr-2 flex cursor-pointer items-center justify-between border-[1px] border-transparent text-xs hover:bg-primary/20 sm:text-sm md:border-[1.5px]",
                    {
                      "border-primary": selectedTimeZone.value === timeZone.value
                    },
                    {
                      "ml-[1px] py-[2px] text-2xs sm:text-2xs md:border-[1px]": gridDropdown
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
