import { cn } from "@/lib/utils";
import useAvailabilityGridStore, { getTimeFromTimeSlot, getTimeSlot } from "@/store/availabilityGridStore";
import { format, parseISO } from "date-fns";

type AvailabilityGridRowHeaderProps = {
  eventTime: string;
};

export default function AvailabilityGridRowHeader({ eventTime }: AvailabilityGridRowHeaderProps) {
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);
  const isHoveredTimeSlot = eventTime === getTimeFromTimeSlot(hoveredTimeSlot);

  // parsing time with arbitrary date as we're only interested in the time
  const parsedDateTime = parseISO(getTimeSlot(eventTime));

  return (
    <time
      className={cn(
        "ml-2 mr-2 -translate-y-2 text-right text-xs text-primary duration-300",
        { "text-[0.7rem] opacity-0": parsedDateTime.getMinutes() !== 0 },
        {
          "font-bold opacity-100": isHoveredTimeSlot
        }
      )}
    >
      {format(parsedDateTime, parsedDateTime.getMinutes() === 0 ? "h a" : "h:mm")}
    </time>
  );
}
