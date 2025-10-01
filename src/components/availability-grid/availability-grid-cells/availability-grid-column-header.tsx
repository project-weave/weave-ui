import { format, isValid, parseISO, startOfToday } from "date-fns";
import { CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { EventDate, getDateFromTimeSlot, getTimeSlot } from "@/types/Timeslot";
import { cn } from "@/utils/cn";

type AvailabilityGridColumnHeaderProps = {
  borderXSizeStyles: string;
  eventDate: EventDate;
  hasDateGapRight: boolean;
  onMouseEnter: () => void;
  style: CSSProperties;
};

export default function AvailabilityGridColumnHeader({
  borderXSizeStyles,
  eventDate,
  hasDateGapRight,
  onMouseEnter,
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

  const allTimeSlotsForDate =
    sortedEventTimes.length > 0
      ? sortedEventTimes.slice(0, -1).map((eventTime) => getTimeSlot(eventTime, eventDate))
      : [];
  const isAllTimeSlotForDateSelected =
    allTimeSlotsForDate.length > 0 && allTimeSlotsForDate.every((timeSlot) => selectedTimeSlots.includes(timeSlot));

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
      className={cn("flex h-full flex-col items-center justify-center border-transparent bg-white", borderXSizeStyles, {
        "pt-2": availabilityType === AvailabilityType.DAYS_OF_WEEK,
        "border-r-2 border-r-dark-gray": hasDateGapRight
      })}
      onMouseEnter={onMouseEnter}
      style={{ ...style }}
    >
      {availabilityType === AvailabilityType.SPECIFIC_DATES && (
        <div className="flex flex-col items-center space-y-1">
          <h3 className="text-sm font-normal text-text-light">{format(parsedDate, "EEE")}</h3>
          <Button
            className={cn(
              "text-text-primary flex h-6 items-center justify-center whitespace-nowrap rounded-sm border-[1px] border-none bg-input px-2 text-sm font-normal transition-all hover:opacity-80",
              {
                "bg-primary-purple text-white hover:bg-primary-hover": isAllTimeSlotForDateSelected,
                "text-text-primary cursor-default bg-transparent hover:bg-transparent": isViewMode(mode)
              }
            )}
            onClick={dateClickedHandler}
            type="button"
            variant="ghost"
          >
            <time dateTime={eventDate}>{format(parsedDate, "MMM d")}</time>
          </Button>
        </div>
      )}
      <div
        className={cn("border-b-2 border-transparent pb-2 text-center xl:w-16", {
          "border-b-2 border-primary-purple": isDateHovered || isDateFocused
        })}
      >
        {availabilityType === AvailabilityType.DAYS_OF_WEEK && (
          <Button
            className={cn(
              "text-transition-all mb-0.5 w-14 rounded-xl border-2 border-transparent bg-input text-lg font-normal tracking-wide hover:opacity-80",
              {
                "bg-primary text-white hover:bg-primary-hover": isAllTimeSlotForDateSelected,
                "cursor-default bg-white text-sm text-secondary hover:bg-white lg:text-base": isViewMode(mode)
              }
            )}
            onClick={dateClickedHandler}
            type="button"
            variant="ghost"
          >
            <time dateTime={eventDate}> {format(parsedDate, "EEE")}</time>
          </Button>
        )}
      </div>
    </div>
  );
}
