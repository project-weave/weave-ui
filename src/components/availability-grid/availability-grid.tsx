import { Skeleton } from "@/components/ui/skeleton";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import { isConsecutiveDay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  AvailabilityGridMode,
  EventDate,
  EventTime,
  getTimeSlot,
  isEditMode,
  isViewMode,
  TimeSlot
} from "@/store/availabilityGridStore";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
// import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { addMinutes, format, parseISO } from "date-fns";
import { useAnimationControls } from "framer-motion";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGridCell from "./availability-grid-cell";
import AvailabilityGridColumnHeader from "./availability-grid-column-header";
import AvailabilityGridHeader from "./availability-grid-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header";
// AvailabilityCellPosition contains a row and column index that represents the position of a single cell in the availability grid
export type AvailabilityCellPosition = {
  col: number;
  row: number;
};

type AvailbilityGridProps = {
  gridContainerRef: React.RefObject<VariableSizeList>;
};

export default function AvailabilityGrid({ gridContainerRef }: AvailbilityGridProps) {
  const user = useAvailabilityGridStore((state) => state.user);
  const eventDates = useAvailabilityGridStore(useShallow((state) => state.eventData.eventDates));
  const eventTimeEnd = useAvailabilityGridStore((state) => state.eventData.endTimeUTC);
  const eventTimeStart = useAvailabilityGridStore((state) => state.eventData.startTimeUTC);
  const participantsToTimeSlots = useAvailabilityGridStore(useShallow((state) => state.eventData.userAvailability));
  const saveUserAvailability = useAvailabilityGridStore(useShallow((state) => state.saveUserAvailability));
  const [userFilter, setUserFilter] = useAvailabilityGridStore(
    useShallow((state) => [state.userFilter, state.setUserFilter])
  );
  const [mode, setMode] = useAvailabilityGridStore(useShallow((state) => [state.mode, state.setMode]));
  const setHoveredTimeSlot = useAvailabilityGridStore((state) => state.setHoveredTimeSlot);
  const setVisibleColumnRange = useAvailabilityGridStore((state) => state.setVisibleColumnRange);

  const [isBestTimesEnabled, setIsBestTimesEnabled] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set(participantsToTimeSlots[user] ?? []));
  const [isLoading, setIsLoading] = useState(true);

  // TODO: add timezone conversion
  // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    setIsLoading(false);
  }, []);

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

  // TODO: handle case when there are no event dates, waiting to fetch
  const sortedEventDates = useMemo(
    () =>
      eventDates.sort((date1, date2) => {
        return parseISO(date1).getTime() - parseISO(date2).getTime();
      }),
    [eventDates]
  );

  const {
    clearSelection: clearDragSelection,
    isAdding: isDragAdding,
    isCellBorderOfSelectionArea: isCellBorderOfSelectionArea,
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

  const handleCellMouseLeave = useCallback(() => {
    setHoveredTimeSlot(null);
  }, []);

  function handleSaveUserAvailability() {
    setMode(AvailabilityGridMode.VIEW);
    saveUserAvailability(Array.from(selectedTimeSlots));
  }

  function handleEditUserAvailability() {
    setMode(AvailabilityGridMode.EDIT);
    setIsBestTimesEnabled(false);
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
          gridContainerRef={gridContainerRef}
          handleEditUserAvailability={handleEditUserAvailability}
          handleSaveUserAvailability={handleSaveUserAvailability}
          hasUserAddedAvailability={participantsToTimeSlots[user]?.length > 0}
          isBestTimesEnabled={isBestTimesEnabled}
          lastColumn={sortedEventDates.length - 1}
          latestEventDate={sortedEventDates[sortedEventDates.length - 1]}
          mode={mode}
          setIsBestTimesEnabled={setIsBestTimesEnabled}
        />
      </div>

      <div
        // add invisible scrollbar for time label column as scrollbar on grid adds some padding to the bottom of the grid causes the grid to be misaligned wiht time labels
        className="col-start-1 grid overflow-x-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent"
        style={{
          gridTemplateRows: `5.8rem repeat(${sortedEventTimes.length}, minmax(0.8rem, 1fr)) 0.7rem`
        }}
      >
        <p className="h-full">&nbsp;</p>
        {sortedEventTimes.map((eventTime, gridRow) => (
          <AvailabilityGridRowHeader
            eventTime={eventTime}
            key={`availability-grid-row-header-${gridRow}`}
            mode={mode}
          />
        ))}
        <AvailabilityGridRowHeader
          eventTime={eventTimeEnd}
          key={`availability-grid-row-header-${sortedEventDates.length}`}
          mode={mode}
        />
      </div>
      <div className="col-start-2">
        {isLoading ? (
          <div className="flex h-full w-full flex-col items-center gap-4 p-2">
            <Skeleton className="h-[5rem] w-full rounded-md bg-primary-light/30" />
            <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <VariableSizeList
                className="overflow-y-hidden overflow-x-scroll scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full"
                height={height}
                itemCount={sortedEventDates.length + 2}
                itemSize={(index) => {
                  // rendering two extra empty columns for scroll logic
                  if (index === 0) return 0;
                  if (index === sortedEventDates.length + 1) return 1;
                  return Math.max(90, width / sortedEventDates.length);
                }}
                layout="horizontal"
                onItemsRendered={debounce(
                  ({ visibleStartIndex, visibleStopIndex }) =>
                    setVisibleColumnRange(visibleStartIndex, visibleStopIndex),
                  60
                )}
                overscanCount={9}
                ref={gridContainerRef}
                width={width}
              >
                {({ index, style }) => {
                  // rendering two extra empty columns for scroll logic
                  if (index === 0 || index === sortedEventDates.length + 1) {
                    return <div className="grid w-full" />;
                  }

                  const gridCol = index - 1;
                  const eventDate = sortedEventDates[gridCol];

                  const lastCol = sortedEventDates.length - 1;

                  const prevEventDate = sortedEventDates[gridCol - 1];
                  const nextEventDate = sortedEventDates[gridCol + 1];

                  const isDateGapLeft =
                    gridCol !== 0 && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
                  const isDateGapRight =
                    gridCol !== lastCol && !isConsecutiveDay(parseISO(eventDate), parseISO(nextEventDate));

                  return (
                    <div
                      className="grid w-full"
                      key={`availability-column-${gridCol}`}
                      style={{
                        gridTemplateRows: `5.1rem 0.7rem repeat(${sortedEventTimes.length}, minmax(0.8rem, 1fr)) 0.7rem`,
                        ...style
                      }}
                    >
                      <div>
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
                      <div
                        className={cn("border-[1px] border-b-0 border-t-0 border-primary-light", {
                          "border-l-0": gridCol === 0,
                          "border-l-2 border-l-primary": isDateGapLeft,
                          "border-r-0": gridCol === lastCol,
                          "mr-2 border-r-2 border-r-primary": isDateGapRight
                        })}
                      />
                      {sortedEventTimes.map((eventTime, gridRow) => {
                        const timeSlot = getTimeSlot(eventTime, eventDate);
                        const participantsSelectedTimeSlot = timeSlotsToParticipants[timeSlot] ?? [];
                        const filteredParticipants = userFilter.length === 0 ? allParticipants : userFilter;

                        const filteredParticipantCountForTimeSlot = filteredParticipants.filter((participant) =>
                          participantsSelectedTimeSlot.includes(participant)
                        ).length;

                        const filteredMaxParticipantsForAllTimeSlots = Object.values(timeSlotsToParticipants).reduce(
                          (maxCount, paricipants) => {
                            const filteredCount = filteredParticipants.filter((participant) =>
                              paricipants.includes(participant)
                            ).length;
                            return Math.max(maxCount, filteredCount);
                          },
                          0
                        );

                        return (
                          <AvailabilityGridCell
                            eventDate={eventDate}
                            eventTime={eventTime}
                            gridCol={gridCol}
                            gridRow={gridRow}
                            handleCellMouseDown={handleCellMouseDown}
                            handleCellMouseEnter={handleCellMouseEnter}
                            handleCellMouseLeave={handleCellMouseLeave}
                            isBestTimesEnabled={isBestTimesEnabled}
                            isCellBorderOfDragSelectionArea={isCellBorderOfSelectionArea}
                            isCellInDragSelectionArea={isCellInDragSelectionArea}
                            isDateGapLeft={isDateGapLeft}
                            isDateGapRight={isDateGapRight}
                            isDragAdding={isDragAdding}
                            isLastCol={gridCol === lastCol}
                            isSelected={selectedTimeSlots.has(timeSlot)}
                            key={`availability-grid-cell-${gridCol}-${gridRow}`}
                            maxParticipantsCountForAllTimeSlots={filteredMaxParticipantsForAllTimeSlots}
                            mode={mode}
                            participantsSelectedCount={filteredParticipantCountForTimeSlot}
                            totalParticipants={filteredParticipants.length}
                          />
                        );
                      })}
                      {/* bottom row cell for styling */}
                      <div
                        className={cn("border-[1px] border-b-0 border-t-2 border-primary-light", {
                          "border-l-0": gridCol === 0,
                          "border-l-2 border-l-primary": isDateGapLeft,
                          "border-r-0": gridCol === lastCol,
                          "mr-2 border-r-2 border-r-primary": isDateGapRight
                        })}
                      />
                    </div>
                  );
                }}
              </VariableSizeList>
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  );
}
