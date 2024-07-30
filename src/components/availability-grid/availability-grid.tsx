"use client";
import useUpdateAvailability, { UpdateAvailabilityRequest } from "@/hooks/requests/useUpdateAvailability";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import useScreenSize, { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { AvailabilityGridMode, AvailabilityType } from "@/store/availabilityGridStore";
import { EventDate, EventTime, getTimeSlot, TimeSlot } from "@/types/Event";
import { cn } from "@/utils/cn";
import { useAnimate } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useToast } from "../ui/use-toast";
import AvailabilityGridCell from "./availability-grid-cells/availability-grid-cell";
import AvailabilityGridHeader from "./availability-grid-cells/availability-grid-header";
import { TimeSlotDragSelectionState } from "./availability-grid-cells/availability-grid-time-slot";
import { AvailabilityGridNode } from "./availability-grid-node";
export default function AvailabilityGrid() {
  const { availabilityType, eventId, eventResponses, sortedEventDates, sortedEventTimes } = useAvailabilityGridStore(
    (state) => state.eventData
  );
  const setUser = useAvailabilityGridStore(useShallow((state) => state.setUser));
  const setUserFilter = useAvailabilityGridStore(useShallow((state) => state.setUserFilter));
  const setIsBestTimesEnabled = useAvailabilityGridStore(useShallow((state) => state.setIsBestTimesEnabled));
  const setHoveredTimeSlot = useAvailabilityGridStore((state) => state.setHoveredTimeSlot);
  const setFocusedDate = useAvailabilityGridStore(useShallow((state) => state.setFocusedDate));
  const setMode = useAvailabilityGridStore(useShallow((state) => state.setMode));
  const [availabilityGridViewWindowSize, setAvailabilityGridViewWindowSize] = useAvailabilityGridStore(
    useShallow((state) => [state.availabilityGridViewWindowSize, state.setAvailabilityGridViewWindowSize])
  );
  const [leftMostColumnInView, setLeftMostColumnInView] = useAvailabilityGridStore(
    useShallow((state) => [state.leftMostColumnInView, state.setLeftMostColumnInView])
  );

  const [selectedTimeSlots, setSelectedTimeSlots, addSelectedTimeSlots, removeSelectedTimeSlots] =
    useAvailabilityGridStore(
      useShallow((state) => [
        state.selectedTimeSlots,
        state.setSelectedTimeSlots,
        state.addSelectedTimeSlots,
        state.removeSelectedTimeSlots
      ])
    );

  const { mutate } = useUpdateAvailability();
  const { toast } = useToast();

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

  useEffect(() => {
    return resetGridStateForUser("");
  }, []);

  function resetGridStateForUser(user: string) {
    setUser(user);
    setIsBestTimesEnabled(false);
    setUserFilter([]);
    setHoveredTimeSlot(null);
    setFocusedDate(null);
    setLeftMostColumnInView(0);

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
          "sticky top-[4.6rem] z-[999] h-[6rem] w-[101%] bg-background pl-4 pt-4 xs:pl-10 lg:h-[4.5rem] xl:h-[5rem] xl:pl-14",
          availabilityType === AvailabilityType.DAYS_OF_WEEK && "h-[5.4rem] lg:h-[4.5rem] xl:h-[5rem]"
        )}
      >
        <AvailabilityGridHeader
          editAvailabilityButtonAnimationScope={scope}
          handleSaveUserAvailability={handleSaveUserAvailability}
          handleUserChange={resetGridStateForUser}
          screenSize={screenSize}
        />
      </div>
      <div className="flex h-full w-full">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `${screenSize <= ScreenSize.XS ? "4.3rem" : "4.5rem"} repeat(${timeSlotColumnsCount}, minmax(1.4rem, 1fr))`
          }}
        >
          {gridNodes.map((columnNodes, displayColIndex) => {
            let columnHeaderHeight = "";
            switch (availabilityType) {
              case AvailabilityType.SPECIFIC_DATES:
                columnHeaderHeight = screenSize <= ScreenSize.LG ? "3.2rem" : "3.5rem";
                break;
              case AvailabilityType.DAYS_OF_WEEK:
                columnHeaderHeight = "2.6rem";
                break;
            }
            return (
              <div
                className="grid w-full"
                key={`availability-column-${displayColIndex}`}
                style={{
                  gridTemplateRows: `${columnHeaderHeight} 0.7rem repeat(${sortedEventTimes.length - 1}, minmax(1.4rem, 1fr)) 0.7rem`
                }}
              >
                {columnNodes.map((node) => (
                  <AvailabilityGridCell
                    animateEditAvailabilityButton={animateEditAvailabilityButton}
                    key={`availability-cell-${node.offsettedColIndex}-${node.displayedRowIndex}`}
                    node={node}
                    screenSize={screenSize}
                    timeSlotDragSelectionState={timeSlotDragSelectionState}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
