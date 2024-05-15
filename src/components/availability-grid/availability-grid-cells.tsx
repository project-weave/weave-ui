"use client";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import useAvailabilityGridStore, {
  AvailabilityType,
  EVENT_TIME_FORMAT,
  EventDate,
  EventTime,
  getTimeSlot,
  isEditMode,
  isViewMode,
  TimeSlot
} from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { isConsecutiveDay } from "@/utils/date";
import { addMinutes, format, parseISO } from "date-fns";
import { useAnimate } from "framer-motion";
import debounce from "lodash.debounce";
import { useCallback } from "react";
import { isFirefox } from "react-device-detect";
import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";
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

type AvailbilityGridCellsProps = {
  allParticipants: string[];
  availabilityType: AvailabilityType;
  eventEndTime: EventTime;
  gridContainerRef: React.RefObject<VariableSizeList>;
  handleSaveUserAvailability: (user: string) => void;
  handleUserChange: (user: string) => void;
  sortedEventDates: EventDate[];
  sortedEventTimes: EventTime[];
  timeSlotsToParticipants: Readonly<Record<TimeSlot, string[]>>;
};

export default function AvailabilityGridCells({
  allParticipants,
  availabilityType,
  eventEndTime,
  gridContainerRef,
  handleSaveUserAvailability,
  handleUserChange,
  sortedEventDates,
  sortedEventTimes,
  timeSlotsToParticipants
}: AvailbilityGridCellsProps) {
  const mode = useAvailabilityGridStore((state) => state.mode);
  const user = useAvailabilityGridStore((state) => state.user);
  const isBestTimesEnabled = useAvailabilityGridStore((state) => state.isBestTimesEnabled);

  const userFilter = useAvailabilityGridStore(useShallow((state) => state.userFilter));
  const setHoveredTimeSlot = useAvailabilityGridStore((state) => state.setHoveredTimeSlot);
  const setVisibleColumnRange = useAvailabilityGridStore((state) => state.setVisibleColumnRange);

  const [selectedTimeSlots, addSelectedTimeSlots, removeSelectedTimeSlots] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeSlots, state.addSelectedTimeSlots, state.removeSelectedTimeSlots])
  );

  // TODO: add timezone logic
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
    addSelectedTimeSlots,
    removeSelectedTimeSlots
  );

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isEditMode(mode)) {
        onDragSelectMouseEnter(row, col);
      }
      setHoveredTimeSlot(getTimeSlot(sortedEventTimes[row], sortedEventDates[col]));
    },
    [mode, sortedEventTimes, sortedEventDates, onDragSelectMouseEnter]
  );

  const [scope, animate] = useAnimate();

  const handleCellMouseDown = useCallback(
    (row: number, col: number) => {
      if (isViewMode(mode)) {
        animate(scope.current, {
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
          availabilityType={availabilityType}
          eventDate={eventDate}
          hasUserAddedAvailability={allParticipants.includes(user)}
          isDateGapRight={isDateGapRight}
          key={`availability-grid-column-header-${gridCellCol}`}
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
              isSelected={selectedTimeSlots.includes(timeSlot)}
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
      className="card border-1 grid select-none pl-2 pr-10"
      // mouseUp is cancelled when onContextMenu is triggered so we need to save the selection here as well
      onContextMenu={saveDragSelection}
      onMouseLeave={clearDragSelection}
      // putting saveDragSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={saveDragSelection}
      style={{
        gridTemplateColumns: "4.8rem 1fr",
        gridTemplateRows: "auto 1fr"
      }}
    >
      <div className="col-start-2 row-start-1 mb-2">
        <AvailabilityGridHeader
          allParticipants={allParticipants}
          availabilityType={availabilityType}
          earliestEventDate={sortedEventDates[0]}
          editButtonAnimationScope={scope}
          gridContainerRef={gridContainerRef}
          handleSaveUserAvailability={handleSaveUserAvailability}
          handleUserChange={handleUserChange}
          hasUserAddedAvailability={selectedTimeSlots.length > 0}
          // including placeholder columns
          lastColumn={sortedEventDates.length + 1}
          latestEventDate={sortedEventDates[sortedEventDates.length - 1]}
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
          eventTime={format(addMinutes(parseISO(getTimeSlot(eventEndTime)), 30), EVENT_TIME_FORMAT)}
          key={`availability-grid-row-header-${sortedEventDates.length}`}
          mode={mode}
        />
      </div>

      <div className="col-start-2 row-start-2">
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
      </div>
    </div>
  );
}
