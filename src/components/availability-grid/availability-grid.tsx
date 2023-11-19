"use client";
import { EventDate, EventTime, TimeSlot } from "@/app/(event)/[eventId]/page";
import { useElementsOnScreen } from "@/hooks/useElementsOnScreen";
import { isConsecutiveDay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
// import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { addMinutes, format, parseISO } from "date-fns";
import { useAnimationControls } from "framer-motion";
import { useMemo, useState } from "react";

import AvailabilityGridCell, { AvailabilityGridCellBase } from "./availability-grid-cell";
import AvailabilityGridColumnHeader from "./availability-grid-column-header";
import AvailabilityGridHeader from "./availability-grid-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header";

// AvailabilityCellPosition contains a row and column index that represents the position of a single cell in the availability grid
export type AvailabilityCellPosition = {
  col: number;
  row: number;
};

// assuming that when only time is passed in as a parameter, we're only interested in time so we we can use an aribtrary date to parse
export function getTimeSlotFormat(time: EventTime, date: EventDate = "2000-11-29"): TimeSlot {
  return date + "T" + time;
}

type AvailabilityGridProps = {
  eventDates: EventDate[];
  eventTimeEnd: EventTime;
  eventTimeStart: EventTime;
  eventTimeZone: string;
  participantsToTimeSlots: Readonly<Record<string, TimeSlot[]>>;
  saveUserAvailability: (user: string, timeSlots: TimeSlot[]) => void;
};

const testUser = "Alex Ma";

export default function AvailabilityGrid({
  eventDates,
  eventTimeEnd,
  eventTimeStart,
  participantsToTimeSlots,
  saveUserAvailability
}: AvailabilityGridProps) {
  const [isViewMode, setIsViewMode] = useState(true);
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragIsAdding, setDragIsAdding] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set(participantsToTimeSlots[testUser] ?? []));
  const [dragStartCellPosition, setDragStartCellPosition] = useState<AvailabilityCellPosition | null>(null);
  const [dragEndCellPosition, setDragEndCellPosition] = useState<AvailabilityCellPosition | null>(null);
  const [hoveredTime, setHoveredTime] = useState<EventTime | null>(null);

  // TODO: add timezone conversion
  // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const sortedEventTimes = useMemo(() => {
    const times = [];
    const timeSlotMinutes = 30;

    let currentTime = parseISO(getTimeSlotFormat(eventTimeStart));
    const endTime = parseISO(getTimeSlotFormat(eventTimeEnd));

    while (currentTime < endTime) {
      times.push(format(currentTime, "HH:mm:ss"));
      currentTime = addMinutes(currentTime, timeSlotMinutes);
    }
    return times;
  }, [eventTimeStart, eventTimeEnd]);

  const sortedEventDates = useMemo(
    () =>
      eventDates.sort((date1, date2) => {
        return parseISO(date1).getTime() - parseISO(date2).getTime();
      }),
    [eventDates]
  );

  // NOTE: can assume columnRefs are in same order as sortedEventDates because they are generated in the same loop
  const [columnRefs, visibleColumnIds] = useElementsOnScreen<EventDate>(sortedEventDates);

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
    const sortedDates = sortedColumnNums.map((colNum) => sortedEventDates[colNum]);

    return [sortedColumnNums, sortedDates];
  }, [visibleColumnIds, sortedEventDates]);

  const timeSlotsToParticipants = useMemo<Readonly<Record<TimeSlot, string[]>>>(() => {
    const record: Record<TimeSlot, string[]> = {};
    Object.entries(participantsToTimeSlots).forEach(([participant, timeSlots]) => {
      timeSlots.forEach((timeSlot) => {
        if (record[timeSlot] === undefined) {
          record[timeSlot] = [];
        }
        record[timeSlot].push(participant);
      });
    });
    return record;
  }, [participantsToTimeSlots]);

  function handleCellMouseEnter(cellPosition: AvailabilityCellPosition) {
    if (!isViewMode && isDragSelecting && dragStartCellPosition && dragEndCellPosition) {
      setDragEndCellPosition({ col: cellPosition.col, row: cellPosition.row });
    }
    setHoveredTime(sortedEventTimes[cellPosition.row]);
  }

  const editButtonAnimationControls = useAnimationControls();

  function handleCellMouseDown(cellPosition: AvailabilityCellPosition) {
    if (isViewMode) {
      editButtonAnimationControls.start({
        transition: { duration: 0.5, ease: "easeInOut" },
        x: [0, -5, 5, -5, 5, 0]
      });
      return;
    }

    setIsDragSelecting(true);
    setDragStartCellPosition({ col: cellPosition.col, row: cellPosition.row });
    setDragEndCellPosition({ col: cellPosition.col, row: cellPosition.row });
    if (selectedTimeSlots.has(cellPositionToeventDateTime(cellPosition))) {
      setDragIsAdding(false);
    } else {
      setDragIsAdding(true);
    }
  }

  function cellPositionToeventDateTime(cellPosition: AvailabilityCellPosition): TimeSlot {
    const eventDate = sortedEventDates[cellPosition.col];
    const eventTime = sortedEventTimes[cellPosition.row];
    return getTimeSlotFormat(eventTime, eventDate);
  }

  function saveDragSelection() {
    if (isViewMode || !isDragSelecting) return;

    setSelectedTimeSlots((prevSelected) => {
      const selection = generateTimeSlotsInSelectionArea();
      if (!dragIsAdding) {
        return new Set([...prevSelected].filter((timeSlot) => !selection.includes(timeSlot)));
      } else {
        return new Set([...prevSelected, ...selection]);
      }
    });

    cancelDragSelection();
  }

  function cancelDragSelection() {
    setIsDragSelecting(false);
    setDragStartCellPosition(null);
    setDragEndCellPosition(null);
  }

  function handleSaveUserAvailability() {
    setIsViewMode(true);
    saveUserAvailability(testUser, Array.from(selectedTimeSlots));
  }

  // generates a list of TimeSlot that are in the current selection area
  function generateTimeSlotsInSelectionArea() {
    if (dragStartCellPosition === null || dragEndCellPosition === null) return [];
    const [minRow, maxRow] = [
      Math.min(dragStartCellPosition.row, dragEndCellPosition.row),
      Math.max(dragStartCellPosition.row, dragEndCellPosition.row)
    ];
    const [minCol, maxCol] = [
      Math.min(dragStartCellPosition.col, dragEndCellPosition.col),
      Math.max(dragStartCellPosition.col, dragEndCellPosition.col)
    ];
    const timeSlots: TimeSlot[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellPosition = { col: col, row: row } as AvailabilityCellPosition;
        timeSlots.push(cellPositionToeventDateTime(cellPosition));
      }
    }
    return timeSlots;
  }

  return (
    <div
      className="card grid select-none border-2 pl-2 pr-10"
      onMouseLeave={cancelDragSelection}
      // putting saveDragtSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={saveDragSelection}
      style={{
        gridTemplateColumns: "3.5rem 1fr",
        gridTemplateRows: "auto 1fr"
      }}
    >
      <div className="col-start-2 mb-2">
        <AvailabilityGridHeader
          earliestEventDate={sortedEventDates[0]}
          editButtonAnimationControls={editButtonAnimationControls}
          handleSaveUserAvailability={handleSaveUserAvailability}
          hasUserAddedAvailability={participantsToTimeSlots[testUser]?.length > 0}
          isViewMode={isViewMode}
          lastColumn={sortedEventDates.length - 1}
          latestEventDate={sortedEventDates[sortedEventDates.length - 1]}
          setIsViewMode={setIsViewMode}
          sortedColumnRefs={columnRefs}
          sortedVisibleColumnNums={sortedVisibleColumnNums}
        />
      </div>

      {/* time labels */}
      <div
        className="col-start-1 grid"
        style={{
          gridTemplateRows: `4.7rem 1.2rem repeat(${sortedEventTimes.length}, minmax(1.4rem, 1fr)) 1.2rem 8px`
        }}
      >
        <p className="h-full">&nbsp;</p>
        <p className="h-full">&nbsp;</p>
        {sortedEventTimes.map((eventTime, gridRow) => (
          <AvailabilityGridRowHeader
            eventTime={eventTime}
            hoveredTime={hoveredTime}
            key={`availability-grid-row-header-${gridRow}`}
          />
        ))}
        <AvailabilityGridRowHeader
          eventTime={eventTimeEnd}
          key={`availability-grid-row-header-${sortedEventDates.length}`}
        />
      </div>

      {/* availability cells */}
      <div
        className="scrollbar-track-full scrollbar-rounded-full col-start-2 grid cursor-pointer snap-x scroll-mt-2 grid-flow-col overflow-x-scroll scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full"
        onMouseLeave={() => setHoveredTime(null)}
      >
        {sortedEventDates.map((eventDate, gridCol) => {
          const lastRow = sortedEventTimes.length - 1;
          const lastColumn = sortedEventDates.length - 1;

          const prevEventDate = sortedEventDates[gridCol - 1];
          const nextEventDate = sortedEventDates[gridCol + 1];

          const isDateGapLeft = gridCol !== 0 && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
          const isDateGapRight =
            gridCol !== lastColumn && !isConsecutiveDay(parseISO(eventDate), parseISO(nextEventDate));

          // grid columns
          return (
            <div
              className="grid h-full min-w-[6rem] snap-start"
              key={`availability-column-${gridCol}`}
              style={{
                gridTemplateRows: `4.7rem 1rem repeat(${sortedEventTimes.length}, minmax(1.2rem, 1fr)) 1rem`
              }}
            >
              <div observable-el-id={gridCol} ref={(el) => (columnRefs.current[gridCol] = el)}>
                <AvailabilityGridColumnHeader
                  eventDate={eventDate}
                  hasUserAddedAvailability={Object.keys(participantsToTimeSlots).includes(testUser)}
                  isDateGapRight={isDateGapRight}
                  isViewMode={isViewMode}
                  key={`availability-grid-column-header-${gridCol}`}
                  selectedTimeSlots={selectedTimeSlots}
                  setSelectedTimeSlots={setSelectedTimeSlots}
                  sortedEventTimes={sortedEventTimes}
                />
              </div>

              {/* placeholder top row */}
              <AvailabilityGridCellBase
                className={cn("border-t-0", { "border-l-0": gridCol === 0 })}
                gridCol={lastColumn + 1}
                isDateGapLeft={isDateGapLeft}
                isDateGapRight={isDateGapRight}
                key={`availability-grid-cell-${gridCol}-${-1}`}
                onMouseEnter={() => setHoveredTime(null)}
              />

              {sortedEventTimes.map((eventTime, gridRow) => {
                const TimeSlot = getTimeSlotFormat(eventTime, eventDate);
                return (
                  <AvailabilityGridCell
                    dragEndCellPosition={dragEndCellPosition}
                    dragIsAdding={dragIsAdding}
                    dragStartCellPosition={dragStartCellPosition}
                    gridCol={gridCol}
                    gridRow={gridRow}
                    handleCellMouseDown={handleCellMouseDown}
                    handleCellMouseEnter={handleCellMouseEnter}
                    isDateGapLeft={isDateGapLeft}
                    isDateGapRight={isDateGapRight}
                    isSelected={selectedTimeSlots.has(TimeSlot)}
                    isViewMode={isViewMode}
                    key={`availability-grid-cell-${gridCol}-${gridRow}`}
                    participantsSelected={timeSlotsToParticipants[TimeSlot] ?? []}
                    totalParticipants={Object.keys(participantsToTimeSlots).length}
                  />
                );
              })}

              {/* placeholder bottom row */}
              <AvailabilityGridCellBase
                className={cn("border-b-0", { "border-l-0": gridCol === 0 })}
                gridCol={lastColumn + 1}
                isDateGapLeft={isDateGapLeft}
                isDateGapRight={isDateGapRight}
                key={`availability-grid-cell-${gridCol}-${lastRow + 1}`}
                onMouseEnter={() => setHoveredTime(null)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
