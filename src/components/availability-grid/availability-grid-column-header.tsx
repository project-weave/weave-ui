import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

import { Button } from "../ui/button";
import {
  AvailabilityDate,
  AvailabilityDateTime,
  AvailabilityTime,
  getAvailabilityDateTimeFormat
} from "./availability-grid";

type AvailabilityGridColumnHeaderProps = {
  areAllDatesInSameMonth: boolean;
  areAllDatesInSameYear: boolean;
  availabilityDate: AvailabilityDate;
  isDateGapRight: boolean;
  selectedAvailabilities: Set<AvailabilityDateTime>;
  setSelectedAvailabilties: (newSelection: Set<AvailabilityDateTime>) => void;
  sortedAvailabilityTimes: AvailabilityTime[];
};

export default function AvailabilityGridColumnHeader({
  areAllDatesInSameMonth,
  areAllDatesInSameYear,
  availabilityDate,
  isDateGapRight,
  selectedAvailabilities,
  setSelectedAvailabilties,
  sortedAvailabilityTimes
}: AvailabilityGridColumnHeaderProps) {
  const parsedDate = parseISO(availabilityDate);

  const allAvailabilitiesForDate = sortedAvailabilityTimes.map((availabilityTime) =>
    getAvailabilityDateTimeFormat(availabilityTime, availabilityDate)
  );
  const isAllAvailabilitiesForDateSelected = allAvailabilitiesForDate.every((availability) =>
    selectedAvailabilities.has(availability)
  );

  function dateClickedHandler() {
    const newSelection = new Set<AvailabilityDateTime>(selectedAvailabilities);

    allAvailabilitiesForDate.forEach((availability) => {
      if (isAllAvailabilitiesForDateSelected) {
        newSelection.delete(availability);
      } else {
        newSelection.add(availability);
      }
    });
    setSelectedAvailabilties(newSelection);
  }

  return (
    <div className={cn("text-center", { "mr-2": isDateGapRight })}>
      {(!areAllDatesInSameMonth || !areAllDatesInSameYear) && (
        <h3 className="font-bold text-primary">{format(parsedDate, "MMM")}</h3>
      )}
      <h3
        className={cn("mb-4 mt-2 text-sm font-medium text-secondary-light", {
          "mb-2 mt-[1px] text-xs": !areAllDatesInSameMonth || !areAllDatesInSameYear
        })}
      >
        {format(parsedDate, "EEE")}
      </h3>
      <Button
        className={cn(
          "h-8 w-10 rounded-sm border-none bg-purple-100 font-semibold tracking-wide text-secondary transition-all hover:bg-purple-200 hover:bg-opacity-100",
          {
            "bg-primary bg-opacity-100 text-white hover:bg-primary hover:bg-opacity-70":
              isAllAvailabilitiesForDateSelected
          }
        )}
        onClick={dateClickedHandler}
      >
        {format(parsedDate, "d")}
      </Button>
    </div>
  );
}
