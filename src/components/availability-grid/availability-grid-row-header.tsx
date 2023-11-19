import { EventTime } from "@/app/(event)/[eventId]/page";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

import { getTimeSlot } from "./availability-grid";

type AvailabilityGridRowHeaderProps = {
  eventTime: string;
  hoveredTime?: EventTime | null;
};

export default function AvailabilityGridRowHeader({ eventTime, hoveredTime }: AvailabilityGridRowHeaderProps) {
  const parsedDateTime = parseISO(getTimeSlot(eventTime));

  return (
    <p
      className={cn(
        "ml-2 mr-2 -translate-y-2 text-right text-xs text-primary duration-300",
        { "text-[0.7rem] opacity-0": parsedDateTime.getMinutes() !== 0 },
        {
          "font-bold opacity-100": hoveredTime === eventTime
        }
      )}
    >
      {format(parsedDateTime, parsedDateTime.getMinutes() === 0 ? "h a" : "h:mm")}
    </p>
  );
}
