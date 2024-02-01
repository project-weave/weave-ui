"use client";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import { isConsecutiveDay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  AvailabilityGridMode,
  AvailabilityType,
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
import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isFirefox } from "react-device-detect";
import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";

import { Skeleton } from "../ui/skeleton";
import { useToast } from "../ui/use-toast";
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

const SUCCESSFULLY_SAVED = "Your availability has been successfully recorded.";

export default function AvailabilityGrid({ gridContainerRef }: AvailbilityGridProps) {
  const user = useAvailabilityGridStore((state) => state.user);
  const eventDates = useAvailabilityGridStore(useShallow((state) => state.eventDates));
  const eventTimeEnd = useAvailabilityGridStore((state) => state.eventEndTimeUTC);
  const eventTimeStart = useAvailabilityGridStore((state) => state.eventStartTimeUTC);
  const participantsToTimeSlots = useAvailabilityGridStore(useShallow((state) => state.eventUserAvailability));
  const saveUserAvailability = useAvailabilityGridStore(useShallow((state) => state.saveUserAvailability));
  const [userFilter, setUserFilter] = useAvailabilityGridStore(
    useShallow((state) => [state.userFilter, state.setUserFilter])
  );
  const [mode, setMode] = useAvailabilityGridStore(useShallow((state) => [state.mode, state.setMode]));
  const availabilityType = useAvailabilityGridStore((state) => state.availabilityType);
  const setHoveredTimeSlot = useAvailabilityGridStore((state) => state.setHoveredTimeSlot);
  const setVisibleColumnRange = useAvailabilityGridStore((state) => state.setVisibleColumnRange);

  const [isBestTimesEnabled, setIsBestTimesEnabled] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set(participantsToTimeSlots[user] ?? []));

  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  // TODO: add timezone conversion
  // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // adjust grid container dimensions when dates or times are changed
  useEffect(() => {
    gridContainerRef.current?.resetAfterIndex(0);
  }, [eventDates, eventTimeStart, eventTimeEnd, gridContainerRef]);

  useEffect(() => {
    setSelectedTimeSlots(new Set(participantsToTimeSlots[user] ?? []));
    setUserFilter([]);
    setIsBestTimesEnabled(false);
  }, [user, participantsToTimeSlots]);

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
  }, [eventTimeStart, eventTimeEnd, availabilityType]);

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
    isSelecting: isDragSelecting,
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
    toast({
      action: (
        <div className="-ml-4 flex w-full items-center">
          <CheckCircle2 className="mr-2 h-6 w-6 text-green-800" />
          <div className="text-sm">{SUCCESSFULLY_SAVED}</div>
        </div>
      ),
      //description: "Successfully saved availability.",
      variant: "success"
    });
  }

  const columnHeaderHeight = availabilityType === AvailabilityType.SPECIFIC_DATES ? "5.1rem" : "3rem";

  const gridColumn = ({ index, style }: ListChildComponentProps) => {
    // rendering two extra empty columns for scroll logic
    if (index === 0 || index === sortedEventDates.length + 1) {
      return <div className="grid w-full" />;
    }

    const gridCellCol = index - 1;
    const eventDate = sortedEventDates[gridCellCol];

    const lastCellCol = sortedEventDates.length - 1;

    const prevEventDate = sortedEventDates[gridCellCol - 1];
    const nextEventDate = sortedEventDates[gridCellCol + 1];

    const isDateGapLeft = gridCellCol !== 0 && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
    const isDateGapRight =
      gridCellCol !== lastCellCol && !isConsecutiveDay(parseISO(eventDate), parseISO(nextEventDate));

    function getBorderStyle() {
      if (isViewMode(mode)) return "solid";
      const rightStyle = isDateGapRight ? "solid" : "dashed";
      const leftStyle = isDateGapLeft ? "solid" : "dashed";
      const bottomStyle = "dashed";
      const topStyle = "dashed";
      return `${topStyle} ${rightStyle} ${bottomStyle} ${leftStyle}`;
    }

    return (
      <div
        className="grid w-full"
        key={`availability-column-${gridCellCol}`}
        style={{
          gridTemplateRows: `${columnHeaderHeight} 0.7rem repeat(${sortedEventTimes.length}, minmax(0.8rem, 1fr)) 0.7rem`,
          ...style
        }}
      >
        <AvailabilityGridColumnHeader
          eventDate={eventDate}
          hasUserAddedAvailability={allParticipants.includes(user)}
          isDateGapRight={isDateGapRight}
          key={`availability-grid-column-header-${gridCellCol}`}
          mode={mode}
          selectedTimeSlots={selectedTimeSlots}
          setSelectedTimeSlots={setSelectedTimeSlots}
          sortedEventTimes={sortedEventTimes}
        />
        {/* top row cell for styling */}
        <div
          className={cn("border-b-0 border-l-2 border-t-0 border-primary-light", {
            "border-l-0": gridCellCol === 0,
            "border-l-2 border-l-primary": isDateGapLeft,
            "mr-2 border-r-2 border-r-primary": isDateGapRight
          })}
          style={{
            borderStyle: getBorderStyle()
          }}
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
              gridCol={gridCellCol}
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
              isDragSelecting={isDragSelecting}
              isSelected={selectedTimeSlots.has(timeSlot)}
              key={`availability-grid-cell-${gridCellCol}-${gridRow}`}
              maxParticipantsCountForAllTimeSlots={filteredMaxParticipantsForAllTimeSlots}
              mode={mode}
              participantsSelectedCount={filteredParticipantCountForTimeSlot}
              totalParticipants={filteredParticipants.length}
            />
          );
        })}
        {/* bottom row cell for styling */}
        <div
          className={cn("border-b-0 border-l-2 border-t-2 border-primary-light", {
            "border-l-0": gridCellCol === 0,
            "border-l-2 border-l-primary": isDateGapLeft,
            "mr-2 border-r-2 border-r-primary": isDateGapRight
          })}
          style={{
            borderStyle: getBorderStyle()
          }}
        />
      </div>
    );
  };

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
      <div className="col-start-2 row-start-1 mb-2">
        <AvailabilityGridHeader
          earliestEventDate={sortedEventDates[0]}
          editButtonAnimationControls={editButtonAnimationControls}
          gridContainerRef={gridContainerRef}
          handleSaveUserAvailability={handleSaveUserAvailability}
          hasUserAddedAvailability={participantsToTimeSlots[user]?.length > 0}
          isBestTimesEnabled={isBestTimesEnabled}
          isPageLoading={isLoading}
          // including placeholder columns
          lastColumn={sortedEventDates.length + 1}
          latestEventDate={sortedEventDates[sortedEventDates.length - 1]}
          mode={mode}
          setIsBestTimesEnabled={setIsBestTimesEnabled}
        />
      </div>

      <div
        className="col-start-1 row-start-2 grid"
        style={{
          gridTemplateRows: `${columnHeaderHeight} 0.7rem repeat(${sortedEventTimes.length}, minmax(0.8rem, 1fr)) 0.7rem`
        }}
      >
        <div className="h-full">&nbsp;</div>
        <div className="h-full">&nbsp;</div>
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

      <div className="col-start-2 row-start-2">
        {isLoading ? (
          <div className="flex h-full w-full flex-col items-center gap-4 p-2">
            <Skeleton
              className={cn("h-[4.5rem] w-full rounded-md bg-primary-light/30", {
                "h-[2.2rem]": availabilityType === AvailabilityType.DAYS_OF_WEEK
              })}
            />
            <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => {
              const maxItemWidth = 96;
              const itemWidth = Math.max(maxItemWidth, width / sortedEventDates.length);
              const tableHeight = itemWidth > maxItemWidth ? height : isFirefox ? height + 10 : height + 7;

              return (
                <VariableSizeList
                  className="overflow-x-scroll scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full"
                  height={tableHeight}
                  itemCount={sortedEventDates.length + 2}
                  itemSize={(index) => {
                    if (index === 0 || index === sortedEventDates.length + 1) return 1;
                    if (index === 1 || index === sortedEventDates.length) {
                      if (sortedEventDates.length === 1) {
                        return itemWidth - 2;
                      }
                      return itemWidth - 1;
                    }
                    return itemWidth;
                  }}
                  layout="horizontal"
                  onItemsRendered={debounce(
                    ({ visibleStartIndex, visibleStopIndex }) =>
                      setVisibleColumnRange(visibleStartIndex, visibleStopIndex),
                    100
                  )}
                  overscanCount={7}
                  ref={gridContainerRef}
                  width={width}
                >
                  {gridColumn}
                </VariableSizeList>
              );
            }}
          </AutoSizer>
        )}
      </div>
    </div>
  );
}
