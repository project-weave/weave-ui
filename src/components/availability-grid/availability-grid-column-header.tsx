import { EventDate, EventTime, TimeSlot } from "@/app/(event)/[eventId]/page";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";

import { Button } from "../ui/button";
import { getTimeSlot } from "./availability-grid";

type AvailabilityGridColumnHeaderProps = {
  eventDate: EventDate;
  hasUserAddedAvailability: boolean;
  isDateGapRight: boolean;
  isViewMode: boolean;
  selectedTimeSlots: Set<TimeSlot>;
  setSelectedTimeSlots: Dispatch<SetStateAction<Set<TimeSlot>>>;
  sortedEventTimes: EventTime[];
};

export default function AvailabilityGridColumnHeader({
  eventDate,
  isDateGapRight,
  isViewMode,
  selectedTimeSlots,
  setSelectedTimeSlots,
  sortedEventTimes
}: AvailabilityGridColumnHeaderProps) {
  const parsedDate = parseISO(eventDate);

  const allTimeSlotsForDate = sortedEventTimes.map((eventTime) => getTimeSlot(eventTime, eventDate));
  const isAllTimeSlotForDateSelected = allTimeSlotsForDate.every((timeSlot) => selectedTimeSlots.has(timeSlot));

  function dateClickedHandler() {
    if (isViewMode) return;

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
      <motion.div whileTap={!isViewMode ? { scale: 0.9 } : {}}>
        <Button
          className={cn(
            "h-8 w-10 rounded-sm border-none bg-purple-100 text-lg font-semibold tracking-wide text-secondary transition-all hover:bg-purple-200 hover:bg-opacity-100",
            {
              "bg-primary-dark bg-opacity-100 text-white hover:bg-primary hover:bg-opacity-80":
                isAllTimeSlotForDateSelected
            },
            {
              "bg-background text-xl text-secondary hover:bg-background": isViewMode
            }
          )}
          onClick={dateClickedHandler}
        >
          {format(parsedDate, "d")}
        </Button>
      </motion.div>
    </div>
  );
}
