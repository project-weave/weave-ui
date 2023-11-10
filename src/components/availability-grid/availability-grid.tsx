import { isConsecutiveDay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
// import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { addMinutes, format, parseISO } from "date-fns";
import { useMemo, useState } from "react";

import AvailabilityGridColumnHeader from "./availability-grid-column-header";
import AvailabilityGridHeader from "./availability-grid-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header";

// AvailabilityDateTime is an ISO formatted date string that represents a single availbability
export type AvailabilityDateTime = string;

// AvailabilityCellPosition contains a row and column index that represents the position of a single cell in the availability grid
export type AvailabilityCellPosition = {
  col: number;
  row: number;
};

// assuming that when only time is passed in as a parameter, we're only interested in time so we we can use an aribtrary date to parse
export function getAvailabilityDateTimeFormat(time: string, date: string = "2000-11-29"): AvailabilityDateTime {
  return date + "T" + time;
}

// TODO: fetch data from backend and pass in as prop
const sampleData = {
  eventName: "test",
  eventDatesUTC: [
    "2023-10-01",
    "2023-10-15",
    "2023-10-17",
    "2023-10-18",
    "2023-10-20",
    "2023-10-21",
    "2023-10-22",
    "2023-10-23",
    "2023-10-24",
    "2023-10-26"
  ],
  startTimeUTC: "08:00:00",
  endTimeUTC: "16:00:00",
  eventTimeZone: "America/Vancouver"
};

export default function AvailabilityGrid() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isAdding, setIsAdding] = useState(true);
  const [selectedAvailability, setSelectedAvailabilty] = useState<Set<AvailabilityDateTime>>(new Set());
  const [selectionStartCell, setSelectionStartCell] = useState<AvailabilityCellPosition | null>(null);
  const [selectionEndCell, setSelectionEndCell] = useState<AvailabilityCellPosition | null>(null);
  const [hoveredTime, setHoveredTime] = useState<null | string>(null);

  // TODO: add timezone conversion
  // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const sortedTimesUTC = useMemo(() => {
    const timesUTC = [];
    const timeSlotMinutes = 30;

    let currentTime = parseISO(getAvailabilityDateTimeFormat(sampleData.startTimeUTC));
    const endTime = parseISO(getAvailabilityDateTimeFormat(sampleData.endTimeUTC));

    while (currentTime < endTime) {
      timesUTC.push(format(currentTime, "HH:mm"));
      currentTime = addMinutes(currentTime, timeSlotMinutes);
    }
    return timesUTC;
  }, []);

  const sortedDatesUTC = useMemo(
    () =>
      sampleData.eventDatesUTC.sort((date1, date2) => {
        return new Date(date1).getTime() - new Date(date2).getTime();
      }),
    []
  );

  function handleAvailabilityCellMouseEnter(cellPosition: AvailabilityCellPosition) {
    if (isSelecting && selectionStartCell && selectionEndCell) {
      setSelectionEndCell({ row: cellPosition.row, col: cellPosition.col });
    }
    setHoveredTime(sortedTimesUTC[cellPosition.row]);
  }

  function handleAvailabilityCellMouseDown(cellPosition: AvailabilityCellPosition) {
    setIsSelecting(true);
    setSelectionStartCell({ row: cellPosition.row, col: cellPosition.col });
    setSelectionEndCell({ row: cellPosition.row, col: cellPosition.col });
    if (selectedAvailability.has(cellPositionToAvailabilityDateTime(cellPosition))) {
      setIsAdding(false);
    } else {
      setIsAdding(true);
    }
  }

  function cellPositionToAvailabilityDateTime(cellPosition: AvailabilityCellPosition): AvailabilityDateTime {
    const cellDate = sortedDatesUTC[cellPosition.col];
    const cellTime = sortedTimesUTC[cellPosition.row];
    return getAvailabilityDateTimeFormat(cellTime, cellDate);
  }

  function saveCurrentSelection() {
    if (isSelecting === false) return;

    const newSelection = new Set<AvailabilityDateTime>(selectedAvailability);
    const selectedAvailabilities = generateAvailabilitiesInSelectionArea();

    selectedAvailabilities.forEach((availability) => {
      if (isAdding) {
        newSelection.add(availability);
      } else {
        newSelection.delete(availability);
      }
    });
    setSelectedAvailabilty(newSelection);
    cancelCurrentSelection();
  }

  function cancelCurrentSelection() {
    setIsSelecting(false);
    setSelectionStartCell(null);
    setSelectionEndCell(null);
  }

  // generates a list of AvailabilityDateTime that are in the current selection area
  function generateAvailabilitiesInSelectionArea() {
    if (selectionStartCell === null || selectionEndCell === null) return [];
    const [minRow, maxRow] = [
      Math.min(selectionStartCell.row, selectionEndCell.row),
      Math.max(selectionStartCell.row, selectionEndCell.row)
    ];
    const [minCol, maxCol] = [
      Math.min(selectionStartCell.col, selectionEndCell.col),
      Math.max(selectionStartCell.col, selectionEndCell.col)
    ];
    const availabilities: AvailabilityDateTime[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellPosition: AvailabilityCellPosition = { row: row, col: col };
        availabilities.push(cellPositionToAvailabilityDateTime(cellPosition));
      }
    }
    return availabilities;
  }

  function isCellInSelectionArea(cellPosition: AvailabilityCellPosition): boolean {
    if (selectionStartCell === null || selectionEndCell === null) return false;
    const [minRow, maxRow] = [
      Math.min(selectionStartCell.row, selectionEndCell.row),
      Math.max(selectionStartCell.row, selectionEndCell.row)
    ];
    const [minCol, maxCol] = [
      Math.min(selectionStartCell.col, selectionEndCell.col),
      Math.max(selectionStartCell.col, selectionEndCell.col)
    ];
    return (
      minRow <= cellPosition.row &&
      cellPosition.row <= maxRow &&
      minCol <= cellPosition.col &&
      cellPosition.col <= maxCol
    );
  }

  const earliestDate = parseISO(sortedDatesUTC[0]);
  const latestDate = parseISO(sortedDatesUTC[sortedDatesUTC.length - 1]);
  const areAllDatesInSameMonth = earliestDate.getMonth() === latestDate.getMonth();
  const areAllDatesInSameYear = earliestDate.getFullYear() === latestDate.getFullYear();

  const gridTemplateRowStying = `5.5rem 1.5rem repeat(${sortedTimesUTC.length}, minmax(2rem, 1fr)) 1.5rem`;

  return (
    <div
      className="grid w-full select-none grid-cols-availability-grid rounded-xl border-2 border-primary bg-purple-50 bg-opacity-[0.6] py-5 pl-2 pr-10"
      onMouseLeave={cancelCurrentSelection}
      // putting saveCurrentSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={saveCurrentSelection}
    >
      <AvailabilityGridHeader
        areAllDatesInSameMonth={areAllDatesInSameMonth}
        areAllDatesInSameYear={areAllDatesInSameYear}
        boxClassName="col-start-2 col-span-3 mb-4"
        earliestDate={earliestDate}
        latestDate={latestDate}
      />

      {/* time labels */}
      <div className="col-start-1 grid" style={{ gridTemplateRows: gridTemplateRowStying }}>
        <p className="h-full">&nbsp;</p>
        <p className="h-full">&nbsp;</p>
        {sortedTimesUTC.map((timeStrUTC, gridRow) => {
          return (
            <AvailabilityGridRowHeader
              hoveredTime={hoveredTime}
              key={`availability-grid-row-header-${gridRow}`}
              timeStrUTC={timeStrUTC}
            />
          );
        })}
        <AvailabilityGridRowHeader hoveredTime={hoveredTime} timeStrUTC={sampleData.endTimeUTC} />
      </div>

      {/* availability columns */}
      <div className="col-start-2 grid cursor-pointer grid-flow-col" onMouseLeave={() => setHoveredTime(null)}>
        {sortedDatesUTC.map((dateStrUTC, gridCol) => {
          const isFirstColumn = gridCol === 0;
          const isLastColumn = gridCol === sortedDatesUTC.length - 1;

          const previousDateStr = sortedDatesUTC[gridCol - 1];
          const nextDateStr = sortedDatesUTC[gridCol + 1];

          const isDateGapLeft = !isFirstColumn && !isConsecutiveDay(parseISO(previousDateStr), parseISO(dateStrUTC));
          const isDateGapRight = !isLastColumn && !isConsecutiveDay(parseISO(dateStrUTC), parseISO(nextDateStr));

          const emptyTopRowCell = (
            <div
              className={cn("h-6 border-2 border-b-0 border-l-0 border-t-0 border-primary-light", {
                "border-r-0": isLastColumn,
                "ml-2 border-l-2 border-l-primary": isDateGapLeft,
                "border-r-primary": isDateGapRight
              })}
              onMouseEnter={() => setHoveredTime(null)}
            />
          );
          const emptyBottomRowCell = (
            <div
              className={cn("h-6 border-2 border-b-0 border-l-0 border-primary-light", {
                "border-r-0": isLastColumn,
                "ml-2 border-l-2 border-l-primary": isDateGapLeft,
                "border-r-primary": isDateGapRight
              })}
              onMouseEnter={() => setHoveredTime(null)}
            />
          );

          // column component
          return (
            <div
              className="grid"
              key={`availability-column-${gridCol}`}
              style={{ gridTemplateRows: gridTemplateRowStying }}
            >
              <AvailabilityGridColumnHeader
                areAllDatesInSameMonth={areAllDatesInSameMonth}
                areAllDatesInSameYear={areAllDatesInSameYear}
                dateStrUTC={dateStrUTC}
                isDateGapLeft={isDateGapLeft}
                selectedAvailability={selectedAvailability}
                setSelectedAvailabilty={setSelectedAvailabilty}
                sortedTimesUTC={sortedTimesUTC}
              />
              {emptyTopRowCell}
              {sortedTimesUTC.map((timeStrUTC, gridRow) => {
                const availabilitySlot = getAvailabilityDateTimeFormat(timeStrUTC, dateStrUTC);
                const cellPosition: AvailabilityCellPosition = { row: gridRow, col: gridCol };

                const isSelected = selectedAvailability.has(availabilitySlot);
                const isBeingAdded = isAdding && isSelecting && isCellInSelectionArea(cellPosition);
                const isBeingRemoved = !isAdding && isSelecting && isCellInSelectionArea(cellPosition);
                const isTimeHovered = timeStrUTC === hoveredTime;

                // cells component
                return (
                  <div
                    className={cn(
                      "border-2 border-b-0 border-l-0 border-primary-light text-center hover:bg-purple-100",
                      {
                        "bg-primary hover:bg-primary hover:bg-opacity-70": isSelected || isBeingAdded,
                        "bg-opacity-25 hover:bg-opacity-40": isBeingRemoved,
                        "border-r-0": isLastColumn,
                        "ml-2 border-l-2 border-l-primary": isDateGapLeft,
                        "border-r-primary": isDateGapRight,
                        "border-t-4": isTimeHovered
                      }
                    )}
                    key={`availability-cell-${gridCol}-${gridRow}`}
                    onMouseDown={() => handleAvailabilityCellMouseDown(cellPosition)}
                    onMouseEnter={() => handleAvailabilityCellMouseEnter(cellPosition)}
                  />
                );
              })}
              {emptyBottomRowCell}
            </div>
          );
        })}
      </div>
    </div>
  );
}
