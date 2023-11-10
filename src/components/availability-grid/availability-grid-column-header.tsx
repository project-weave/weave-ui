import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

import { Button } from "../ui/button";
import { AvailabilityDateTime, getAvailabilityDateTimeFormat } from "./availability-grid";

type AvailabilityGridColumnHeaderProps = {
  areAllDatesInSameMonth: boolean;
  areAllDatesInSameYear: boolean;
  dateStrUTC: string;
  isDateGapLeft: boolean;
  selectedAvailability: Set<AvailabilityDateTime>;
  setSelectedAvailabilty: (newSelection: Set<AvailabilityDateTime>) => void;
  sortedTimesUTC: string[];
};

export default function AvailabilityGridColumnHeader({
  areAllDatesInSameMonth,
  areAllDatesInSameYear,
  dateStrUTC,
  isDateGapLeft,
  sortedTimesUTC,
  selectedAvailability,
  setSelectedAvailabilty
}: AvailabilityGridColumnHeaderProps) {
  const parsedDate = parseISO(dateStrUTC);

  const allAvailabilitiesForDate = sortedTimesUTC.map((timeStrUTC) =>
    getAvailabilityDateTimeFormat(timeStrUTC, dateStrUTC)
  );
  const isAllAvailabilitiesForDateSelected = allAvailabilitiesForDate.every((availability) =>
    selectedAvailability.has(availability)
  );

  function dateClickedHandler() {
    const newSelection = new Set<AvailabilityDateTime>(selectedAvailability);

    allAvailabilitiesForDate.forEach((availability) => {
      if (isAllAvailabilitiesForDateSelected) {
        newSelection.delete(availability);
      } else {
        newSelection.add(availability);
      }
    });
    setSelectedAvailabilty(newSelection);
  }

  return (
    <div className={cn("text-center", { "ml-2": isDateGapLeft })} key={`availability-grid-column-header-${dateStrUTC}`}>
      <h3 className="mb-3 text-lg font-medium text-secondary-light">{format(parsedDate, "EEE")}</h3>
      <Button
        className={cn(
          "rounded-sm border-none bg-purple-100 text-lg font-semibold tracking-wide text-secondary transition-all hover:bg-purple-200 hover:bg-opacity-100",
          {
            "bg-primary bg-opacity-100 text-white hover:bg-primary hover:bg-opacity-70":
              isAllAvailabilitiesForDateSelected
          }
        )}
        onClick={dateClickedHandler}
      >
        {format(parsedDate, areAllDatesInSameMonth && areAllDatesInSameYear ? "dd" : "MMM dd")}
      </Button>
    </div>
  );
}
