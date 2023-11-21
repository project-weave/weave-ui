"use client";
import { useElementsOnScreen } from "@/hooks/useElementsOnScreen";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import { isConsecutiveDay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  AvailabilityGridMode,
  EventDate,
  EventTime,
  getTimeFromTimeSlot,
  getTimeSlot,
  isEditMode,
  isViewMode,
  TimeSlot
} from "@/store/availabilityGridStore";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
// import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { addMinutes, format, parseISO } from "date-fns";
import { useAnimationControls } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import AvailabilityGridCell, { AvailabilityGridCellBase } from "./availability-grid-cell";
import AvailabilityGridColumnHeader from "./availability-grid-column-header";
import AvailabilityGridHeader from "./availability-grid-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header";

// AvailabilityCellPosition contains a row and column index that represents the position of a single cell in the availability grid
export type AvailabilityCellPosition = {
  col: number;
  row: number;
};

export default function AvailabilityGrid() {
  const user = useAvailabilityGridStore((state) => state.user);
  const eventDates = useAvailabilityGridStore((state) => state.eventData.eventDates);
  const eventTimeEnd = useAvailabilityGridStore((state) => state.eventData.endTimeUTC);
  const eventTimeStart = useAvailabilityGridStore((state) => state.eventData.startTimeUTC);
  const participantsToTimeSlots = useAvailabilityGridStore((state) => state.eventData.userAvailability);
  const saveUserAvailability = useAvailabilityGridStore((state) => state.saveUserAvailability);
  const [userFilter, setUserFilter] = useAvailabilityGridStore((state) => [state.userFilter, state.setUserFilter]);
  const [mode, setMode] = useAvailabilityGridStore((state) => [state.mode, state.setMode]);
  const [hoveredTimeSlot, setHoveredTimeSlot] = useAvailabilityGridStore((state) => [
    state.hoveredTimeSlot,
    state.setHoveredTimeSlot
  ]);

  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set(participantsToTimeSlots[user] ?? []));

  // TODO: add timezone conversion
  // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const sortedEventTimes = useMemo(() => {
    const times = [];
    const timeSlotMinutes = 30;

    let currentTime = parseISO(getTimeSlot(eventTimeStart));
    const endTime = parseISO(getTimeSlot(eventTimeEnd));

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
    const sortedDates = sortedColumnNums.map((colNum) => sortedEventDates[colNum]);

    return [sortedColumnNums, sortedDates];
  }, [visibleColumnIds, sortedEventDates]);

  const {
    clearSelection: clearDragSelection,
    isAdding: isDragAdding,
    isCellInSelectionArea: isCellInDragSelectionArea,
    onMouseDown: onDragSelectMouseDown,
    onMouseEnter: onDragSelectMouseEnter,
    saveSelection: saveDragSelection
  } = useGridDragSelect<EventTime, EventDate, TimeSlot>(
    sortedEventTimes,
    sortedEventDates,
    getTimeSlot,
    selectedTimeSlots,
    setSelectedTimeSlots
  );

  const allParticipants = Object.keys(participantsToTimeSlots);

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

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isEditMode(mode)) {
        onDragSelectMouseEnter(row, col);
      }
      setHoveredTimeSlot(getTimeSlot(sortedEventTimes[row], sortedEventDates[col]));
    },
    [mode, sortedEventTimes, sortedEventDates, onDragSelectMouseEnter]
  );

  const editButtonAnimationControls = useAnimationControls();

  const handleCellMouseDown = useCallback(
    (row: number, col: number) => {
      if (isViewMode(mode)) {
        editButtonAnimationControls.start({
          transition: { duration: 0.5, ease: "easeInOut" },
          x: [0, -5, 5, -5, 5, 0]
        });
      } else {
        onDragSelectMouseDown(row, col);
      }
    },
    [mode, onDragSelectMouseDown]
  );
  function handleSaveUserAvailability() {
    setMode(AvailabilityGridMode.VIEW);
    saveUserAvailability(Array.from(selectedTimeSlots));
  }

  function handleEditUserAvailability() {
    setMode(AvailabilityGridMode.EDIT);
    setUserFilter([]);
  }

  return (
    <div
      className="card grid select-none border-2 pl-2 pr-10"
      // mouseUp is cancelled when onContextMenu is triggered so we need to save the selection here as well
      onContextMenu={saveDragSelection}
      onMouseLeave={clearDragSelection}
      // putting saveDragSelection here to handle the case where the user lets go of the mouse outside of the grid cells
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
          handleEditUserAvailability={handleEditUserAvailability}
          handleSaveUserAvailability={handleSaveUserAvailability}
          hasUserAddedAvailability={participantsToTimeSlots[user]?.length > 0}
          lastColumn={sortedEventDates.length - 1}
          latestEventDate={sortedEventDates[sortedEventDates.length - 1]}
          mode={mode}
          sortedColumnRefs={columnRefs}
          sortedVisibleColumnNums={sortedVisibleColumnNums}
        />
      </div>

      <div
        className="col-start-1 grid"
        style={{
          gridTemplateRows: `5.8rem repeat(${sortedEventTimes.length}, minmax(0.8rem, 1fr)) 0.7rem 8px`
        }}
      >
        <p className="h-full">&nbsp;</p>
        {sortedEventTimes.map((eventTime, gridRow) => (
          <AvailabilityGridRowHeader eventTime={eventTime} key={`availability-grid-row-header-${gridRow}`} />
        ))}
        <AvailabilityGridRowHeader
          eventTime={eventTimeEnd}
          key={`availability-grid-row-header-${sortedEventDates.length}`}
        />
      </div>

      <div
        className="col-start-2 grid h-full snap-x scroll-mt-2 grid-flow-col overflow-x-scroll scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full"
        onMouseLeave={() => setHoveredTimeSlot(null)}
        ref={columnContainerRef}
      >
        {sortedEventDates.map((eventDate, gridCol) => {
          const lastRow = sortedEventTimes.length - 1;
          const lastColumn = sortedEventDates.length - 1;

          const prevEventDate = sortedEventDates[gridCol - 1];
          const nextEventDate = sortedEventDates[gridCol + 1];

          const isDateGapLeft = gridCol !== 0 && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
          const isDateGapRight =
            gridCol !== lastColumn && !isConsecutiveDay(parseISO(eventDate), parseISO(nextEventDate));

          return (
            <div
              className="grid h-full min-w-[5rem] snap-start"
              key={`availability-column-${gridCol}`}
              style={{
                gridTemplateRows: `5.1rem 0.7rem repeat(${sortedEventTimes.length}, minmax(0.8rem, 1fr)) 0.7rem`
              }}
            >
              <div observable-el-id={gridCol} ref={(el) => (columnRefs.current[gridCol] = el)}>
                <AvailabilityGridColumnHeader
                  eventDate={eventDate}
                  hasUserAddedAvailability={allParticipants.includes(user)}
                  isDateGapRight={isDateGapRight}
                  key={`availability-grid-column-header-${gridCol}`}
                  mode={mode}
                  selectedTimeSlots={selectedTimeSlots}
                  setSelectedTimeSlots={setSelectedTimeSlots}
                  sortedEventTimes={sortedEventTimes}
                />
              </div>

              {/* top row cell for styling */}
              <AvailabilityGridCellBase
                className={cn("border-t-0", { "border-l-0": gridCol === 0 })}
                gridCol={gridCol}
                gridRow={-1}
                handleCellMouseDown={() => {}}
                handleCellMouseEnter={() => setHoveredTimeSlot(null)}
                isDateGapLeft={isDateGapLeft}
                isDateGapRight={isDateGapRight}
                isTimeHovered={false}
                isTimeSlotHovered={false}
                key={`availability-grid-cell-${gridCol}-${-1}`}
                mode={mode}
              />

              {sortedEventTimes.map((eventTime, gridRow) => {
                const timeSlot = getTimeSlot(eventTime, eventDate);

                const participantsSelectedTimeSlot = timeSlotsToParticipants[timeSlot] ?? [];
                const filteredParticipants = userFilter.length === 0 ? allParticipants : userFilter;

                return (
                  <AvailabilityGridCell
                    gridCol={gridCol}
                    gridRow={gridRow}
                    handleCellMouseDown={handleCellMouseDown}
                    handleCellMouseEnter={handleCellMouseEnter}
                    isBeingAdded={isDragAdding && isCellInDragSelectionArea(gridRow, gridCol)}
                    isBeingRemoved={!isDragAdding && isCellInDragSelectionArea(gridRow, gridCol)}
                    isDateGapLeft={isDateGapLeft}
                    isDateGapRight={isDateGapRight}
                    isSelected={selectedTimeSlots.has(timeSlot)}
                    isTimeHovered={getTimeFromTimeSlot(hoveredTimeSlot) === eventTime}
                    isTimeSlotHovered={hoveredTimeSlot === timeSlot}
                    key={`availability-grid-cell-${gridCol}-${gridRow}`}
                    mode={mode}
                    participantsSelectedCount={
                      filteredParticipants.filter((p) => participantsSelectedTimeSlot.includes(p)).length
                    }
                    totalParticipants={filteredParticipants.length}
                  />
                );
              })}

              {/* bottom row cell for styling */}
              <AvailabilityGridCellBase
                className={cn("border-b-0", { "border-l-0": gridCol === 0 })}
                gridCol={gridCol}
                gridRow={lastRow + 1}
                handleCellMouseDown={() => {}}
                handleCellMouseEnter={() => setHoveredTimeSlot(null)}
                isDateGapLeft={isDateGapLeft}
                isDateGapRight={isDateGapRight}
                isTimeHovered={false}
                isTimeSlotHovered={false}
                key={`availability-grid-cell-${gridCol}-${lastRow + 1}}`}
                mode={mode}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
