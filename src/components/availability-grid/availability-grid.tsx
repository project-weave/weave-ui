"use client";

import { toast } from "../ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO } from "date-fns";
import { useAnimate } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import useUpdateAvailability, { UpdateAvailabilityRequest } from "@/hooks/requests/useUpdateAvailability";
import useAvailabilityGridHeight from "@/hooks/useAvailabilityGridHeight";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import useScreenSize, { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { AvailabilityGridMode } from "@/store/availabilityGridStore";
import { AvailabilityType, EventResponse, EventResponseSchema } from "@/types/Event";
import { EventDate, EventTime, getTimeSlot, TimeSlot } from "@/types/Timeslot";
import { cn } from "@/utils/cn";
import { isConsecutiveDay } from "@/utils/date";

import AvailabilityGridCell from "./availability-grid-cells/availability-grid-cell";
import { TimeSlotDragSelectionState } from "./availability-grid-cells/availability-grid-time-slot";
import AvailabilityGridHeader from "./availability-grid-header";
import { AvailabilityGridNode } from "./availability-grid-node";

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
  const leftMostColumnInView = useAvailabilityGridStore(useShallow((state) => state.leftMostColumnInView));
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
    try {
      await mutateAsync(req);
      if (useAvailabilityGridStore.getState().eventData.eventId === eventId) {
        setMode(AvailabilityGridMode.VIEW);
        setSelectedTimeSlots([]);
        setHoveredTimeSlot(null);
      }
      toast({ description: "Availability saved", variant: "success" });
    } catch {
      toast({
        description: "An error occurred while saving your availability. Please try again later.",
        title: "Oh no! Something went wrong",
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

  const timeSlotColumnsCount = Math.min(sortedEventDates.length, availabilityGridViewWindowSize);

  const gridNodes = useMemo(() => {
    const gridNodeCols: AvailabilityGridNode[][] = [];
    // col header + placeholder + time slots + placeholder
    const gridRowNodeCount = sortedEventTimes.length + 2;
    // row header + event dates5
    const gridColNodeCount = timeSlotColumnsCount + 1;

    for (let colIndex = 0; colIndex < gridColNodeCount; colIndex++) {
      const gridNodeCol: AvailabilityGridNode[] = [];
      for (let rowIndex = 0; rowIndex < gridRowNodeCount; rowIndex++) {
        const node = new AvailabilityGridNode();

        node.offsettedColIndex = leftMostColumnInView + colIndex;
        node.isNodeInLastActualCol = leftMostColumnInView + colIndex === sortedEventDates.length;

        node.displayedColIndex = colIndex;
        node.isNodeInLastDisplayedCol = colIndex === gridColNodeCount - 1;

        node.displayedRowIndex = rowIndex;
        node.isNodeInLastDisplayedRow = rowIndex === gridRowNodeCount - 1;

        gridNodeCol.push(node);
      }
      gridNodeCols.push(gridNodeCol);
    }
    return gridNodeCols;
  }, [sortedEventTimes, sortedEventDates, leftMostColumnInView, timeSlotColumnsCount]);

  const gridHeightStyle = useAvailabilityGridHeight();
  const gridTemplateColumns = `${screenSize <= ScreenSize.XS ? "4.9rem" : "5.1rem"} repeat(${timeSlotColumnsCount}, minmax(1.3rem, 1fr))`;
  const columnHeaderHeight = availabilityType === AvailabilityType.SPECIFIC_DATES ? "4.3rem" : "3rem";

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
      className={cn("card flex w-full select-none flex-col bg-white pl-0 pr-5 pt-1 sm:pr-8 xl:pl-2 xl:pr-10", {
        "border-[3px] border-yellow": mode === AvailabilityGridMode.EDIT
      })}
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
      style={{
        height: screenSize <= ScreenSize.MD ? gridHeightStyle : "100%"
      }}
    >
      <div className="sticky top-[4.5rem] z-30 shrink-0 bg-white pt-4">
        <div className="pb-3 pl-5">
          <AvailabilityGridHeader />
        </div>
        <div className="grid" style={{ gridTemplateColumns, height: columnHeaderHeight }}>
          {gridNodes.map((columnNodes) => (
            <AvailabilityGridCell
              animateEditAvailabilityButton={animateEditAvailabilityButton}
              {...getDateGaps(columnNodes)}
              key={`availability-header-${columnNodes[0].offsettedColIndex}`}
              node={columnNodes[0]}
              screenSize={screenSize}
              timeSlotDragSelectionState={timeSlotDragSelectionState}
            />
          ))}
        </div>
      </div>
      <div className="flex h-full w-full">
        <div
          className="grid h-full w-full"
          id="availability-grid-dates"
          onContextMenu={() => setHoveredTimeSlot(null)}
          onMouseLeave={() => setHoveredTimeSlot(null)}
          style={{ gridTemplateColumns }}
        >
          {gridNodes.map((columnNodes, displayColIndex) => {
            const topBottomCellHeight = "0.7rem";
            const timeSlotCellHeight = screenSize <= ScreenSize.MD ? "1.5rem" : "1.45rem";
            const { hasDateGapLeft, hasDateGapRight } = getDateGaps(columnNodes);

            return (
              <div
                className="grid"
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
    </form>
  );
}
