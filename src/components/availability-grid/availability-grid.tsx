"use client";
import useUpdateAvailability, { UpdateAvailabilityRequest } from "@/hooks/requests/useUpdateAvailability";
import useGridDragSelect from "@/hooks/useGridDragSelect";
import useAvailabilityGridStore, { AvailabilityGridMode, AvailabilityType } from "@/store/availabilityGridStore";
import { EventDate, EventTime, getTimeSlot, TimeSlot } from "@/types/Event";
import { cn } from "@/utils/cn";
import { useAnimate } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { Skeleton } from "../ui/skeleton";
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
  const availabilityGridViewWindowSize = useAvailabilityGridStore(
    useShallow((state) => state.availabilityGridViewWindowSize)
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
    animate(scope.current, {
      transition: { duration: 0.5, ease: "easeInOut" },
      x: [0, -5, 5, -5, 5, 0]
    });
  }

  const timeSlotColumnsCount = Math.min(sortedEventDates.length, availabilityGridViewWindowSize);

  const gridNodes = useMemo(() => {
    // col header + placeholder + event times + placeholder

    const gridNodeCols: AvailabilityGridNode[][] = [];
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
  }, [sortedEventTimes, sortedEventDates, availabilityGridViewWindowSize, leftMostColumnInView]);

  return sortedEventDates.length === 0 || sortedEventTimes.length === 0 ? (
    <Skeleton className="h-full max-w-[56rem] " />
  ) : (
    <div
      className="card border-1 flex max-w-[56rem] select-none flex-col pl-2 pr-10 pt-1"
      // mouseUp is cancelled when onContextMenu is triggered so we need to save the selection here as well
      onContextMenu={saveDragSelection}
      onMouseLeave={saveDragSelection}
      // putting saveDragSelection here to handle the case where the user lets go of the mouse outside of the grid cells
      onMouseUp={saveDragSelection}
    >
      <div
        className={cn("sticky top-[5rem] z-[999] h-[5.4rem] bg-background pl-14 pt-4", {
          "h-[4,7rem]": availabilityType === AvailabilityType.DAYS_OF_WEEK
        })}
      >
        <AvailabilityGridHeader
          editAvailabilityButtonAnimationScope={scope}
          handleSaveUserAvailability={handleSaveUserAvailability}
          handleUserChange={resetGridStateForUser}
        />
      </div>
      <div className="flex h-full w-full">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `4.5rem repeat(${timeSlotColumnsCount}, minmax(2rem, 1fr))`
          }}
        >
          {gridNodes.map((columnNodes, displayColIndex) => {
            return (
              <div
                className="grid w-full"
                key={`availability-column-${displayColIndex}`}
                style={{
                  gridTemplateRows: `${availabilityType === AvailabilityType.SPECIFIC_DATES ? "3.2rem" : "2.7rem"} 0.7rem repeat(${sortedEventTimes.length - 1}, minmax(0.8rem, 1fr)) 0.7rem`
                }}
              >
                {columnNodes.map((node) => (
                  <AvailabilityGridCell
                    animateEditAvailabilityButton={animateEditAvailabilityButton}
                    key={`availability-cell-${node.offsettedColIndex}-${node.displayedRowIndex}`}
                    node={node}
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
