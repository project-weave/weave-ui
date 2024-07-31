import useAvailabilityGridStore, { AvailabilityType, isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { EventDate, getDateFromTimeSlot, getTimeSlot } from "@/types/Event";
import { cn } from "@/utils/cn";
import { format, isValid, parseISO, startOfToday } from "date-fns";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";

import { Button } from "../../ui/button";

type AvailabilityGridColumnHeaderProps = {
  borderXSizeStyles: string;
  cellWidth: string;
  eventDate: EventDate;
};

export default function AvailabilityGridColumnHeader({
  borderXSizeStyles,
  cellWidth,
  eventDate
}: AvailabilityGridColumnHeaderProps) {
  const { availabilityType, sortedEventTimes } = useAvailabilityGridStore((state) => state.eventData);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const [selectedTimeSlots, addSelectedTimeSlot, removeSelectedTimeSlot] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeSlots, state.addSelectedTimeSlots, state.removeSelectedTimeSlots])
  );

  const isDateHovered = useAvailabilityGridStore((state) => eventDate === getDateFromTimeSlot(state.hoveredTimeSlot));
  const isDateFocused = useAvailabilityGridStore(
    (state) =>
      eventDate === state.focusedDate &&
      (state.hoveredTimeSlot === null || eventDate === getDateFromTimeSlot(state.hoveredTimeSlot))
  );

  const parsedDate = isValid(parseISO(eventDate)) ? parseISO(eventDate) : startOfToday();

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
    <div
      className={cn("flex flex-col items-center justify-center border-transparent bg-background", borderXSizeStyles)}
      style={{ width: cellWidth }}
    >
      {availabilityType === AvailabilityType.SPECIFIC_DATES && (
        <h3 className="text-sm font-semibold text-primary xl:text-base">{format(parsedDate, "EEE")}</h3>
      )}
      <div
        className={cn("border-b-2 border-transparent text-center xl:w-16", {
          "border-b-2 border-secondary": (isDateHovered || isDateFocused) && isViewMode(mode),
          "pb-1": availabilityType === AvailabilityType.SPECIFIC_DATES
        })}
      >
        {availabilityType === AvailabilityType.SPECIFIC_DATES && (
          <MotionButton
            className={cn(
              "mt-1 h-6 w-[3.4rem] whitespace-nowrap rounded-sm border-2 border-transparent bg-accent-light text-xs font-semibold tracking-wide text-secondary transition-all hover:bg-accent xl:w-[3.8rem] xl:text-sm",
              {
                "bg-primary text-white hover:bg-primary-hover": isAllTimeSlotForDateSelected,
                "mt-0 cursor-default bg-background text-sm text-secondary hover:bg-background xl:text-base":
                  isViewMode(mode),
                "ring-[1.5px] ring-primary ring-offset-1": (isDateHovered || isDateFocused) && isEditMode(mode)
              }
            )}
            onClick={dateClickedHandler}
            whileTap={isEditMode(mode) ? { scale: 0.9 } : {}}
          >
            <time dateTime={eventDate}>{format(parsedDate, "MMM d")}</time>
          </MotionButton>
        )}
        {availabilityType === AvailabilityType.DAYS_OF_WEEK && (
          <MotionButton
            className={cn(
              "my-1 h-7 w-14 rounded-xl border-2 border-transparent bg-accent-light text-xs font-semibold tracking-wide text-secondary transition-all hover:bg-accent",
              {
                "bg-primary text-white hover:bg-primary-hover": isAllTimeSlotForDateSelected,
                "cursor-default bg-background text-sm text-secondary hover:bg-background": isViewMode(mode),
                "ring-2 ring-primary ring-offset-2": (isDateHovered || isDateFocused) && isEditMode(mode)
              }
            )}
            onClick={dateClickedHandler}
            whileTap={isEditMode(mode) ? { scale: 0.9 } : {}}
          >
            <time dateTime={eventDate}> {format(parsedDate, "EEE")}</time>
          </MotionButton>
        )}
      </div>
    </div>
  );
}
