import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

// above this many dates the per-date dots get too small, so a compact track is shown instead
const MAX_DATE_DOTS = 21;

export default function AvailabilityGridHeader() {
  const sortedEventDates = useAvailabilityGridStore((state) => state.eventData.sortedEventDates);
  const [leftMostColumnInView, viewWindowSize, nextPage, previousPage, setLeftMostColumnInView] =
    useAvailabilityGridStore(
      useShallow((state) => [
        state.leftMostColumnInView,
        state.availabilityGridViewWindowSize,
        state.nextPage,
        state.previousPage,
        state.setLeftMostColumnInView
      ])
    );

  const numDays = sortedEventDates.length;
  if (numDays === 0) return null;

  const maxLeftMostColumn = Math.max(0, numDays - viewWindowSize);
  // nothing to navigate when every date already fits on screen
  if (maxLeftMostColumn === 0) return null;

  return (
    // date dots sit at the far left of the calendar, arrows on the right
    <nav aria-label="Date navigation" className="flex min-h-[2rem] items-center justify-between gap-3">
      <DatePositionIndicator
        firstVisible={leftMostColumnInView}
        numDays={numDays}
        onSelect={setLeftMostColumnInView}
        visibleCount={viewWindowSize}
      />
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            aria-controls="availability-grid-dates"
            aria-label="Previous dates"
            className="h-8 w-8 rounded-md p-0 transition-transform active:scale-95"
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
            className="h-8 w-8 rounded-md p-0 transition-transform active:scale-95"
            disabled={leftMostColumnInView === maxLeftMostColumn}
            onClick={nextPage}
            title="Next dates"
            type="button"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

type DatePositionIndicatorProps = {
  firstVisible: number;
  numDays: number;
  onSelect: (column: number) => void;
  visibleCount: number;
};

/**
 * One small dot per date; the dates currently on screen are purple. Shows where you are in the event
 * at a glance. Very long events fall back to a compact track.
 */
function DatePositionIndicator({ firstVisible, numDays, onSelect, visibleCount }: DatePositionIndicatorProps) {
  if (numDays > MAX_DATE_DOTS) {
    return (
      <div aria-hidden="true" className="relative h-1.5 w-24 rounded-full bg-light-gray">
        <div
          className="absolute h-full rounded-full bg-primary transition-[left] duration-200 ease-out"
          style={{ left: `${(firstVisible / numDays) * 100}%`, width: `${(visibleCount / numDays) * 100}%` }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="flex items-center gap-1">
      {Array.from({ length: numDays }, (_, index) => {
        const isVisible = index >= firstVisible && index < firstVisible + visibleCount;
        return (
          <button
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors duration-200",
              isVisible ? "bg-primary" : "bg-light-gray hover:bg-dark-gray"
            )}
            key={index}
            onClick={() => onSelect(index)}
            tabIndex={-1}
            type="button"
          />
        );
      })}
    </div>
  );
}
