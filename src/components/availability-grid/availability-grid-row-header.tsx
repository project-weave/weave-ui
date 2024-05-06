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

type AvailabilityGridRowHeaderProps = {
  eventTime: string;
  mode: AvailabilityGridMode;
};

export default function AvailabilityGridRowHeader({ eventTime, mode }: AvailabilityGridRowHeaderProps) {
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
        "ml-2 mr-2 -translate-y-2 text-right text-2xs text-primary duration-300",
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
