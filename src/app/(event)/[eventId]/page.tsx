"use client";
import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridInfoPanel from "@/components/availability-grid/info-panel/availability-grid-info-panel";
import { useElementsOnScreen } from "@/hooks/useElementsOnScreen";
import useAvailabilityGridStore, { EventDate } from "@/store/availabilityGridStore";
import parseISO from "date-fns/parseISO/index";
import { useMemo } from "react";

export default function EventPage() {
  const eventDates = useAvailabilityGridStore((state) => state.eventData.eventDates);

  const sortedEventDates = useMemo(
    () =>
      eventDates.sort((date1, date2) => {
        return parseISO(date1).getTime() - parseISO(date2).getTime();
      }),
    [eventDates]
  );

  // NOTE: we can assume columnRefs are in same order as sortedEventDates because they are generated in the same loop
  const [columnContainerRef, columnRefs, visibleColumnIds] = useElementsOnScreen<EventDate>(sortedEventDates);

  const [sortedVisibleColumnNums, sortedVisibleEventDates] = useMemo<[number[], EventDate[]]>(() => {
    const sortedColumnNums = Array.from(visibleColumnIds)
      .map((colStr) => {
        const colNum = parseInt(colStr);
        if (colNum === undefined || colNum < 0 || colNum >= sortedEventDates.length) {
          return -1;
        }
        return colNum;
      })
      .filter((colNum) => colNum !== -1)
      .sort((colNum1, colNum2) => colNum1 - colNum2);

    const sortedVisibleDates = sortedColumnNums.map((colNum) => sortedEventDates[colNum]);

    return [sortedColumnNums, sortedVisibleDates];
  }, [visibleColumnIds, sortedEventDates]);

  const eventDatesToColumnRefs = {} as Record<EventDate, HTMLDivElement | null>;
  sortedEventDates.forEach((eventDate, colNum) => {
    eventDatesToColumnRefs[eventDate] = columnRefs.current[colNum];
  });

  return (
    <div className="grid h-full grid-flow-col justify-center gap-3 pb-4">
      <div className="min-w-[20rem]">
        <AvailabilityGridInfoPanel
          eventDatesToColumnRefs={eventDatesToColumnRefs}
          sortedVisibleEventDates={sortedVisibleEventDates}
        />
      </div>
      <div className="h-full">
        <AvailabilityGrid
          columnContainerRef={columnContainerRef}
          sortedColumnRefs={columnRefs}
          sortedVisibleColumnNums={sortedVisibleColumnNums}
        />
      </div>
    </div>
  );
}
