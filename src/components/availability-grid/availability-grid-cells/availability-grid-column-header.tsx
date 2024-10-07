import { format, isValid, parseISO, startOfToday } from "date-fns";
import { CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { EventDate, getDateFromTimeSlot, getTimeSlot } from "@/types/Timeslot";
import { cn } from "@/utils/cn";

type AvailabilityGridColumnHeaderProps = {
  borderXSizeStyles: string;
  eventDate: EventDate;
  hasDateGapRight: boolean;
  style: CSSProperties;
};

export default function AvailabilityGridColumnHeader({
  borderXSizeStyles,
  eventDate,
  hasDateGapRight,
  style
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

  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center border-transparent bg-background pb-0.5 pr-0.5",
        borderXSizeStyles,
        {
          "pr-[7px]": hasDateGapRight,
          "pt-2": availabilityType === AvailabilityType.DAYS_OF_WEEK
        }
      )}
      style={{ ...style, width: `calc(100% + ${hasDateGapRight ? "7px" : "2px"}` }}
    >
      {availabilityType === AvailabilityType.SPECIFIC_DATES && (
        <h3 className="text-sm font-semibold text-primary xl:text-base">{format(parsedDate, "EEE")}</h3>
      )}
      <div
        className={cn("border-b-2 border-transparent pb-0.5 text-center xl:w-16", {
          "border-b-2 border-secondary": (isDateHovered || isDateFocused) && isViewMode(mode)
        })}
      >
        {availabilityType === AvailabilityType.SPECIFIC_DATES && (
          <Button
            className={cn(
              "h-6 w-[3.7rem] whitespace-nowrap rounded-sm border-2 border-transparent bg-accent-light text-xs font-semibold tracking-wide text-secondary transition-all hover:bg-accent xl:h-[1.7rem] xl:w-[4.2rem] xl:text-sm",
              {
                "bg-primary text-white hover:bg-primary-hover": isAllTimeSlotForDateSelected,
                "mt-0 cursor-default bg-background text-sm text-secondary hover:bg-background xl:text-base":
                  isViewMode(mode),
                "ring-[1.5px] ring-primary ring-offset-1": (isDateHovered || isDateFocused) && isEditMode(mode)
              }
            )}
            onClick={dateClickedHandler}
            type="button"
          >
            <time dateTime={eventDate}>{format(parsedDate, "MMM d")}</time>
          </Button>
        )}
        {availabilityType === AvailabilityType.DAYS_OF_WEEK && (
          <Button
            className={cn(
              "mb-0.5 h-7 w-14 rounded-xl border-2 border-transparent bg-accent-light text-sm font-semibold tracking-wide text-secondary transition-all hover:bg-accent",
              {
                "bg-primary text-white hover:bg-primary-hover": isAllTimeSlotForDateSelected,
                "cursor-default bg-background text-sm text-secondary hover:bg-background lg:text-base":
                  isViewMode(mode),
                "ring-2 ring-primary ring-offset-2": (isDateHovered || isDateFocused) && isEditMode(mode)
              }
            )}
            onClick={dateClickedHandler}
            type="button"
          >
            <time dateTime={eventDate}> {format(parsedDate, "EEE")}</time>
          </Button>
        )}
      </div>
    </div>
  );
}
