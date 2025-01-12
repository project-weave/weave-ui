import { Label } from "@radix-ui/react-label";
import { addMinutes, format, isValid, parse } from "date-fns";
import { Check } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TIME_SLOT_INTERVAL_MINUTES } from "@/store/eventDataSlice";
import { EVENT_TIME_FORMAT } from "@/types/Timeslot";
import { cn } from "@/utils/cn";

export const TIME_LABEL_FORMAT = "h:mm aa";
export const NEXT_DAY_MIDNIGHT_OPTION = {
  label: "12:00 am +1",
  value: "00:00:00"
};

const START_TIME_LABEL = "Start Time";
const END_TIME_LABEL = "End Time";
const INVALID_TIME = "Invalid time";

type TimeOption = {
  label: string;
  value: string;
};

export interface NewEventFromTimeDropdownProps {
  error: boolean;
  isStartTime: boolean;
  onBlur: () => void;
  onChange: Dispatch<SetStateAction<string>>;
  selected: string;
}

export default function NewEventFromTimeDropdown({
  error,
  isStartTime,
  onBlur,
  onChange,
  selected
}: NewEventFromTimeDropdownProps) {
  const [open, setOpen] = useState(false);
  const commandGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // need setTimeout here to allow for the DOM to render CommandGroup
    setTimeout(() => {
      if (commandGroupRef.current && open) {
        const selectedItem = commandGroupRef.current.querySelector(`[data-value="${selected}"]`);
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: "center", inline: "start" });
        }
      }
    });
  }, [open]);

  function timeFilter(value: string, search: string) {
    search = search.trim().toLowerCase();
    value = value.toLowerCase();

    const ampmMatch = search.match(/(a|p)m?$/);
    const ampm = ampmMatch ? ` ${ampmMatch[0]}` : "";
    search = search.replace(/(a|p)m?$/, "").trim();

    const minutesPatterns: string[] = [];
    for (let i = 0; i < 60; i += TIME_SLOT_INTERVAL_MINUTES) {
      minutesPatterns.push(i.toString().padEnd(2, "0"));
    }

    const patterns: string[] = [];
    if (search.includes(":")) {
      if (search.split(":").length > 2) return 0;
      const [hours, minutes] = search.split(":");
      patterns.push(`${hours}:${minutes}${ampm}`);
    } else {
      const len = search.length;
      if (len === 1) {
        minutesPatterns.forEach((minutes) => {
          patterns.push(`${search}:${minutes}${ampm}`);
        });
        if (search === "1" && !ampmMatch) {
          [1, 2].forEach((hour) => {
            minutesPatterns.forEach((minutes) => {
              patterns.push(`1${hour}:${minutes}${ampm}`);
            });
          });
        }
      } else if (len === 2) {
        minutesPatterns.forEach((minutes) => {
          patterns.push(`${search}:${minutes}${ampm}`);
        });
        patterns.push(`${search[0]}:${search[1]}0${ampm}`);
      } else if (len === 3) {
        patterns.push(`${search[0]}:${search.slice(1, 3)}${ampm}`);
        patterns.push(`${search.slice(0, 2)}:${search[2]}0${ampm}`);
      } else if (len === 4) {
        patterns.push(`${search.slice(0, 2)}:${search.slice(2, 4)}${ampm}`);
      }
    }
    return patterns.some((pattern) => convertValueToLabel(value).startsWith(pattern)) ? 1 : 0;
  }

  const startTime = new Date(0, 0, 0, 0, isStartTime ? 0 : 30);
  const endTime = new Date(0, 0, 0, 23, 30);

  const timeOptions: TimeOption[] = [];
  let currentTime = startTime;
  const interval = TIME_SLOT_INTERVAL_MINUTES;

  while (currentTime <= endTime) {
    const timeOption: TimeOption = {
      label: format(currentTime, TIME_LABEL_FORMAT).toLowerCase(),
      value: format(currentTime, EVENT_TIME_FORMAT)
    };
    timeOptions.push(timeOption);

    currentTime = addMinutes(currentTime, interval);
  }
  if (!isStartTime) {
    timeOptions.push(NEXT_DAY_MIDNIGHT_OPTION);
  }

  const nextDayMidnight = (
    <span>
      12:00 am <sup>+1</sup>
    </span>
  );

  function isNextDayMidnight(value: string) {
    return value === NEXT_DAY_MIDNIGHT_OPTION.value && !isStartTime;
  }

  function convertValueToLabel(value: string) {
    if (isNextDayMidnight(value)) return NEXT_DAY_MIDNIGHT_OPTION.label;

    const parsedTime = parse(value, EVENT_TIME_FORMAT, new Date());
    if (!isValid(parsedTime)) return "";
    return format(parsedTime, TIME_LABEL_FORMAT).toLowerCase();
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <div
            className={cn(
              "peer box-border cursor-pointer flex h-10 items-center rounded-2xl bg-background px-4 pb-2.5 pt-3 outline outline-2 outline-primary/40 focus-within:outline-primary hover:outline-primary",
              {
                "outline-primary": open,
                "outline-red-500/40 focus-within:outline-red-500 hover:outline-red-500": error
              },
              {
                "outline-red-500": error && open
              }
            )}
          >
            {isNextDayMidnight(selected) ? nextDayMidnight : <span>{convertValueToLabel(selected)}</span>}
          </div>
          <Label
            className={cn(
              "absolute font-medium left-1 top-1 z-10 origin-[0] -translate-y-4 scale-75 transform rounded-sm bg-background px-3 text-[.9rem] duration-300 sm:top-1 ",
              {
                "border-primary px-2": open
              }
            )}
          >
            {isStartTime ? START_TIME_LABEL : END_TIME_LABEL}
          </Label>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] border-2 border-primary p-0 mb-2 bg-background sm:w-[154px]">
        <Command filter={(value, search) => timeFilter(value, search)}>
          <CommandInput className="border-primary py-5 text-sm" onBlur={onBlur} />
          <CommandEmpty className="m-2 rounded-sm bg-gray-200 py-1.5 text-center text-xs">{INVALID_TIME} </CommandEmpty>
          <CommandGroup
            className="scrollbar-primary my-1 max-h-[105px] overflow-y-scroll sm:max-h-[150px] xl:max-h-[180px]"
            ref={commandGroupRef}
          >
            {timeOptions.map(({ label, value }) => {
              return (
                <CommandItem
                  className={cn(
                    "my-[1px] cursor-pointer mb-1 mr-2 flex items-center justify-between border-[1px] border-transparent text-sm hover:bg-primary/20 md:border-[1.5px] ",
                    {
                      "border-primary ": selected === value
                    }
                  )}
                  data-value={value}
                  key={label}
                  onSelect={(v) => {
                    onChange(v);
                    setOpen(false);
                  }}
                  // using label as value to allow for filtering by label
                  value={value}
                >
                  {isNextDayMidnight(value) ? nextDayMidnight : <span>{convertValueToLabel(value)}</span>}
                  <Check className={cn("h-4 w-4 ", selected === value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              );
              2;
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
