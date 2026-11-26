"use client";

import { toast } from "../ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO } from "date-fns";
import { useAnimate } from "framer-motion";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import useUpdateAvailability, { UpdateAvailabilityRequest } from "@/hooks/requests/useUpdateAvailability";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import useGridScrollSync from "@/hooks/useGridScrollSync";
import useScreenSize, { ScreenSize } from "@/hooks/useScreenSize";
import useScrollingClass from "@/hooks/useScrollingClass";
import useAvailabilityGridStore, {
  AvailabilityGridMode,
  getDisplayTimeZones,
  MAX_DISPLAY_TIME_ZONES
} from "@/store/availabilityGridStore";
import { AvailabilityType, EventResponse, EventResponseSchema } from "@/types/Event";
import { EventDate, EventTime, getTimeSlot, TimeSlot } from "@/types/Timeslot";
import { cn } from "@/utils/cn";
import { isConsecutiveDay } from "@/utils/date";

import AvailabilityGridCell from "./availability-grid-cells/availability-grid-cell";
import { TimeSlotDragSelectionState } from "./availability-grid-cells/availability-grid-time-slot";
import AvailabilityGridHeader from "./availability-grid-header";
import { AvailabilityGridNode } from "./availability-grid-node";
import ViewModeDragHint from "./view-mode-drag-hint";

