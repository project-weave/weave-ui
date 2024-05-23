import useAvailabilityGridStore, {
  AvailabilityType,
  EventDate,
  EventTime,
  getTimeSlot,
  isEditMode,
  isViewMode
} from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "../ui/button";

type AvailabilityGridColumnHeaderProps = {
  availabilityType: AvailabilityType;
  eventDate: EventDate;
  hasUserAddedAvailability: boolean;
  isDateGapRight: boolean;
  sortedEventTimes: EventTime[];
};

const AvailabilityGridColumnHeader = ({
  availabilityType,
  eventDate,
  isDateGapRight,
  sortedEventTimes
}: AvailabilityGridColumnHeaderProps) => {
  const parsedDate = parseISO(eventDate);

  const mode = useAvailabilityGridStore((state) => state.mode);
  const [selectedTimeSlots, addSelectedTimeSlot, removeSelectedTimeSlot] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeSlots, state.addSelectedTimeSlots, state.removeSelectedTimeSlots])
  );
  const focusedDate = useAvailabilityGridStore((state) => state.focusedDate);
  const isDateFocused = focusedDate === eventDate;

  const allTimeSlotsForDate = sortedEventTimes.map((eventTime) => getTimeSlot(eventTime, eventDate));
  const isAllTimeSlotForDateSelected = allTimeSlotsForDate.every((timeSlot) => selectedTimeSlots.includes(timeSlot));

  function dateClickedHandler() {
    if (isViewMode(mode)) return;
    if (isAllTimeSlotForDateSelected) {
      removeSelectedTimeSlot(allTimeSlotsForDate);
    } else {
      addSelectedTimeSlot(allTimeSlotsForDate);
    }
  }

  const MotionButton = motion(Button);

  return (
    <div className={cn("text-center", { "mr-2": isDateGapRight })}>
      {availabilityType === AvailabilityType.SPECIFIC_DATES && (
        <>
          <h3 className="text-sm font-semibold text-primary">{format(parsedDate, "EEE")}</h3>
          <div
            className={cn("m-auto flex w-fit items-center justify-center rounded-md border-2 border-transparent", {
              "border-secondary": isDateFocused
            })}
          >
            <MotionButton
              className={cn(
                "h-6 rounded-sm border-none bg-accent-light px-2 text-2xs font-semibold tracking-wide transition-all",
                {
                  "bg-primary": isAllTimeSlotForDateSelected,
                  "cursor-default bg-background text-xs text-secondary hover:bg-background": isViewMode(mode)
                }
              )}
              onClick={dateClickedHandler}
              variant={isAllTimeSlotForDateSelected ? "default" : "outline"}
              whileTap={isEditMode(mode) ? { scale: 0.9 } : {}}
            >
              <time dateTime={eventDate}>{format(parsedDate, "MMM d")}</time>
            </MotionButton>
          </div>
        </>
      )}
      {availabilityType === AvailabilityType.DAYS_OF_WEEK && (
        <div>
          {/* <h3 className="py-3 text-xl font-semibold text-secondary">{format(parsedDate, "EEE")}</h3> */}
          <MotionButton
            className={cn(
              "mt-2 h-8 w-10 rounded-xl border-none bg-accent-light px-12 py-5 text-xl font-semibold tracking-wide transition-all",
              {
                "bg-primary": isAllTimeSlotForDateSelected,
                "cursor-default bg-background text-xl text-secondary hover:bg-background": isViewMode(mode)
              }
            )}
            onClick={dateClickedHandler}
            variant={isAllTimeSlotForDateSelected ? "default" : "outline"}
            whileTap={isEditMode(mode) ? { scale: 0.9 } : {}}
          >
            <time dateTime={eventDate}>{format(parsedDate, "EEE")}</time>
          </MotionButton>
        </div>
      )}
    </div>
  );
};

export default React.memo(AvailabilityGridColumnHeader);
