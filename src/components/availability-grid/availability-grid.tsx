"use client";
import { ScrollToState } from "@/app/(event)/[eventId]/page";
import useUpdateAvailability, { UpdateAvailabilityRequest } from "@/hooks/requests/useUpdateAvailability";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import useAvailabilityGridStore, {
  AvailabilityGridMode,
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
import { addMinutes, format, parseISO } from "date-fns";
import { useAnimate } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alignment, GridCellProps, Index, MultiGrid, SectionRenderedParams } from "react-virtualized";
import AutoSizer from "react-virtualized-auto-sizer";
import "react-virtualized/styles.css";
import { useShallow } from "zustand/react/shallow";

import { EventResponse } from "../../types/Event";
import { useToast } from "../ui/use-toast";
import AvailabilityGridCell from "./availability-grid-cell";
import AvailabilityGridColumnHeader from "./availability-grid-column-header";
import AvailabilityGridHeader from "./availability-grid-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header"; // only needs to be imported once

type AvailbilityGridProps = {
  allParticipants: string[];
  availabilityType: AvailabilityType;
  eventDates: EventDate[];
  eventEndTime: EventTime;
  eventId: string;
  eventResponses: EventResponse[];
  eventStartTime: EventTime;
  scrollToState: ScrollToState;
  setScrollToState: (colIndex: number, align: Alignment) => void;
  sortedEventDates: EventDate[];
  sortedEventTimes: EventTime[];
  timeSlotsToParticipants: Record<TimeSlot, string[]>;
};

