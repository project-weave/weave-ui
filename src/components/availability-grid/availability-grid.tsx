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
import AvailabilityGridHeader from "./availability-grid-cells/availability-grid-header";
import { TimeSlotDragSelectionState } from "./availability-grid-cells/availability-grid-time-slot";
import { AvailabilityGridNode } from "./availability-grid-node";

export default function AvailabilityGrid() {
  const { availabilityType, eventId, sortedEventDates, sortedEventTimes } = useAvailabilityGridStore(
    (state) => state.eventData
  );
  const setMode = useAvailabilityGridStore(useShallow((state) => state.setMode));
  const user = useAvailabilityGridStore((state) => state.user);
  const resetGridState = useAvailabilityGridStore(useShallow((state) => state.resetGridState));
  const [availabilityGridViewWindowSize, setAvailabilityGridViewWindowSize] = useAvailabilityGridStore(
    useShallow((state) => [state.availabilityGridViewWindowSize, state.setAvailabilityGridViewWindowSize])
  );
  const leftMostColumnInView = useAvailabilityGridStore(useShallow((state) => state.leftMostColumnInView));
  const [selectedTimeSlots, addSelectedTimeSlots, removeSelectedTimeSlots] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeSlots, state.addSelectedTimeSlots, state.removeSelectedTimeSlots])
  );

  const { mutate } = useUpdateAvailability();

  const { formState, handleSubmit, setValue } = useForm<EventResponse>({
    defaultValues: {
      alias: "",
      availabilities: []
    },
    resolver: zodResolver(EventResponseSchema)
  });

  useEffect(() => {
    setValue("alias", user);
  }, [user]);

  useEffect(() => {
    setValue("availabilities", selectedTimeSlots);
  }, [selectedTimeSlots]);

  function onSubmit({ alias, availabilities }: EventResponse) {
    const req: UpdateAvailabilityRequest = {
      alias,
      availabilities,
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
    resetGridState();
  }

  // TODO: add timezone logic
  const screenSize = useScreenSize();

  useEffect(() => {
    switch (screenSize) {
      case ScreenSize.XXS:
      case ScreenSize.XS:
        return setAvailabilityGridViewWindowSize(4);
      case ScreenSize.SM:
        return setAvailabilityGridViewWindowSize(6);
      case ScreenSize.MD:
        return setAvailabilityGridViewWindowSize(7);
      case ScreenSize.LG:
        return setAvailabilityGridViewWindowSize(6);
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

  return (
    <form
      className="card flex w-full select-none flex-col pl-0 pr-5 pt-1 sm:pr-8 xl:pl-2 xl:pr-10"
      id="availability-grid"
      // mouseUp is cancelled when onContextMenu is triggered so we need to save the selection here as well
      onContextMenu={onMouseDragEnd}
      onMouseLeave={onMouseDragEnd}
      // putting saveDragSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={onMouseDragEnd}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (formState.isSubmitting) return;
        handleSubmit(onSubmit)();
      }}
      onTouchEnd={onTouchDragEnd}
      style={{
        height: screenSize <= ScreenSize.MD ? gridHeightStyle : "100%"
      }}
    >
      <div className={cn("sticky top-[3.3rem] z-[999] w-[101%] bg-background pb-1.5 pl-4 pt-4 xs:pl-10 xl:pl-14")}>
        <AvailabilityGridHeader editAvailabilityButtonAnimationScope={scope} screenSize={screenSize} />
      </div>
      <div className="flex h-full w-full">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `${screenSize <= ScreenSize.XS ? "4.3rem" : "4.7rem"} repeat(${timeSlotColumnsCount}, minmax(1.3rem, 1fr))`
          }}
        >
          {gridNodes.map((columnNodes, displayColIndex) => {
            const columnHeaderHeight = availabilityType === AvailabilityType.SPECIFIC_DATES ? "3.9rem" : "3.3rem";
            const topBottomCellHeight = "0.7rem";
            const timeSlotCellHeight = screenSize <= ScreenSize.MD ? "1.5rem" : "1.45rem";

            let hasDateGapLeft = false;
            let hasDateGapRight = false;
            const colHeaderNode = columnNodes[0];
            const timeSlotsColumnIndex = colHeaderNode.getSortedEventDatesIndex();
            if (timeSlotsColumnIndex !== -1) {
              const eventDate = sortedEventDates[timeSlotsColumnIndex];
              const prevEventDate = sortedEventDates[colHeaderNode.getSortedEventDatesIndex() - 1];
              const nextEventDate = sortedEventDates[colHeaderNode.getSortedEventDatesIndex() + 1];
              hasDateGapLeft = displayColIndex !== 1 && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
              hasDateGapRight =
                displayColIndex !== gridNodes.length - 1 &&
                !isConsecutiveDay(parseISO(eventDate), parseISO(nextEventDate));
            }

            return (
              <div
                className={cn("grid", {
                  "pr-1": hasDateGapRight
                })}
                key={`availability-column-${displayColIndex}`}
                style={{
                  gridTemplateRows: `${columnHeaderHeight} ${topBottomCellHeight} repeat(${sortedEventTimes.length - 1}, minmax(${timeSlotCellHeight}, 1fr)) ${topBottomCellHeight}`
                }}
              >
                {columnNodes.map((node) => {
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
