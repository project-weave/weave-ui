import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { EVENT_TIME_FORMAT, getTimeFromTimeSlot, getTimeSlot, TIME_SLOT_INTERVAL_MINUTES } from "@/types/Event";
import { cn } from "@/utils/cn";
import { addMinutes, format, parseISO } from "date-fns";

type AvailabilityGridRowHeaderProps = {
  eventTime: string;
};

export default function AvailabilityGridRowHeader({ eventTime }: AvailabilityGridRowHeaderProps) {
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
        "-translate-y-1.5 pr-2 text-right text-[0.65rem] font-medium text-primary duration-300 xs:text-2xs sm:-translate-y-2 xl:pl-2 xl:pr-2",
        { "opacity-0": parsedDateTime.getMinutes() !== 0 },
        {
          "font-bold opacity-100": isHoveredTimeSlot || isPrevTimeSlotHovered,
          "text-secondary": isViewMode(mode) && (isHoveredTimeSlot || isPrevTimeSlotHovered)
        }
      )}
    >
      {format(parsedDateTime, parsedDateTime.getMinutes() === 0 ? "h:mm a" : "h:mm a")}
    </time>
  );
}
