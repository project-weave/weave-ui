import { cn } from "@/lib/utils";
import useAvailabilityGridStore, {
  AvailabilityGridMode,
  EventDate,
  EventTime,
  getTimeSlot,
  isEditMode,
  isViewMode,
  TimeSlot
} from "@/store/availabilityGridStore";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";
import React from "react";

import { Button } from "../ui/button";

type AvailabilityGridColumnHeaderProps = {
  eventDate: EventDate;
  hasUserAddedAvailability: boolean;
  isDateGapRight: boolean;
  mode: AvailabilityGridMode;
  selectedTimeSlots: Set<TimeSlot>;
  setSelectedTimeSlots: Dispatch<SetStateAction<Set<TimeSlot>>>;
  sortedEventTimes: EventTime[];
};

const AvailabilityGridColumnHeader = ({
  eventDate,
  isDateGapRight,
  mode,
  selectedTimeSlots,
  setSelectedTimeSlots,
  sortedEventTimes
}: AvailabilityGridColumnHeaderProps) => {
  const parsedDate = parseISO(eventDate);

  const focusedDate = useAvailabilityGridStore((state) => state.focusedDate);
  const isDateFocused = focusedDate === eventDate;

  const allTimeSlotsForDate = sortedEventTimes.map((eventTime) => getTimeSlot(eventTime, eventDate));
  const isAllTimeSlotForDateSelected = allTimeSlotsForDate.every((timeSlot) => selectedTimeSlots.has(timeSlot));

  function dateClickedHandler() {
    if (isViewMode(mode)) return;

    setSelectedTimeSlots((prevSelected) => {
      if (isAllTimeSlotForDateSelected) {
        return new Set([...prevSelected].filter((timeSlot) => !allTimeSlotsForDate.includes(timeSlot)));
      } else {
        return new Set([...prevSelected, ...allTimeSlotsForDate]);
      }
    });
  }

  const MotionButton = motion(Button);

  return (
    <div className={cn("text-center", { "mr-2": isDateGapRight })}>
      <h3 className="pb-0 text-lg font-bold text-primary">{format(parsedDate, "MMM")}</h3>
      <h3 className="mb-[5px] text-sm font-medium leading-4 text-secondary-light">{format(parsedDate, "EEE")}</h3>
      <div
        className={cn("m-auto flex h-9 w-11 items-center justify-center rounded-md border-2 border-transparent", {
          "border-secondary": isDateFocused
        })}
      >
        <MotionButton
          className={cn("h-8 w-10 rounded-sm border-none text-lg font-semibold tracking-wide transition-all", {
            "cursor-default bg-background text-xl text-secondary hover:bg-background": isViewMode(mode)
          })}
          onClick={dateClickedHandler}
          variant={isAllTimeSlotForDateSelected ? "dark" : "outline"}
          whileTap={isEditMode(mode) ? { scale: 0.9 } : {}}
        >
          <time dateTime={eventDate}>{format(parsedDate, "d")}</time>
        </MotionButton>
      </div>
    </div>
  );
};

export default React.memo(AvailabilityGridColumnHeader);