export default function AvailabilityGrid({
  allParticipants,
  availabilityType,
  eventDates,
  eventEndTime,
  eventId,
  eventResponses,
  eventStartTime,
  scrollToState,
  setScrollToState,
  sortedEventDates,
  sortedEventTimes,
  timeSlotsToParticipants
}: AvailbilityGridProps) {
  const setUser = useAvailabilityGridStore(useShallow((state) => state.setUser));
  const setUserFilter = useAvailabilityGridStore(useShallow((state) => state.setUserFilter));
  const [isBestTimesEnabled, setIsBestTimesEnabled] = useAvailabilityGridStore(
    useShallow((state) => [state.isBestTimesEnabled, state.setIsBestTimesEnabled])
  );

  const [scrollToColumn, setScrollToColumn] = useState(-1);
  const setMode = useAvailabilityGridStore(useShallow((state) => state.setMode));
  const [selectedTimeSlots, setSelectedTimeSlots, addSelectedTimeSlots, removeSelectedTimeSlots] =
    useAvailabilityGridStore(
      useShallow((state) => [
        state.selectedTimeSlots,
        state.setSelectedTimeSlots,
        state.addSelectedTimeSlots,
        state.removeSelectedTimeSlots
      ])
    );
  const user = useAvailabilityGridStore(useShallow((state) => state.user));
  const userFilter = useAvailabilityGridStore(useShallow((state) => state.userFilter));
  const mode = useAvailabilityGridStore((state) => state.mode);
  const setHoveredTimeSlot = useAvailabilityGridStore((state) => state.setHoveredTimeSlot);
  const setVisibleColumnRange = useAvailabilityGridStore((state) => state.setVisibleColumnRange);
  const setFocusedDate = useAvailabilityGridStore(useShallow((state) => state.setFocusedDate));

  const { mutate } = useUpdateAvailability();
  const { toast } = useToast();

  const gridRef = useRef<MultiGrid>(null);

  // TODO: add timezone logic
  console.log(gridRef);

  function resetGridStateForUser(user: string) {
    setUser(user);
    setIsBestTimesEnabled(false);
    setUserFilter([]);
    setHoveredTimeSlot(null);
    setFocusedDate(null);

    const userResponse = eventResponses.find(({ alias }) => {
      // TODO: use user_id as well when logged in users functionality is implemented
      return user === alias;
    });

    if (userResponse !== undefined) {
      setSelectedTimeSlots(userResponse.availabilities || []);
    } else {
      setSelectedTimeSlots([]);
    }
  }

  useEffect(() => {
    return resetGridStateForUser("");
  }, []);

  // useEffect(() => {
  //   // adjust grid container dimensions when dates or times are changed s
  //   gridContainerRef.current?.resetAfterIndex(0);
  // }, [eventDates, eventStartTime, eventEndTime, gridContainerRef]);

  function handleSaveUserAvailability(user: string) {
    const req: UpdateAvailabilityRequest = {
      alias: user,
      availabilities: Array.from(selectedTimeSlots),
      eventId: eventId
    };

    mutate(req, {
      onError: () => {
        toast({
          description: "An error occurred while saving your availability. Please try again later.",
          title: "Oh no! Something went wrong",
          variant: "failure"
        });
      },
      onSuccess: () => {
        toast({
          description: "Your availability has been successfully recorded.",
          title: "Congrats!",
          variant: "success"
        });
      }
    });

    setMode(AvailabilityGridMode.VIEW);
    resetGridStateForUser("");
  }

  const {
    clearSelection: clearDragSelection,
    isAdding: isDragAdding,
    isCellBorderOfSelectionArea: isCellBorderOfSelectionArea,
    isCellInSelectionArea: isCellInDragSelectionArea,
    isSelecting: isDragSelecting,
    onDragMove,
    onDragStart,
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
        onDragMove(row, col);
      }
      setHoveredTimeSlot(getTimeSlot(sortedEventTimes[row], sortedEventDates[col]));
    },
    [mode, sortedEventTimes, sortedEventDates, onDragMove]
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
        onDragStart(row, col);
      }
    },
    [mode, onDragStart]
  );

  const handleCellMouseLeave = useCallback(() => {
    setHoveredTimeSlot(null);
  }, []);
  const columnHeaderHeight = availabilityType === AvailabilityType.SPECIFIC_DATES ? "3.2rem" : "2.7rem";

  const lastRowIndex = sortedEventTimes.length + 2;
  const lastColumnIndex = sortedEventDates.length + 2;
  const cellRenderer = ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }: GridCellProps) => {
    if (columnIndex === 0 && rowIndex === 0) return <div></div>;

    // temp rows for scrolling logic
    if (rowIndex === 1) return <div></div>;
    if (rowIndex === lastRowIndex) return <div></div>;

    if (rowIndex === 0 && columnIndex >= 2 && columnIndex <= lastColumnIndex - 1) {
      const eventDate = sortedEventDates[columnIndex - 2];
      return (
        <AvailabilityGridColumnHeader
          availabilityType={availabilityType}
          eventDate={eventDate}
          hasUserAddedAvailability={allParticipants.includes(user)}
          isDateGapRight={false}
          key={`availability-grid-column-header-${columnIndex - 2}`}
          sortedEventTimes={sortedEventTimes}
          style={style}
        />
      );
    }
    if (columnIndex === 0) {
      if (rowIndex === lastRowIndex) {
        return (
          <AvailabilityGridRowHeader
            eventTime={format(addMinutes(parseISO(getTimeSlot(eventEndTime)), 30), EVENT_TIME_FORMAT)}
            key={`availability-grid-row-header-${sortedEventDates.length}`}
            mode={mode}
            style={style}
          />
        );
      }
      const eventTime = sortedEventTimes[rowIndex - 2];
      return (
        <AvailabilityGridRowHeader
          eventTime={eventTime}
          key={`availability-grid-row-header-${rowIndex}`}
          mode={mode}
          style={style}
        />
      );
    }
    if (columnIndex === 1) return <div></div>;
    if (columnIndex === lastColumnIndex) return <div></div>;

    const eventTime = sortedEventTimes[rowIndex - 2];
    const eventDate = sortedEventDates[columnIndex - 2];
    const timeSlot = getTimeSlot(eventTime, eventDate);
    const participantsSelectedTimeSlot = timeSlotsToParticipants[timeSlot] ?? [];
    const filteredParticipants = userFilter.length === 0 ? allParticipants : userFilter;

    const filteredParticipantCountForTimeSlot = filteredParticipants.filter((participant) =>
      participantsSelectedTimeSlot.includes(participant)
    ).length;

    const filteredMaxParticipantsForAllTimeSlots = Object.values(timeSlotsToParticipants).reduce(
      (maxCount, paricipants) => {
        const filteredCount = filteredParticipants.filter((participant) => paricipants.includes(participant)).length;
        return Math.max(maxCount, filteredCount);
      },
      0
    );

    return (
      <AvailabilityGridCell
        eventDate={eventDate}
        eventTime={eventTime}
        gridCol={columnIndex - 2}
        gridRow={rowIndex - 2}
        handleCellMouseDown={handleCellMouseDown}
        handleCellMouseEnter={handleCellMouseEnter}
        handleCellMouseLeave={handleCellMouseLeave}
        isBestTimesEnabled={isBestTimesEnabled}
        isCellBorderOfDragSelectionArea={isCellBorderOfSelectionArea}
        isCellInDragSelectionArea={isCellInDragSelectionArea}
        isDateGapLeft={false}
        isDateGapRight={false}
        isDragAdding={isDragAdding}
        isDragSelecting={isDragSelecting}
        isSelected={selectedTimeSlots.includes(timeSlot)}
        key={`availability-grid-cell-${columnIndex - 2}-${rowIndex - 2}`}
        maxParticipantsCountForAllTimeSlots={filteredMaxParticipantsForAllTimeSlots}
        mode={mode}
        participantsSelectedCount={filteredParticipantCountForTimeSlot}
        style={style}
        totalParticipants={filteredParticipants.length}
      />
    );
  };

  function getWidth(index: number, itemWidth: number): number {
    switch (index) {
      case 0:
        return 80;
      case 1:
      case lastColumnIndex:
        return 1;
      case 2:
      case lastColumnIndex - 1:
        if (sortedEventDates.length === 1) return itemWidth - 2;
        return itemWidth - 1;
      default:
        return itemWidth;
    }
  }

  function calculateOffset(columnIndex: number, itemWidth: number) {
    let offset = 0;
    for (let i = 1; i < columnIndex; i++) {
      offset += getWidth(i, itemWidth);
    }
    return offset;
  }

  return (
    <div
      className="card border-1 flex h-[44rem] max-w-[56rem] select-none flex-col pl-2 pr-10"
      // mouseUp is cancelled when onContextMenu is triggered so we need to save the selection here as well
      onContextMenu={saveDragSelection}
      onMouseLeave={saveDragSelection}
      // putting saveDragSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={saveDragSelection}
    >
      <div
        className={cn("mb-2 ml-14 h-[3.8rem]", { "h-[2.7rem]": availabilityType === AvailabilityType.DAYS_OF_WEEK })}
      >
        <AvailabilityGridHeader
          allParticipants={allParticipants}
          availabilityType={availabilityType}
          earliestEventDate={sortedEventDates[0]}
          editButtonAnimationScope={scope}
          handleSaveUserAvailability={handleSaveUserAvailability}
          handleUserChange={resetGridStateForUser}
          hasUserAddedAvailability={selectedTimeSlots.length > 0}
          // including placeholder columns
          lastColumn={sortedEventDates.length + 1}
          latestEventDate={sortedEventDates[sortedEventDates.length - 1]}
          setScrollToState={setScrollToState}
        />
      </div>

      <div className="block h-full w-full">
        <AutoSizer>
          {({ height, width }) => {
            const minItemWidth = 96;
            const itemWidth = Math.max(minItemWidth, (width - 82) / sortedEventDates.length);

            return (
              <MultiGrid
                cellRenderer={cellRenderer}
                classNameBottomRightGrid="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full"
                columnCount={sortedEventDates.length + 3}
                columnWidth={({ index }: Index) => {
                  return getWidth(index, itemWidth);
                }}
                fixedColumnCount={1}
                fixedRowCount={1}
                height={height}
                onSectionRendered={({ columnStartIndex, columnStopIndex }: SectionRenderedParams) => {
                  setVisibleColumnRange(columnStartIndex, columnStopIndex);
                }}
                overscanColumnCount={9}
                rowCount={sortedEventTimes.length + 3}
                rowHeight={({ index }: Index) => {
                  switch (index) {
                    case 0:
                      return 60;
                    case 1:
                    case lastRowIndex:
                      return 1;
                    default:
                      return 21;
                  }
                }}
                scrollToAlignment={scrollToState.alignment}
                // scrollLeft={calculateOffset(scrollToState.columnIndex, itemWidth)}
                scrollToColumn={scrollToState.columnIndex}
                width={width}
                ref={gridRef}
              />
            );
          }}
        </AutoSizer>
      </div>
    </div>
  );
}
