import { addMinutes, format, isValid, parse } from "date-fns";
import { Check, ChevronDown } from "lucide-react";
import { Dispatch, KeyboardEvent, SetStateAction, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useScrollingClass from "@/hooks/useScrollingClass";
import { TIME_SLOT_INTERVAL_MINUTES } from "@/store/eventDataSlice";
import { EVENT_TIME_FORMAT } from "@/types/Timeslot";
import { cn } from "@/utils/cn";
import { matchesTimeSearch } from "@/utils/timeSearch";

export const TIME_LABEL_FORMAT = "h:mm aa";
export const NEXT_DAY_MIDNIGHT_OPTION = {
  label: "12:00 am +1",
  value: "00:00:00"
};

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

function getTimeOptions(isStartTime: boolean): TimeOption[] {
  const startTime = new Date(0, 0, 0, 0, isStartTime ? 0 : 30);
  const endTime = new Date(0, 0, 0, 23, 30);

  const timeOptions: TimeOption[] = [];
  for (let currentTime = startTime; currentTime <= endTime;) {
    timeOptions.push({
      label: format(currentTime, TIME_LABEL_FORMAT).toLowerCase(),
      value: format(currentTime, EVENT_TIME_FORMAT)
    });
    currentTime = addMinutes(currentTime, TIME_SLOT_INTERVAL_MINUTES);
  }
  if (!isStartTime) timeOptions.push(NEXT_DAY_MIDNIGHT_OPTION);
  return timeOptions;
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

  const timeOptions = useMemo(() => getTimeOptions(isStartTime), [isStartTime]);

  // thin grey scrollbar shows only while the list is being scrolled
  useScrollingClass(commandGroupRef, undefined, open);

  useEffect(() => {
    // need setTimeout here to allow for the DOM to render CommandGroup
    const timeout = setTimeout(() => {
      if (commandGroupRef.current && open) {
        const selectedItem = commandGroupRef.current.querySelector(`[data-value="${selected}"]`);
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: "center", inline: "start" });
        }
      }
    });
    return () => clearTimeout(timeout);
  }, [open, selected]);

  function stepSelectedTime(direction: -1 | 1) {
    const currentIndex = timeOptions.findIndex(({ value }) => value === selected);
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), timeOptions.length - 1);
    if (currentIndex === -1 || nextIndex === currentIndex) return;
    onChange(timeOptions[nextIndex].value);
  }

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      stepSelectedTime(e.key === "ArrowDown" ? 1 : -1);
    }
  }

  const nextDayMidnight = (
    <span>
      12:00 AM <sup className="text-3xs">+1</sup>
    </span>
  );

  function isNextDayMidnight(value: string) {
    return value === NEXT_DAY_MIDNIGHT_OPTION.value && !isStartTime;
  }

  function convertValueToLabel(value: string) {
    if (isNextDayMidnight(value)) return NEXT_DAY_MIDNIGHT_OPTION.label;

    const parsedTime = parse(value, EVENT_TIME_FORMAT, new Date());
    if (!isValid(parsedTime)) return "";
    return format(parsedTime, TIME_LABEL_FORMAT).toUpperCase();
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={`${isStartTime ? "Start time" : "End time"}: ${convertValueToLabel(selected)}. Use the arrow keys to change.`}
          className="relative h-auto w-full p-0"
          onKeyDown={onTriggerKeyDown}
          type="button"
          variant="ghost"
        >
          <div
            className={cn(
              "peer box-border flex h-10 w-full min-w-0 cursor-pointer items-center rounded-md border border-[#E5E5E5] bg-white px-4 text-left text-sm",
              {
                "outline-red-500/40 focus-within:outline-red-500 hover:outline-red-500": error
              },
              {
                "outline-red-500": error && open
              }
            )}
          >
            <span className="flex w-full items-center justify-between">
              {isNextDayMidnight(selected) ? nextDayMidnight : convertValueToLabel(selected)}
              <ChevronDown
                aria-hidden="true"
                className={cn("shrink-0 text-black transition-transform duration-200", open && "rotate-180")}
                height={15}
                width={15}
              />
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mb-2 w-[140px] bg-background p-0 sm:w-[154px]">
        <Command
          filter={(value, search) =>
            matchesTimeSearch(convertValueToLabel(value), search, TIME_SLOT_INTERVAL_MINUTES) ? 1 : 0
          }
        >
          <CommandInput className="py-5 text-base sm:text-sm" onBlur={onBlur} placeholder="Type a time" />
          <CommandEmpty className="m-2 rounded-sm bg-gray-200 py-1.5 text-center text-xs">{INVALID_TIME} </CommandEmpty>
          <CommandGroup
            className="grid-scrollbar my-1 max-h-[105px] overflow-y-scroll sm:max-h-[150px] xl:max-h-[180px]"
            ref={commandGroupRef}
          >
            {timeOptions.map(({ label, value }) => {
              const isSelected = selected === value;
              return (
                <CommandItem
                  className={cn(
                    "my-[1px] mb-1 mr-2 flex cursor-pointer items-center justify-between text-sm",
                    isSelected
                      ? "bg-primary text-white aria-selected:bg-primary"
                      : "aria-selected:bg-primary/20 hover:bg-primary/20"
                  )}
                  data-value={value}
                  key={label}
                  onSelect={(v) => {
                    onChange(v);
                    setOpen(false);
                  }}
                  value={value}
                >
                  {isNextDayMidnight(value) ? nextDayMidnight : <span>{convertValueToLabel(value)}</span>}
                  <Check
                    aria-hidden="true"
                    className={cn("h-4 w-4 text-white", isSelected ? "opacity-100" : "opacity-0")}
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
