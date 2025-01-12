import { addMinutes, format, parseISO } from "date-fns";

import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { TIME_SLOT_INTERVAL_MINUTES } from "@/store/eventDataSlice";
import { EVENT_TIME_FORMAT, getTimeFromTimeSlot, getTimeSlot } from "@/types/Timeslot";
import { cn } from "@/utils/cn";

type AvailabilityGridRowHeaderProps = {
  eventTime: string;
  onMouseEnter: () => void;
};

export default function AvailabilityGridRowHeader({ eventTime, onMouseEnter }: AvailabilityGridRowHeaderProps) {
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const isHoveredTimeSlot = eventTime === getTimeFromTimeSlot(hoveredTimeSlot);

  // parsing time with arbitrary date as we're only interested in the time
  const parsedDateTime = parseISO(getTimeSlot(eventTime));

  const isPrevTimeSlotHovered =
    hoveredTimeSlot &&
    eventTime === format(addMinutes(parseISO(hoveredTimeSlot), TIME_SLOT_INTERVAL_MINUTES), EVENT_TIME_FORMAT);

  return (
    <time
      className={cn(
        "-translate-y-1.5 pr-2 text-right text-2xs font-medium text-primary duration-300 sm:-translate-y-2 sm:text-[0.75rem] xl:text-xs",
        { "opacity-0": parsedDateTime.getMinutes() !== 0 },
        {
          "font-bold opacity-100": isHoveredTimeSlot || isPrevTimeSlotHovered,
          "text-secondary": isViewMode(mode) && (isHoveredTimeSlot || isPrevTimeSlotHovered)
        }
      )}
      onMouseEnter={onMouseEnter}
    >
      {format(parsedDateTime, parsedDateTime.getMinutes() === 0 ? "h:mm a" : "h:mm a")}
    </time>
  );
}
