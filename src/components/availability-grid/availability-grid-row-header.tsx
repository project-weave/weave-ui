import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

import { AvailabilityTime, getAvailabilityDateTimeFormat } from "./availability-grid";

type AvailabilityGridRowHeaderProps = {
  availabilityTime: string;
  hoveredTime?: AvailabilityTime | null;
};

export default function AvailabilityGridRowHeader({ availabilityTime, hoveredTime }: AvailabilityGridRowHeaderProps) {
  const parsedDate = parseISO(getAvailabilityDateTimeFormat(availabilityTime));

  return (
    <p
      className={cn(
        "ml-2 mr-2 -translate-y-2 text-right text-xs text-primary duration-300",
        { "text-[0.7rem] opacity-0": parsedDate.getMinutes() !== 0 },
        {
          "font-bold opacity-100": hoveredTime === availabilityTime
        }
      )}
    >
      {format(parsedDate, parsedDate.getMinutes() === 0 ? "h a" : "h:mm")}
    </p>
  );
}
