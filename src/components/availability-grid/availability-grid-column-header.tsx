import { cn } from "@/lib/utils";
import {
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

export default function AvailabilityGridColumnHeader({
  eventDate,
  isDateGapRight,
  mode,
  selectedTimeSlots,
  setSelectedTimeSlots,
  sortedEventTimes
}: AvailabilityGridColumnHeaderProps) {
  const parsedDate = parseISO(eventDate);

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
  return (
    <div className={cn("text-center", { "mr-2": isDateGapRight })}>
      <h3 className="pb-0 text-lg font-bold text-primary">{format(parsedDate, "MMM")}</h3>
      <h3 className={cn("mb-2 text-sm font-medium leading-4 text-secondary-light")}>{format(parsedDate, "EEE")}</h3>
      <motion.div className="outline-none" whileTap={isEditMode(mode) ? { scale: 0.9 } : {}}>
        <Button
          className={cn(
            "h-8 w-10 rounded-sm  border-none bg-purple-100 text-lg font-semibold tracking-wide text-secondary transition-all hover:bg-purple-200 hover:bg-opacity-100",
            {
              "bg-primary-dark bg-opacity-100 text-white hover:bg-primary hover:bg-opacity-80":
                isAllTimeSlotForDateSelected
            },
            {
              "cursor-default bg-background text-xl text-secondary hover:bg-background": isViewMode(mode)
            }
          )}
          onClick={dateClickedHandler}
        >
          <time dateTime={eventDate}>{format(parsedDate, "d")}</time>
        </Button>
      </motion.div>
    </div>
  );
}
