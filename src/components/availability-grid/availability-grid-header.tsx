import TimeZoneDropdown from "../timezone-dropdown";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { isSupportedTimeZone } from "@/utils/timeZone";

export default function AvailabilityGridHeader() {
  const {
    availabilityType,
    sortedEventDates,
    timeZone: eventTimeZone
  } = useAvailabilityGridStore((state) => state.eventData);
  const [selectedTimeZone, setSelectedTimeZone] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeZone, state.setSelectedTimeZone])
  );

  const [leftMostColumnInView, viewWindowSize, nextPage, previousPage] = useAvailabilityGridStore(
    useShallow((state) => [
      state.leftMostColumnInView,
      state.availabilityGridViewWindowSize,
      state.nextPage,
      state.previousPage
    ])
  );

  const numDays = sortedEventDates.length;
  const maxLeftMostColumn = Math.max(0, numDays - viewWindowSize);
  const lastVisibleColumn = Math.min(leftMostColumnInView + viewWindowSize, numDays);
  const isSpecificDates = availabilityType === AvailabilityType.SPECIFIC_DATES;
  const positionLabel = `${isSpecificDates ? "Dates" : "Days"} ${leftMostColumnInView + 1}–${lastVisibleColumn} of ${numDays}`;

  let dateRange = "";
  if (numDays > 0) {
    const firstDate = parseISO(sortedEventDates[leftMostColumnInView]);
    const lastDate = parseISO(sortedEventDates[lastVisibleColumn - 1]);

    if (!isSpecificDates) {
      dateRange = format(firstDate, "EEE");
      if (lastVisibleColumn - leftMostColumnInView > 1) dateRange += ` – ${format(lastDate, "EEE")}`;
    } else if (lastVisibleColumn - leftMostColumnInView === 1) {
      dateRange = format(firstDate, "MMM d, yyyy");
    } else {
      const firstDateFormat = firstDate.getFullYear() === lastDate.getFullYear() ? "MMM d" : "MMM d, yyyy";
      dateRange = `${format(firstDate, firstDateFormat)} – ${format(lastDate, "MMM d, yyyy")}`;
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <TimeZoneDropdown
          error={false}
          gridDropdown={true}
          onChange={setSelectedTimeZone}
          originalTimeZone={eventTimeZone}
          selected={isSupportedTimeZone(selectedTimeZone) ? selectedTimeZone : eventTimeZone}
        />
      </div>
      {numDays > 0 && (
        <nav aria-label="Date navigation">
          <div className="flex items-center justify-between gap-3">
            <div aria-atomic="true" aria-live="polite" className="min-w-0">
              <p className="text-xs font-medium text-black sm:text-sm">{dateRange}</p>
              <p className="mt-0.5 text-2xs text-text-light">{positionLabel}</p>
            </div>
            {maxLeftMostColumn > 0 && (
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  aria-controls="availability-grid-dates"
                  aria-label="Previous dates"
                  className="h-8 w-8 rounded-md p-0"
                  disabled={leftMostColumnInView === 0}
                  onClick={previousPage}
                  title="Previous dates"
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button
                  aria-controls="availability-grid-dates"
                  aria-label="Next dates"
                  className="h-8 w-8 rounded-md p-0"
                  disabled={leftMostColumnInView === maxLeftMostColumn}
                  onClick={nextPage}
                  title="Next dates"
                  type="button"
                >
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {maxLeftMostColumn > 0 && (
            <div aria-hidden="true" className="relative mt-3 h-1 overflow-hidden rounded-full bg-light-gray">
              <div
                className="absolute h-full rounded-full bg-primary transition-all duration-200 motion-reduce:transition-none"
                style={{
                  left: `${(leftMostColumnInView / numDays) * 100}%`,
                  width: `${(Math.min(viewWindowSize, numDays) / numDays) * 100}%`
                }}
              />
            </div>
          )}
        </nav>
      )}
    </div>
  );
}
