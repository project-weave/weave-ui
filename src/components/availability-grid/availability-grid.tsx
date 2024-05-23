"use client";
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
import { addMinutes, format, parseISO } from "date-fns";
import { useAnimate } from "framer-motion";
import debounce from "lodash.debounce";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { isFirefox } from "react-device-detect";
import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";

import { EventResponse } from "../../types/Event";
import { useToast } from "../ui/use-toast";
import AvailabilityGridColumn from "./availability-grid-column";
import AvailabilityGridHeader from "./availability-grid-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header";

type AvailbilityGridProps = {
  allParticipants: string[];
  availabilityType: AvailabilityType;
  eventDates: EventDate[];
  eventEndTime: EventTime;
  eventId: string;
  eventResponses: EventResponse[];
  eventStartTime: EventTime;
  gridContainerRef: RefObject<ExtendedVariableSizeList>;
  sortedEventDates: EventDate[];
  sortedEventTimes: EventTime[];
  timeSlotsToParticipants: Record<TimeSlot, string[]>;
};

interface ExtendedVariableSizeList extends VariableSizeList {
  _outerRef: HTMLDivElement;
}

export default function AvailabilityGrid({
  allParticipants,
  availabilityType,
  eventDates,
  eventEndTime,
  eventId,
  eventResponses,
  eventStartTime,
  gridContainerRef,
  sortedEventDates,
  sortedEventTimes,
  timeSlotsToParticipants
}: AvailbilityGridProps) {
  const setUser = useAvailabilityGridStore(useShallow((state) => state.setUser));
  const setUserFilter = useAvailabilityGridStore(useShallow((state) => state.setUserFilter));
  const [isBestTimesEnabled, setIsBestTimesEnabled] = useAvailabilityGridStore(
    useShallow((state) => [state.isBestTimesEnabled, state.setIsBestTimesEnabled])
  );
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

  // TODO: add timezone logic

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

  useEffect(() => {
    // adjust grid container dimensions when dates or times are changed s
    gridContainerRef.current?.resetAfterIndex(0);
  }, [eventDates, eventStartTime, eventEndTime, gridContainerRef]);

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

  const containerRef = useRef<AutoSizer>(null);
  const [hasScrollbar, setHasScrollbar] = useState(false);

  // useEffect(() => {
  //   const checkForScrollbar = () => {
  //     if (current) {
  //       const hasScrollbar = gridContainerRef.current?.context > current.clientHeight;
  //       setHasScrollbar(hasScrollbar);
  //     }
  //   };

  //   checkForScrollbar();

  //   // Optionally, add a resize observer to handle dynamic content changes
  //   const resizeObserver = new ResizeObserver(() => checkForScrollbar());
  //   resizeObserver.observe(containerRef.current);

  //   return () => resizeObserver.disconnect();
  // }, []);

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

  const columnHeaderHeight = availabilityType === AvailabilityType.SPECIFIC_DATES ? "3.2rem" : "3rem";

  return (
    <div
      className="card border-1 flex max-w-[56rem] select-none flex-col pl-2 pr-10"
      // mouseUp is cancelled when onContextMenu is triggered so we need to save the selection here as well
      onContextMenu={saveDragSelection}
      onMouseLeave={clearDragSelection}
      // putting saveDragSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={saveDragSelection}
    >
      <div className="mb-2 ml-14 h-[3.8rem]">
        <AvailabilityGridHeader
          allParticipants={allParticipants}
          availabilityType={availabilityType}
          earliestEventDate={sortedEventDates[0]}
          editButtonAnimationScope={scope}
          gridContainerRef={gridContainerRef}
          handleSaveUserAvailability={handleSaveUserAvailability}
          handleUserChange={resetGridStateForUser}
          hasUserAddedAvailability={selectedTimeSlots.length > 0}
          // including placeholder columns
          lastColumn={sortedEventDates.length + 1}
          latestEventDate={sortedEventDates[sortedEventDates.length - 1]}
        />
      </div>
      <div className="flex h-full w-full">
        <div
          className="grid h-full w-20"
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
        <div className="block w-full">
          <AutoSizer>
            {({ height, width }) => {
              const minItemWidth = 96;
              const itemWidth = Math.max(minItemWidth, width / sortedEventDates.length);
              const scrollbarHeight = isFirefox ? 11 : 10;
              const isScrollbarRequired = itemWidth === minItemWidth;
              const containerHeight = isScrollbarRequired ? height + scrollbarHeight : height;
              return (
                <VariableSizeList
                  className="overflow-x-scroll scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full"
                  height={containerHeight}
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
                  style={{
                    scrollbarGutter: "stable"
                  }}
                  width={width}
                >
                  {({ index, style }: ListChildComponentProps) => (
                    <AvailabilityGridColumn
                      allParticipants={allParticipants}
                      autoSizerStyle={style}
                      availabilityType={availabilityType}
                      columnHeaderHeight={columnHeaderHeight}
                      columnIndex={index}
                      eventEndTime={eventEndTime}
                      gridContainerRef={gridContainerRef}
                      handleCellMouseDown={handleCellMouseDown}
                      handleCellMouseEnter={handleCellMouseEnter}
                      handleCellMouseLeave={handleCellMouseLeave}
                      handleSaveUserAvailability={handleSaveUserAvailability}
                      handleUserChange={resetGridStateForUser}
                      isBestTimesEnabled={isBestTimesEnabled}
                      isCellBorderOfSelectionArea={isCellBorderOfSelectionArea}
                      isCellInDragSelectionArea={isCellInDragSelectionArea}
                      isDragAdding={isDragAdding}
                      isDragSelecting={isDragSelecting}
                      mode={mode}
                      selectedTimeSlots={selectedTimeSlots}
                      sortedEventDates={sortedEventDates}
                      sortedEventTimes={sortedEventTimes}
                      timeSlotsToParticipants={timeSlotsToParticipants}
                      user={user}
                      userFilter={userFilter}
                    />
                  )}
                </VariableSizeList>
              );
            }}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}
