"use client";

import { ChevronDown } from "lucide-react";
import { KeyboardEvent, useMemo, useState } from "react";

import TimeZoneList from "@/components/time-zone-list";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn";
import { getAllTimeZoneOptions, getTimeZoneOption } from "@/utils/timeZone";

export interface TimeZoneDropdownProps {
  error: boolean;
  onChange: (timeZone: string) => void;
  selected: string;
}

// The event time zone picker on the create event page.
export default function TimeZoneDropdown({ error, onChange, selected }: TimeZoneDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = useMemo(() => (selected ? getTimeZoneOption(selected) : null), [selected]);

  // same behaviour as the time picker: the arrow keys step through while the dropdown is closed
  function stepSelectedTimeZone(direction: -1 | 1) {
    const options = getAllTimeZoneOptions();
    const currentIndex = options.findIndex(({ value }) => value === selected);
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), options.length - 1);
    if (currentIndex === -1 || nextIndex === currentIndex) return;
    onChange(options[nextIndex].value);
  }
  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (open || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
    e.preventDefault();
    stepSelectedTimeZone(e.key === "ArrowDown" ? 1 : -1);
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={`Event time zone: ${selectedOption ? `${selectedOption.name}, ${selectedOption.city}` : "none"}. Use the arrow keys to change.`}
          className="relative h-auto w-full p-0"
          onKeyDown={onTriggerKeyDown}
          type="button"
          variant="ghost"
        >
          <div
            className={cn(
              "peer box-border flex h-10 w-full min-w-0 cursor-pointer items-center rounded-md border border-[#E5E5E5] bg-white px-4 text-left text-sm",
              { "outline-red-500/40 focus-within:outline-red-500 hover:outline-red-500": error },
              { "outline-red-500": error && open }
            )}
          >
            <span className="flex w-full min-w-0 items-center justify-between gap-2">
              {selectedOption && (
                <span className="flex min-w-0 items-center gap-3">
                  <span className="shrink-0 tabular-nums text-text-light">{selectedOption.offsetLabel}</span>
                  <span className="truncate">
                    {selectedOption.name}
                    <span className="text-text-light"> – {selectedOption.city}</span>
                  </span>
                </span>
              )}
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
      <PopoverContent className="mb-2 w-[min(26rem,calc(100vw-2rem))] min-w-[var(--radix-popover-trigger-width)] bg-background p-0">
        <TimeZoneList
          onSelect={(timeZone) => {
            onChange(timeZone);
            setOpen(false);
          }}
          selected={selected}
        />
      </PopoverContent>
    </Popover>
  );
}
