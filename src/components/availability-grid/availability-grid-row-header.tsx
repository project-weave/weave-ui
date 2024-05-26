import useAvailabilityGridStore, {
  AvailabilityGridMode,
  EVENT_TIME_FORMAT,
  getTimeFromTimeSlot,
  getTimeSlot,
  isViewMode,
  TIME_SLOT_INTERVAL_MINUTES
} from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { addMinutes, format, parseISO } from "date-fns";
import { CSSProperties } from "react";

type AvailabilityGridRowHeaderProps = {
  eventTime: string;
  mode: AvailabilityGridMode;
  style: CSSProperties;
};

export default function AvailabilityGridRowHeader({ eventTime, mode, style }: AvailabilityGridRowHeaderProps) {
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);
  const isHoveredTimeSlot = eventTime === getTimeFromTimeSlot(hoveredTimeSlot);

  // parsing time with arbitrary date as we're only interested in the time
  const parsedDateTime = parseISO(getTimeSlot(eventTime));

  const isPrevTimeSlotHovered =
    hoveredTimeSlot &&
    eventTime === format(addMinutes(parseISO(hoveredTimeSlot), TIME_SLOT_INTERVAL_MINUTES), EVENT_TIME_FORMAT);

  return (
    <time
      className={cn(
        "-translate-y-1 pr-2 text-right text-2xs font-medium text-primary duration-300",
        { "opacity-0": parsedDateTime.getMinutes() !== 0 },
        {
          "font-bold opacity-100": isHoveredTimeSlot || isPrevTimeSlotHovered,
          "text-secondary": isViewMode(mode) && (isHoveredTimeSlot || isPrevTimeSlotHovered)
        }
      )}
      style={style}
    >
      {format(parsedDateTime, parsedDateTime.getMinutes() === 0 ? "h:mm a" : "h:mm a")}
    </time>
  );
}
