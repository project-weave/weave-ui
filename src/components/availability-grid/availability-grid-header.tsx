import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

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
    <nav aria-label="Date navigation" className="flex min-h-[2rem] items-center justify-between">
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

const DOT_SIZE_PX = 6;
const DOT_GAP_PX = 4;

/**
 * One small dot per date on a single line; the dates currently on screen are purple. When there are more
 * dates than fit (it never runs into the arrows), it shows as many dots as fit, centred on the visible
 * dates, and the end dots shrink to hint that the row continues.
 */
function DatePositionIndicator({ firstVisible, numDays, onSelect, visibleCount }: DatePositionIndicatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(numDays);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() =>
      setCapacity(Math.max(1, Math.floor((container.clientWidth + DOT_GAP_PX) / (DOT_SIZE_PX + DOT_GAP_PX))))
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const shownCount = Math.min(numDays, capacity);
  // keep the visible dates roughly centred within the dots that are shown
  const start = Math.min(Math.max(firstVisible - Math.floor((shownCount - visibleCount) / 2), 0), numDays - shownCount);
  const hasMoreBefore = start > 0;
  const hasMoreAfter = start + shownCount < numDays;

  return (
    // flex-1 + right margin: uses the free space on the left but always keeps clear of the arrows
    <div aria-hidden="true" className="mr-6 flex min-w-0 flex-1 items-center overflow-hidden" ref={containerRef}>
      <div className="flex items-center" style={{ gap: DOT_GAP_PX }}>
        {Array.from({ length: shownCount }, (_, offset) => {
          const index = start + offset;
          const isVisible = index >= firstVisible && index < firstVisible + visibleCount;
          const isEdgeHint = (offset === 0 && hasMoreBefore) || (offset === shownCount - 1 && hasMoreAfter);
          return (
            <button
              className={cn(
                "shrink-0 rounded-full transition-colors duration-200",
                isVisible ? "bg-primary" : "bg-light-gray hover:bg-dark-gray",
                isEdgeHint && "scale-[0.6]"
              )}
              key={index}
              onClick={() => onSelect(index)}
              style={{ height: DOT_SIZE_PX, width: DOT_SIZE_PX }}
              tabIndex={-1}
              type="button"
            />
          );
        })}
      </div>
    </div>
  );
}
