import useAvailabilityGridStore, { AvailabilityType, isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { EventDate, getTimeSlot } from "@/types/Event";
import { cn } from "@/utils/cn";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";

import { Button } from "../../ui/button";

type AvailabilityGridColumnHeaderProps = {
  eventDate: EventDate;
  hasDateGapRight: boolean;
};

export default function AvailabilityGridColumnHeader({
  eventDate,
  hasDateGapRight
}: AvailabilityGridColumnHeaderProps) {
  const { availabilityType, sortedEventTimes } = useAvailabilityGridStore((state) => state.eventData);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const [selectedTimeSlots, addSelectedTimeSlot, removeSelectedTimeSlot] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeSlots, state.addSelectedTimeSlots, state.removeSelectedTimeSlots])
  );
  const focusedDate = useAvailabilityGridStore((state) => state.focusedDate);

  const isDateFocused = focusedDate === eventDate;
  const parsedDate = parseISO(eventDate);

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
    <div className={cn("text-center", { "mr-2": hasDateGapRight })}>
      {availabilityType === AvailabilityType.SPECIFIC_DATES && (
        <>
          <h3 className=" font-semibold text-primary">{format(parsedDate, "EEE")}</h3>
          <div
            className={cn("m-auto flex w-fit items-center justify-center rounded-md border-2 border-transparent", {
              "border-secondary": isDateFocused
            })}
          >
            <MotionButton
              className={cn(
                "h-6 rounded-sm border-none bg-accent-light px-2 text-xs font-semibold tracking-wide text-secondary transition-all hover:bg-accent",
                {
                  "bg-primary text-white hover:bg-primary/80": isAllTimeSlotForDateSelected,
                  "cursor-default bg-background text-sm text-secondary hover:bg-background": isViewMode(mode)
                }
              )}
              onClick={dateClickedHandler}
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
              "mt-3 h-8 w-16 rounded-xl border-none bg-accent-light px-3 py-2 font-semibold tracking-wide transition-all hover:bg-accent",
              {
                "bg-primary text-white hover:bg-primary/80": isAllTimeSlotForDateSelected,
                "cursor-default bg-background text-lg text-secondary hover:bg-background": isViewMode(mode)
              }
            )}
            onClick={dateClickedHandler}
            whileTap={isEditMode(mode) ? { scale: 0.9 } : {}}
          >
            <time dateTime={eventDate}>{format(parsedDate, "EEE")}</time>
          </MotionButton>
        </div>
      )}
    </div>
  );
}