export default function AvailabilityGrid() {
  const { availabilityType, eventId, eventResponses, sortedEventDates, sortedEventTimes } = useAvailabilityGridStore(
    (state) => state.eventData
  );
  const [mode, setMode] = useAvailabilityGridStore(useShallow((state) => [state.mode, state.setMode]));
  const user = useAvailabilityGridStore((state) => state.user);
  const [isSavingAvailability, setIsSavingAvailability, setSelectedTimeSlots] = useAvailabilityGridStore(
    useShallow((state) => [state.isSavingAvailability, state.setIsSavingAvailability, state.setSelectedTimeSlots])
  );
  const [availabilityGridViewWindowSize, setAvailabilityGridViewWindowSize] = useAvailabilityGridStore(
    useShallow((state) => [state.availabilityGridViewWindowSize, state.setAvailabilityGridViewWindowSize])
  );
  const setHoveredTimeSlot = useAvailabilityGridStore((state) => state.setHoveredTimeSlot);
  const [selectedTimeSlots, addSelectedTimeSlots, removeSelectedTimeSlots] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeSlots, state.addSelectedTimeSlots, state.removeSelectedTimeSlots])
  );

  const { mutateAsync } = useUpdateAvailability();

  const { formState, handleSubmit, setValue } = useForm<EventResponse>({
    defaultValues: {
      alias: "",
      availabilities: []
    },
    resolver: zodResolver(EventResponseSchema)
  });

  useEffect(() => {
    setValue("alias", user);
  }, [setValue, user]);

  useEffect(() => {
    setValue("availabilities", selectedTimeSlots);
  }, [selectedTimeSlots, setValue]);

  async function onSubmit({ alias, availabilities }: EventResponse) {
    const req: UpdateAvailabilityRequest = {
      alias,
      availabilities,
      eventId,
      userId: eventResponses.find((response) => response.alias === alias)?.userId
    };

    setIsSavingAvailability(true);
    // one toast shows progress: "Saving…" while the request runs, then the result
    const savingToast = toast({ description: "Saving your availability…", duration: Infinity });
    try {
      await mutateAsync(req);
      if (useAvailabilityGridStore.getState().eventData.eventId === eventId) {
        setMode(AvailabilityGridMode.VIEW);
        setSelectedTimeSlots([]);
        setHoveredTimeSlot(null);
      }
      savingToast.update({ description: "Availability saved", duration: 3000, variant: "success" });
    } catch {
      savingToast.update({
        description: "Couldn't save. Try again.",
        duration: 3000,
        variant: "failure"
      });
    } finally {
      setIsSavingAvailability(false);
    }
  }

  // TODO: add timezone logic
  const screenSize = useScreenSize();

  useEffect(() => {
    switch (screenSize) {
      case ScreenSize.XXS:
      case ScreenSize.XS:
        return setAvailabilityGridViewWindowSize(3);
      case ScreenSize.SM:
        return setAvailabilityGridViewWindowSize(4);
      case ScreenSize.MD:
        return setAvailabilityGridViewWindowSize(5);
      case ScreenSize.LG:
        return setAvailabilityGridViewWindowSize(5);
      default:
        return setAvailabilityGridViewWindowSize(8);
    }
  }, [screenSize, setAvailabilityGridViewWindowSize]);

  const {
    dragMode,
    isCellBorderOfSelectionArea: isCellBorderOfSelectionArea,
    isCellInSelectionArea: isCellInDragSelectionArea,
    isDragging: isDragSelecting,
    onMouseDragEnd,
    onMouseDragMove,
    onMouseDragStart,
    onTouchDragEnd,
    onTouchDragMove,
    onTouchDragStart
  } = useGridDragSelect<EventTime, EventDate, TimeSlot>(
    sortedEventTimes,
    sortedEventDates,
    getTimeSlot,
    selectedTimeSlots,
    addSelectedTimeSlots,
    removeSelectedTimeSlots
  );

  const timeSlotDragSelectionState: TimeSlotDragSelectionState = {
    dragMode,
    isCellBorderOfDragSelectionArea: isCellBorderOfSelectionArea,
    isCellInDragSelectionArea: isCellInDragSelectionArea,
    isDragSelecting,
    onMouseDragMove,
    onMouseDragStart,
    onTouchDragMove,
    onTouchDragStart,
    selectedTimeSlots
  };

  const [scope, animate] = useAnimate();

  function animateEditAvailabilityButton() {
    if (!scope.current) return;
    animate(scope.current, {
      transition: { duration: 0.5, ease: "easeInOut" },
      x: [0, -5, 5, -5, 5, 0]
    });
  }

  // Every date gets a column; the scroll area shows `availabilityGridViewWindowSize` of them at a time
  // and you scroll (or use the arrows) to move through the rest.
  const dateCount = sortedEventDates.length;
  const visibleColumnCount = Math.max(1, Math.min(dateCount, availabilityGridViewWindowSize));
  // one narrow column of times per time zone (up to three), plus room for the "+" that adds one
  const displayTimeZoneCount = useAvailabilityGridStore((state) => getDisplayTimeZones(state).length);
  const timeZoneColumnWidth = screenSize <= ScreenSize.XS ? 52 : 58;
  const timeZoneAddSlot = displayTimeZoneCount < MAX_DISPLAY_TIME_ZONES ? 24 : 6;
  const rowHeaderWidth = timeZoneAddSlot + Math.max(1, displayTimeZoneCount) * timeZoneColumnWidth;
  // space after the last column so it doesn't sit flush against the card edge
  const trailingSpace = screenSize <= ScreenSize.SM ? 16 : 28;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollerWidth, setScrollerWidth] = useState(0);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new ResizeObserver(() => setScrollerWidth(scroller.clientWidth));
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);
  const leadingSpace = screenSize >= ScreenSize.XL ? 8 : 0;
  // whole pixels only: fractional widths leave a sliver of sideways overflow and make the pinned
  // time column jitter while scrolling
  const columnWidth =
    scrollerWidth > 0
      ? Math.max(48, Math.floor((scrollerWidth - leadingSpace - rowHeaderWidth - trailingSpace) / visibleColumnCount))
      : 0;
  // when every date fits on screen there's nothing to scroll sideways to
  const allDatesFit = dateCount <= availabilityGridViewWindowSize;
  const columnHeaderHeight = availabilityType === AvailabilityType.SPECIFIC_DATES ? "4.3rem" : "3rem";
  useGridScrollSync(scrollerRef, columnWidth);
  const scrollerStyle = {
    // keeps the scrollbar beside the rows rather than beside the pinned day headers
    "--grid-header-height": columnHeaderHeight,
    "--time-zone-add-slot": `${timeZoneAddSlot}px`,
    "--time-zone-column-width": `${timeZoneColumnWidth}px`,
    overflowX: allDatesFit ? "hidden" : undefined,
    scrollbarGutter: "stable"
  } as CSSProperties;
  // the scrollbar only shows (and hover effects pause) while the grid is actually scrolling
  useScrollingClass(scrollerRef, () => setHoveredTimeSlot(null));

  const gridNodes = useMemo(() => {
    const gridNodeCols: AvailabilityGridNode[][] = [];
    // col header + placeholder + time slots + placeholder
    const gridRowNodeCount = sortedEventTimes.length + 2;
    // row header + every event date
    const gridColNodeCount = dateCount + 1;

    for (let colIndex = 0; colIndex < gridColNodeCount; colIndex++) {
      const gridNodeCol: AvailabilityGridNode[] = [];
      for (let rowIndex = 0; rowIndex < gridRowNodeCount; rowIndex++) {
        const node = new AvailabilityGridNode();

        node.offsettedColIndex = colIndex;
        node.isNodeInLastActualCol = colIndex === dateCount;

        node.displayedColIndex = colIndex;
        node.isNodeInLastDisplayedCol = colIndex === gridColNodeCount - 1;

        node.displayedRowIndex = rowIndex;
        node.isNodeInLastDisplayedRow = rowIndex === gridRowNodeCount - 1;

        gridNodeCol.push(node);
      }
      gridNodeCols.push(gridNodeCol);
    }
    return gridNodeCols;
  }, [sortedEventTimes, dateCount]);

  const gridTemplateColumns = `${rowHeaderWidth}px repeat(${dateCount}, ${columnWidth > 0 ? `${columnWidth}px` : `minmax(3rem, 1fr)`})`;
  const topBottomCellHeight = "0.7rem";
  const timeSlotCellHeight = screenSize <= ScreenSize.MD ? "1.5rem" : "1.45rem";

  function getDateGaps(columnNodes: AvailabilityGridNode[]) {
    const colHeaderNode = columnNodes[0];
    const dateIndex = colHeaderNode.getSortedEventDatesIndex();
    if (dateIndex === -1) return { hasDateGapLeft: false, hasDateGapRight: false };

    const eventDate = parseISO(sortedEventDates[dateIndex]);
    return {
      hasDateGapLeft:
        colHeaderNode.displayedColIndex !== 1 &&
        !isConsecutiveDay(parseISO(sortedEventDates[dateIndex - 1]), eventDate),
      hasDateGapRight:
        !colHeaderNode.isNodeInLastDisplayedCol &&
        !isConsecutiveDay(eventDate, parseISO(sortedEventDates[dateIndex + 1]))
    };
  }

  return (
    <form
      aria-busy={isSavingAvailability}
      // the border stays the same size in every mode so entering edit mode never shifts the layout
      // desktop: fills its fixed container. mobile: at least the screen's height and shows every time
      // (the page scrolls instead of the calendar, so swiping on the cells is free for selecting)
      className="card relative flex min-h-[calc(100dvh-8rem)] w-full select-none flex-col overflow-hidden bg-white p-0 lg:h-full lg:min-h-0"
      id="availability-grid"
      // mouseUp is cancelled when onContextMenu is triggered so we need to save the selection here as well
      onContextMenu={onMouseDragEnd}
      onMouseLeave={onMouseDragEnd}
      // putting saveDragSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={onMouseDragEnd}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (formState.isSubmitting || isSavingAvailability) return;
        handleSubmit(onSubmit)();
      }}
      onTouchEnd={onTouchDragEnd}
    >
      {/* softly pulsing yellow ring while editing */}
      <div
        aria-hidden="true"
        className={cn(
          "editing-border pointer-events-none absolute -inset-px z-40 rounded-[inherit] opacity-0 transition-opacity duration-500 ease-out motion-reduce:transition-none",
          mode === AvailabilityGridMode.EDIT && "opacity-100"
        )}
      />
      <div className="shrink-0 px-4 pb-2 pt-3 sm:px-6 lg:pt-4">
        <AvailabilityGridHeader />
      </div>

      {/* The card itself never moves: the dates scroll sideways and the times scroll up and down inside it */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* One scroll area for everything so the day headers and the rows always move together.
            The headers are pinned to the top (and bouncing is off) so they never move up or down. */}
        <div
          className="grid-scrollbar flex flex-1 flex-col overflow-x-auto overflow-y-hidden overscroll-x-none lg:min-h-0 lg:overflow-auto lg:overscroll-none"
          ref={scrollerRef}
          style={scrollerStyle}
        >
          <div
            className="flex min-h-full w-max flex-1 flex-col"
            style={{ paddingLeft: leadingSpace, paddingRight: trailingSpace }}
          >
            <div
              className="sticky top-0 z-20 grid shrink-0 bg-white"
              style={{ gridTemplateColumns, height: columnHeaderHeight }}
            >
              {gridNodes.map((columnNodes, colIndex) => (
                <div
                  className={cn(colIndex === 0 && "sticky left-0 z-10 bg-white will-change-transform")}
                  key={`availability-header-${columnNodes[0].offsettedColIndex}`}
                >
                  <AvailabilityGridCell
                    animateEditAvailabilityButton={animateEditAvailabilityButton}
                    {...getDateGaps(columnNodes)}
                    node={columnNodes[0]}
                    screenSize={screenSize}
                    timeSlotDragSelectionState={timeSlotDragSelectionState}
                  />
                </div>
              ))}
            </div>
            <div
              className="grid flex-1 pb-2"
              id="availability-grid-dates"
              onContextMenu={() => setHoveredTimeSlot(null)}
              onMouseLeave={() => setHoveredTimeSlot(null)}
              style={{ gridTemplateColumns }}
            >
              {gridNodes.map((columnNodes, displayColIndex) => {
                const { hasDateGapLeft, hasDateGapRight } = getDateGaps(columnNodes);

                return (
                  <div
                    className={cn("grid", displayColIndex === 0 && "sticky left-0 z-10 bg-white will-change-transform")}
                    key={`availability-column-${displayColIndex}`}
                    style={{
                      gridTemplateRows: `${topBottomCellHeight} repeat(${sortedEventTimes.length - 1}, minmax(${timeSlotCellHeight}, 1fr)) ${topBottomCellHeight}`
                    }}
                  >
                    {columnNodes.slice(1).map((node) => {
                      return (
                        <AvailabilityGridCell
                          animateEditAvailabilityButton={animateEditAvailabilityButton}
                          hasDateGapLeft={hasDateGapLeft}
                          hasDateGapRight={hasDateGapRight}
                          key={`availability-cell-${node.offsettedColIndex}-${node.displayedRowIndex}`}
                          node={node}
                          screenSize={screenSize}
                          timeSlotDragSelectionState={timeSlotDragSelectionState}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ViewModeDragHint />
    </form>
  );
}
