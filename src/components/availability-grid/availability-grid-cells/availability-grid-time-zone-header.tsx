"use client";

import { ArrowRight, Globe, Plus, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import TimeZoneList from "@/components/time-zone-list";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useAvailabilityGridStore, { getDisplayTimeZones, MAX_DISPLAY_TIME_ZONES } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { getTimeZoneOption } from "@/utils/timeZone";

const LIST_POPOVER = "w-[min(26rem,calc(100vw-2rem))] bg-background p-0";

/**
 * The grid's top-left corner: a "+" to add a time zone to compare (up to three), then one label per
 * time zone, each sitting right above its column of times. The primary zone is the one next to the grid.
 */
export default function AvailabilityGridTimeZoneHeader() {
  const zones = useAvailabilityGridStore(useShallow(getDisplayTimeZones));
  const eventTimeZone = useAvailabilityGridStore((state) => state.eventData.timeZone);
  const addTimeZone = useAvailabilityGridStore((state) => state.addTimeZone);
  const [addOpen, setAddOpen] = useState(false);
  const canAdd = zones.length < MAX_DISPLAY_TIME_ZONES;

  return (
    <div className="flex h-full w-full items-end bg-white pb-2">
      <div className="flex w-[var(--time-zone-add-slot)] shrink-0 justify-center">
        {canAdd && (
          <Popover onOpenChange={setAddOpen} open={addOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label="Add a time zone to compare"
                className="flex h-6 w-5 items-center justify-center rounded-md text-dark-gray transition-[background-color,color,transform] duration-150 hover:bg-input hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                title="Add a time zone"
                type="button"
              >
                <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className={LIST_POPOVER}>
              <TimeZoneList
                disabledTimeZones={zones}
                eventTimeZone={eventTimeZone}
                onSelect={(timeZone) => {
                  addTimeZone(timeZone);
                  setAddOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      {zones.map((timeZone, index) => (
        <TimeZoneLabel isPrimary={index === zones.length - 1} key={timeZone} timeZone={timeZone} zones={zones} />
      ))}
    </div>
  );
}

type TimeZoneLabelProps = {
  isPrimary: boolean;
  timeZone: string;
  zones: string[];
};

function TimeZoneLabel({ isPrimary, timeZone, zones }: TimeZoneLabelProps) {
  const eventTimeZone = useAvailabilityGridStore((state) => state.eventData.timeZone);
  const [makeTimeZonePrimary, removeTimeZone, replaceTimeZone] = useAvailabilityGridStore(
    useShallow((state) => [state.makeTimeZonePrimary, state.removeTimeZone, state.replaceTimeZone])
  );
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"change" | "menu">("menu");
  const option = getTimeZoneOption(timeZone);

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setView("menu");
  }

  return (
    <Popover onOpenChange={onOpenChange} open={open}>
      <PopoverTrigger asChild>
        <button
          aria-label={`${isPrimary ? "Primary" : "Extra"} time zone: ${option.name}, ${option.city}. Change or remove it.`}
          className={cn(
            "flex w-[var(--time-zone-column-width)] shrink-0 justify-end rounded-md py-1 pr-1.5 text-2xs transition-[background-color,color] duration-150 hover:bg-input hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isPrimary ? "font-medium text-black" : "text-dark-gray",
            open && "bg-input text-black"
          )}
          title={`${option.name} – ${option.city}`}
          type="button"
        >
          <span className="truncate">{option.abbreviation}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={view === "change" ? LIST_POPOVER : "w-64 bg-background p-1"}>
        {view === "change" ? (
          <TimeZoneList
            disabledTimeZones={zones.filter((zone) => zone !== timeZone)}
            eventTimeZone={eventTimeZone}
            onSelect={(newTimeZone) => {
              replaceTimeZone(timeZone, newTimeZone);
              setOpen(false);
            }}
            selected={timeZone}
          />
        ) : (
          <div className="flex flex-col text-sm">
            <p className="truncate px-2 pb-1.5 pt-1 text-xs text-text-light">
              <span className="tabular-nums">{option.offsetLabel}</span> · {option.name}
            </p>
            <MenuItem
              hint={option.city}
              icon={<Globe aria-hidden="true" className="h-4 w-4" />}
              label="Change time zone"
              onClick={() => setView("change")}
            />
            {!isPrimary && (
              <MenuItem
                icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
                label="Make primary"
                onClick={() => {
                  makeTimeZonePrimary(timeZone);
                  setOpen(false);
                }}
              />
            )}
            {zones.length > 1 && (
              <>
                <div className="mx-2 my-1 h-px bg-light-gray" />
                <MenuItem
                  destructive
                  icon={<X aria-hidden="true" className="h-4 w-4" />}
                  label="Remove from list"
                  onClick={() => {
                    removeTimeZone(timeZone);
                    setOpen(false);
                  }}
                />
              </>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

type MenuItemProps = {
  destructive?: boolean;
  hint?: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

function MenuItem({ destructive, hint, icon, label, onClick }: MenuItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        destructive ? "text-red-500 hover:bg-red-50" : "hover:bg-light-gray/60"
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="flex-1">{label}</span>
      {hint && <span className="max-w-[45%] truncate text-xs text-text-light">{hint}</span>}
    </button>
  );
}
