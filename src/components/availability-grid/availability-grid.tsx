"use client";
import { isConsecutiveDay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
// import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { addMinutes, format, parseISO } from "date-fns";
import { useMemo, useState } from "react";

import AvailabilityGridCell, { AvailabilityGridCellBase } from "./availability-grid-cell";
import AvailabilityGridColumnHeader from "./availability-grid-column-header";
import AvailabilityGridHeader from "./availability-grid-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header";

// Availability is the date portion of aan ISO formatted date string for a single availbability, ie: 2000-11-29
export type AvailabilityDate = string;

// AvailabilityTime is the time portion of aan ISO formatted date string for a single availbability, ie: 12:00:00
export type AvailabilityTime = string;

// AvailabilityDateTime is an ISO formatted date string that represents a single availbability
export type AvailabilityDateTime = string;

// AvailabilityCellPosition contains a row and column index that represents the position of a single cell in the availability grid
export type AvailabilityCellPosition = {
  col: number;
  row: number;
};

// assuming that when only time is passed in as a parameter, we're only interested in time so we we can use an aribtrary date to parse
export function getAvailabilityDateTimeFormat(
  time: AvailabilityTime,
  date: AvailabilityDate = "2000-11-29"
): AvailabilityDateTime {
  return date + "T" + time;
}

type AvailabilityGridProps = {
  availabilitiesToUsers?: Record<AvailabilityDateTime, string[]>;
  availabilityDates: AvailabilityDate[];
  endAvailabilityTime: AvailabilityTime;
  eventTimeZone: string;
  startAvailabilityTime: AvailabilityTime;
  usersToAvailabilities?: Record<string, AvailabilityDateTime[]>;
};

export default function AvailabilityGrid({
  availabilityDates,
  endAvailabilityTime,
  startAvailabilityTime
}: AvailabilityGridProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragIsAdding, setDragIsAdding] = useState(false);
  const [selectedAvailabilities, setSelectedAvailabilties] = useState<Set<AvailabilityDateTime>>(new Set());
  const [dragStartCellPosition, setDragStartCellPosition] = useState<AvailabilityCellPosition | null>(null);
  const [dragEndCellPosition, setDragEndCellPosition] = useState<AvailabilityCellPosition | null>(null);
  const [hoveredTime, setHoveredTime] = useState<AvailabilityTime | null>(null);

  // TODO: add timezone conversion
  // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const sortedAvailabilityTimes = useMemo(() => {
    const times = [];
    const timeSlotMinutes = 30;

    let currentTime = parseISO(getAvailabilityDateTimeFormat(startAvailabilityTime));
    const endTime = parseISO(getAvailabilityDateTimeFormat(endAvailabilityTime));

    while (currentTime < endTime) {
      times.push(format(currentTime, "HH:mm"));
      currentTime = addMinutes(currentTime, timeSlotMinutes);
    }
    return times;
  }, [startAvailabilityTime, endAvailabilityTime]);

  const sortedAvailabilityDates = useMemo(
    () =>
      availabilityDates.sort((date1, date2) => {
        return parseISO(date1).getTime() - parseISO(date2).getTime();
      }),
    [availabilityDates]
  );

  function handleAvailabilityCellMouseEnter(cellPosition: AvailabilityCellPosition) {
    if (isSelecting && dragStartCellPosition && dragEndCellPosition) {
      setDragEndCellPosition({ col: cellPosition.col, row: cellPosition.row });
    }
    setHoveredTime(sortedAvailabilityTimes[cellPosition.row]);
  }

  function handleAvailabilityCellMouseDown(cellPosition: AvailabilityCellPosition) {
    setIsSelecting(true);
    setDragStartCellPosition({ col: cellPosition.col, row: cellPosition.row });
    setDragEndCellPosition({ col: cellPosition.col, row: cellPosition.row });
    if (selectedAvailabilities.has(cellPositionToAvailabilityDateTime(cellPosition))) {
      setDragIsAdding(false);
    } else {
      setDragIsAdding(true);
    }
  }

  function cellPositionToAvailabilityDateTime(cellPosition: AvailabilityCellPosition): AvailabilityDateTime {
    const availabilityDate = sortedAvailabilityDates[cellPosition.col];
    const availabilityTime = sortedAvailabilityTimes[cellPosition.row];
    return getAvailabilityDateTimeFormat(availabilityTime, availabilityDate);
  }

  function saveCurrentSelection() {
    if (isSelecting === false) return;

    const newSelection = new Set<AvailabilityDateTime>(selectedAvailabilities);
    const dragSelectedAvailabilities = generateAvailabilitiesInSelectionArea();

    dragSelectedAvailabilities.forEach((availability) => {
      if (dragIsAdding) {
        newSelection.add(availability);
      } else {
        newSelection.delete(availability);
      }
    });
    setSelectedAvailabilties(newSelection);
    cancelCurrentSelection();
  }

  function cancelCurrentSelection() {
    setIsSelecting(false);
    setDragStartCellPosition(null);
    setDragEndCellPosition(null);
  }

  // generates a list of AvailabilityDateTime that are in the current selection area
  function generateAvailabilitiesInSelectionArea() {
    if (dragStartCellPosition === null || dragEndCellPosition === null) return [];
    const [minRow, maxRow] = [
      Math.min(dragStartCellPosition.row, dragEndCellPosition.row),
      Math.max(dragStartCellPosition.row, dragEndCellPosition.row)
    ];
    const [minCol, maxCol] = [
      Math.min(dragStartCellPosition.col, dragEndCellPosition.col),
      Math.max(dragStartCellPosition.col, dragEndCellPosition.col)
    ];
    const availabilities: AvailabilityDateTime[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellPosition: AvailabilityCellPosition = { col: col, row: row };
        availabilities.push(cellPositionToAvailabilityDateTime(cellPosition));
      }
    }
    return availabilities;
  }

  const earliestDate = parseISO(sortedAvailabilityDates[0]);
  const latestDate = parseISO(sortedAvailabilityDates[sortedAvailabilityDates.length - 1]);
  const areAllDatesInSameMonth = earliestDate.getMonth() === latestDate.getMonth();
  const areAllDatesInSameYear = earliestDate.getFullYear() === latestDate.getFullYear();

  const cellRowGridTemplateStyling = `4.7rem 1.2rem repeat(${sortedAvailabilityTimes.length}, minmax(1.4rem, 1fr)) 1.2rem`;

  return (
    <div
      className="grid w-full select-none grid-cols-availability-grid grid-rows-availability-grid rounded-xl border-2 border-primary bg-purple-50 bg-opacity-[0.6] py-5 pl-2 pr-10"
      onMouseLeave={cancelCurrentSelection}
      // putting saveCurrentSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={saveCurrentSelection}
      style={{
        gridTemplateColumns: "3.5rem 1fr",
        gridTemplateRows: "auto 1fr"
      }}
    >
      <AvailabilityGridHeader
        areAllDatesInSameMonth={areAllDatesInSameMonth}
        areAllDatesInSameYear={areAllDatesInSameYear}
        boxClassName="col-start-2 mb-2"
        earliestDate={earliestDate}
        latestDate={latestDate}
      />

      {/* time labels */}
      <div className="col-start-1 grid" style={{ gridTemplateRows: cellRowGridTemplateStyling }}>
        <p className="h-full">&nbsp;</p>
        <p className="h-full">&nbsp;</p>
        {sortedAvailabilityTimes.map((availabilityTime, gridRow) => (
          <AvailabilityGridRowHeader
            availabilityTime={availabilityTime}
            hoveredTime={hoveredTime}
            key={`availability-grid-row-header-${gridRow}`}
          />
        ))}
        <AvailabilityGridRowHeader
          availabilityTime={endAvailabilityTime}
          key={`availability-grid-row-header-${sortedAvailabilityDates.length}`}
        />
      </div>

      {/* availability cells */}
      <div className="col-start-2 grid cursor-pointer grid-flow-col" onMouseLeave={() => setHoveredTime(null)}>
        {sortedAvailabilityDates.map((availabilityDate, gridCol) => {
          const lastRow = sortedAvailabilityTimes.length - 1;
          const lastColumn = sortedAvailabilityDates.length - 1;

          const previousAvailabilityDate = sortedAvailabilityDates[gridCol - 1];
          const nextAvailabilityDate = sortedAvailabilityDates[gridCol + 1];

          const isDateGapLeft =
            gridCol !== 0 && !isConsecutiveDay(parseISO(previousAvailabilityDate), parseISO(availabilityDate));
          const isDateGapRight =
            gridCol !== lastColumn && !isConsecutiveDay(parseISO(availabilityDate), parseISO(nextAvailabilityDate));

          // grid columns
          return (
            <div
              className="grid h-full"
              key={`availability-column-${gridCol}`}
              style={{ gridTemplateRows: cellRowGridTemplateStyling }}
            >
              <AvailabilityGridColumnHeader
                areAllDatesInSameMonth={areAllDatesInSameMonth}
                areAllDatesInSameYear={areAllDatesInSameYear}
                availabilityDate={availabilityDate}
                isDateGapRight={isDateGapRight}
                key={`availability-grid-column-header-${gridCol}`}
                selectedAvailabilities={selectedAvailabilities}
                setSelectedAvailabilties={setSelectedAvailabilties}
                sortedAvailabilityTimes={sortedAvailabilityTimes}
              />
              {/* placeholder top row */}
              <AvailabilityGridCellBase
                className={cn("border-t-0", { "border-l-0": gridCol === 0 })}
                gridCol={lastColumn + 1}
                isDateGapLeft={isDateGapLeft}
                isDateGapRight={isDateGapRight}
                key={`availability-grid-cell-${gridCol}-${-1}`}
                onMouseEnter={() => setHoveredTime(null)}
              />

              {sortedAvailabilityTimes.map((availabilityTime, gridRow) => (
                <AvailabilityGridCell
                  availabilityDate={availabilityDate}
                  availabilityTime={availabilityTime}
                  dragEndCellPosition={dragEndCellPosition}
                  dragIsAdding={dragIsAdding}
                  dragStartCellPosition={dragStartCellPosition}
                  gridCol={gridCol}
                  gridRow={gridRow}
                  handleAvailabilityCellMouseDown={handleAvailabilityCellMouseDown}
                  handleAvailabilityCellMouseEnter={handleAvailabilityCellMouseEnter}
                  hoveredTime={hoveredTime}
                  isDateGapLeft={isDateGapLeft}
                  isDateGapRight={isDateGapRight}
                  key={`availability-grid-cell-${gridCol}-${gridRow}`}
                  selectedAvailabilities={selectedAvailabilities}
                />
              ))}

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
