"use client";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import useScreenSize, { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { AvailabilityType } from "@/store/availabilityGridStore";
import { EventDate, EventTime, getTimeSlot, TimeSlot } from "@/types/Event";
import { cn } from "@/utils/cn";
import { isConsecutiveDay } from "@/utils/date";
import { parseISO } from "date-fns";
import { useAnimate } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGridCell from "./availability-grid-cells/availability-grid-cell";
import AvailabilityGridHeader from "./availability-grid-cells/availability-grid-header";
import { TimeSlotDragSelectionState } from "./availability-grid-cells/availability-grid-time-slot";
import { AvailabilityGridNode } from "./availability-grid-node";

type AvailabilityGridProps = {
  handleSaveUserAvailability: (user: string) => void;
};

export default function AvailabilityGrid({ handleSaveUserAvailability }: AvailabilityGridProps) {
  const { availabilityType, sortedEventDates, sortedEventTimes } = useAvailabilityGridStore((state) => state.eventData);

  const [availabilityGridViewWindowSize, setAvailabilityGridViewWindowSize] = useAvailabilityGridStore(
    useShallow((state) => [state.availabilityGridViewWindowSize, state.setAvailabilityGridViewWindowSize])
  );
  const leftMostColumnInView = useAvailabilityGridStore(useShallow((state) => state.leftMostColumnInView));
  const [selectedTimeSlots, addSelectedTimeSlots, removeSelectedTimeSlots] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeSlots, state.addSelectedTimeSlots, state.removeSelectedTimeSlots])
  );

  // TODO: add timezone logic

  const screenSize = useScreenSize();

  useEffect(() => {
    switch (screenSize) {
      case ScreenSize.XXS:
        return setAvailabilityGridViewWindowSize(4);
      case ScreenSize.XS:
        return setAvailabilityGridViewWindowSize(5);
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
    isAdding: isDragAdding,
    isCellBorderOfSelectionArea: isCellBorderOfSelectionArea,
    isCellInSelectionArea: isCellInDragSelectionArea,
    isSelecting: isDragSelecting,
    onDragMove,
    onDragStart,
    saveCurrentSelection: saveDragSelection
  } = useGridDragSelect<EventTime, EventDate, TimeSlot>(
    sortedEventTimes,
    sortedEventDates,
    getTimeSlot,
    selectedTimeSlots,
    addSelectedTimeSlots,
    removeSelectedTimeSlots
  );

  const timeSlotDragSelectionState: TimeSlotDragSelectionState = {
    isCellBorderOfDragSelectionArea: isCellBorderOfSelectionArea,
    isCellInDragSelectionArea: isCellInDragSelectionArea,
    isDragAdding,
    isDragSelecting,
    onDragMove,
    onDragStart,
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
  }, [sortedEventTimes, sortedEventDates, availabilityGridViewWindowSize, leftMostColumnInView, timeSlotColumnsCount]);

  return sortedEventDates.length === 0 || sortedEventTimes.length === 0 ? (
    <div />
  ) : (
    <div
      className="card flex w-full select-none flex-col pl-0 pr-5 pt-1 sm:pr-8 xl:pl-2 xl:pr-10"
      // mouseUp is cancelled when onContextMenu is triggered so we need to save the selection here as well
      onContextMenu={saveDragSelection}
      onMouseLeave={saveDragSelection}
      // putting saveDragSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={saveDragSelection}
    >
      <div
        className={cn(
          "sticky top-[4.6rem] z-[999] h-full bg-background pl-4 pt-4 xs:pl-10 xl:pl-14",
          availabilityType === AvailabilityType.DAYS_OF_WEEK && "h-[5.4rem] lg:h-[4.5rem] xl:h-[5rem]"
        )}
      >
        <AvailabilityGridHeader
          editAvailabilityButtonAnimationScope={scope}
          handleSaveUserAvailability={handleSaveUserAvailability}
          screenSize={screenSize}
        />
      </div>
      <div className="flex h-full w-full">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `${screenSize <= ScreenSize.XS ? "4.3rem" : "4.7rem"} repeat(${timeSlotColumnsCount}, minmax(1.4rem, 1fr))`
          }}
        >
          {gridNodes.map((columnNodes, displayColIndex) => {
            let columnHeaderHeight = "";
            switch (availabilityType) {
              case AvailabilityType.SPECIFIC_DATES:
                columnHeaderHeight = "5rem";
                if (screenSize <= ScreenSize.LG) columnHeaderHeight = "4.3rem";
                break;
              case AvailabilityType.DAYS_OF_WEEK:
                columnHeaderHeight = "3.4rem";
                break;
            }

            let hasDateGapLeft = false;
            let hasDateGapRight = false;
            const colHeaderNode = columnNodes[0];
            const timeSlotsColumnIndex = colHeaderNode.getSortedEventDatesIndex();
            if (timeSlotsColumnIndex !== -1) {
              const eventDate = sortedEventDates[timeSlotsColumnIndex];
              const prevEventDate = sortedEventDates[colHeaderNode.getSortedEventDatesIndex() - 1];
              const nextEventDate = sortedEventDates[colHeaderNode.getSortedEventDatesIndex() + 1];
              hasDateGapLeft =
                timeSlotsColumnIndex !== 0 && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
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
                  gridTemplateRows: `${columnHeaderHeight} 0.7rem repeat(${sortedEventTimes.length - 1}, minmax(1.3rem, 1fr)) 0.7rem`
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
    </div>
  );
}
