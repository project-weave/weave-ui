import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

import { getAvailabilityDateTimeFormat } from "./availability-grid";

type AvailabilityGridRowHeaderProps = {
  hoveredTime: null | string;
  timeStrUTC: string;
};

export default function AvailabilityGridRowHeader({ timeStrUTC, hoveredTime }: AvailabilityGridRowHeaderProps) {
  const parsedDateTime = parseISO(getAvailabilityDateTimeFormat(timeStrUTC));
  return (
    <p
      className={cn("ml-2 mr-2 -translate-y-2 text-right text-xs text-primary duration-300", {
        "opacity-0": parsedDateTime.getMinutes() !== 0,
        "font-bold opacity-100": hoveredTime === timeStrUTC
      })}
      key={`availability-grid-row-header-${timeStrUTC}`}
    >
      {format(parsedDateTime, "h:mm a")}
    </p>
  );
}
