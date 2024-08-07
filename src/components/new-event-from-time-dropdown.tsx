import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn";
import { Label } from "@radix-ui/react-label";
import { addMinutes, format } from "date-fns";
import { Check } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export interface NewEventFromTimeDropdownProps {
  error: boolean;
  isStartTime: boolean;
  selectedTime: string;
  setSelectedTime: Dispatch<SetStateAction<string>>;
}

export const DROPDOWN_TIME_FORMAT = "h:mm a";
export const NEXT_DAY_MIDNIGHT_REPRESENTATION = "12:00 am +1";

const START_TIME_LABEL = "Start Time";
const END_TIME_LABEL = "End Time";
const INVALID_TIME = "Invalid time";

export default function NewEventFromTimeDropdown({
  error,
  isStartTime,
  selectedTime,
  setSelectedTime
}: NewEventFromTimeDropdownProps) {
  const [open, setOpen] = useState(false);
  const commandGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // neeed setTimeout here to allow for the DOM to render CommandGroup
    setTimeout(() => {
      if (commandGroupRef.current && open) {
        const selectedItem = commandGroupRef.current.querySelector(`[data-value="${selectedTime}"]`);
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

    const patterns: string[] = [];
    if (search.includes(":")) {
      if (search.split(":").length > 2) return 0;
      const [hours, minutes] = search.split(":");
      patterns.push(`${hours}:${minutes}${ampm}`);
    } else {
      const len = search.length;
      if (len === 1) {
        patterns.push(`${search}:00${ampm}`);
      } else if (len === 2) {
        patterns.push(`${search}:00${ampm}`);
        patterns.push(`${search[0]}:${search[1]}0${ampm}`);
      } else if (len === 3) {
        patterns.push(`${search[0]}:${search.slice(1, 3)}${ampm}`);
        patterns.push(`${search.slice(0, 2)}:${search[2]}0${ampm}`);
      } else if (len === 4) {
        patterns.push(`${search.slice(0, 2)}:${search.slice(2, 4)}${ampm}`);
      }
    }
    return patterns.some((pattern) => value.startsWith(pattern)) ? 1 : 0;
  }

  const startTime = new Date(0, 0, 0, 0, isStartTime ? 0 : 30);
  const endTime = new Date(0, 0, 0, 23, 30);

  const times: string[] = [];
  let currentTime = startTime;
  const interval = 30;

  while (currentTime <= endTime) {
    const time = format(currentTime, DROPDOWN_TIME_FORMAT).toLowerCase();
    times.push(time);
    currentTime = addMinutes(currentTime, interval);
  }
  if (!isStartTime) {
    times.push(NEXT_DAY_MIDNIGHT_REPRESENTATION);
  }

  const nextDayMidnight = (
    <span>
      12:00 am <sup>+1</sup>
    </span>
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <div
            className={cn(
              "peer box-border flex h-10 items-center rounded-2xl bg-background px-4 pb-2.5 pt-3 outline outline-2 outline-primary/40 focus-within:outline-primary hover:outline-primary",
              {
                "outline-primary": open,
                "outline-red-600/40 focus-within:outline-red-600 hover:outline-red-600": error
              }
            )}
          >
            {selectedTime === NEXT_DAY_MIDNIGHT_REPRESENTATION ? nextDayMidnight : <span>{selectedTime}</span>}
          </div>
          <Label
            className={cn(
              "absolute left-1 top-1 z-10 origin-[0] -translate-y-4 scale-75 transform rounded-sm bg-background px-3 text-[.9rem] duration-300 sm:top-1 ",
              {
                "border-primary px-2": open
              }
            )}
          >
            {isStartTime ? START_TIME_LABEL : END_TIME_LABEL}
          </Label>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] border-2 border-primary p-0 sm:w-[154px]">
        <Command className="bg-background" filter={(value, search) => timeFilter(value, search)}>
          <CommandInput className="border-primary py-5 text-sm" />
          <CommandEmpty className="m-2 rounded-sm bg-gray-200 py-1.5 text-center text-xs">{INVALID_TIME} </CommandEmpty>
          <CommandGroup
            className="my-1 max-h-[105px] overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary sm:max-h-[150px] xl:max-h-[180px]"
            ref={commandGroupRef}
          >
            {times.map((time) => {
              return (
                <CommandItem
                  className={cn(
                    "my-[1px] mb-1 mr-2 flex items-center justify-between border-[1px] border-transparent text-sm hover:bg-primary/20 md:border-[1.5px] ",
                    {
                      "border-primary ": selectedTime === time
                    }
                  )}
                  data-value={time}
                  key={time}
                  onSelect={(t) => {
                    setSelectedTime(t);
                    setOpen(false);
                  }}
                  value={time}
                >
                  {time === NEXT_DAY_MIDNIGHT_REPRESENTATION ? nextDayMidnight : <span>{time}</span>}
                  <Check className={cn("h-4 w-4 ", selectedTime === time ? "opacity-100" : "opacity-0")} />
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
