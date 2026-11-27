import { format, parseISO } from "date-fns";
import { MouseEvent, TouchEvent as ReactTouchEvent, useEffect, useRef, useState } from "react";

import { DragMode } from "@/hooks/useDragSelect";
import {
  CellBorderCheck,
  extractGridDragSelectData,
  GridDragMoveHandler,
  GridDragStartHandler
} from "@/hooks/useGridDragSelect";
import useRegisterNonPassiveTouchEvents from "@/hooks/useRegisterNonPassiveTouchEvents";
import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { EventDate, EventTime, getTimeFromTimeSlot, getTimeSlot, TimeSlot } from "@/types/Timeslot";
import { cn } from "@/utils/cn";
import { isLeftClick } from "@/utils/mouseEvent";

export type TimeSlotDragSelectionState = {
  dragMode: DragMode;
  isCellBorderOfDragSelectionArea: (row: number, col: number) => CellBorderCheck;
  isCellInDragSelectionArea: (row: number, col: number) => boolean;
  isDragSelecting: boolean;
  onMouseDragMove: GridDragMoveHandler;
  onMouseDragStart: GridDragStartHandler;
  onTouchDragCancel: () => void;
  onTouchDragMove: GridDragMoveHandler;
  onTouchDragStart: GridDragStartHandler;
  selectedTimeSlots: TimeSlot[];
};

type AvailabilityGridTimeSlotProps = {
  animateEditAvailabilityButton: () => void;
  borderXSizeStyles: string;
  eventDate: EventDate;
  eventTime: EventTime;
  hasDateGapLeft: boolean;
  hasDateGapRight: boolean;
  timeSlotDragSelectionState: TimeSlotDragSelectionState;
  timeSlotsCol: number;
  timeSlotsRow: number;
};

export default function AvailabilityGridTimeSlot({
  animateEditAvailabilityButton,
  borderXSizeStyles,
  eventDate,
  eventTime,
  hasDateGapLeft,
  hasDateGapRight,
  timeSlotDragSelectionState: {
    dragMode,
    isCellBorderOfDragSelectionArea,
    isCellInDragSelectionArea,
    isDragSelecting,
    onMouseDragMove,
    onMouseDragStart,
    onTouchDragCancel,
    onTouchDragMove,
    onTouchDragStart,
    selectedTimeSlots
  },
  timeSlotsCol,
  timeSlotsRow
}: AvailabilityGridTimeSlotProps) {
  const [isBeingAdded, setIsBeingAdded] = useState(false);
  const [isBeingRemoved, setIsBeingRemoved] = useState(false);
  const [isBottomBorder, setIsBottomBorder] = useState(false);
  const [isLeftBorder, setIsLeftBorder] = useState(false);
  const [isRightBorder, setIsRightBorder] = useState(false);
  const [isTopBorder, setIsTopBorder] = useState(false);

  const { allParticipants, sortedEventDates, sortedEventTimes, timeSlotsToParticipants } = useAvailabilityGridStore(
    (state) => state.eventData
  );

  const timeSlot = getTimeSlot(eventTime, eventDate);

  const mode = useAvailabilityGridStore((state) => state.mode);
  const isSaving = useAvailabilityGridStore((state) => state.isSavingAvailability);
  const isBestTimesEnabled = useAvailabilityGridStore((state) => state.isBestTimesEnabled);
  const isTimeHovered = useAvailabilityGridStore((state) => eventTime === getTimeFromTimeSlot(state.hoveredTimeSlot));
  const isTimeSlotHovered = useAvailabilityGridStore((state) => state.hoveredTimeSlot === timeSlot);

  const setHoveredTimeSlot = useAvailabilityGridStore((state) => state.setHoveredTimeSlot);
  const userFilter = useAvailabilityGridStore((state) => state.userFilter);

  const timeSlotCellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    /*    
      hacky/optimized way of rerendering cells within the drag selection area rather than rerendering all cells, 
      subscribe function by itself doesn't cause rerender, rather setHoveredTimeSlot causes changes to availabilityGridStore
      when dragging occurs hoverTimeSlot will change and causing this subscribe code to run 
      setState is called and react will only rerender if there is any state changes 
      additioanlly, when time slots are saved (dragging is complete) the parent will rerendered causing this component to rerender
      this way, only necessary cells will rerender and only during dragging (not during view mode and not during normal cell hover)
    */
    const unsub = useAvailabilityGridStore.subscribe(() => {
      const isBeingAdded = dragMode === DragMode.ADD && isCellInDragSelectionArea(timeSlotsRow, timeSlotsCol);
      const isBeingRemoved = dragMode === DragMode.REMOVE && isCellInDragSelectionArea(timeSlotsRow, timeSlotsCol);
      const { isBottomBorder, isLeftBorder, isRightBorder, isTopBorder } = isCellBorderOfDragSelectionArea(
        timeSlotsRow,
        timeSlotsCol
      );

      setIsBeingAdded(isBeingAdded);
      setIsBeingRemoved(isBeingRemoved);
      setIsBottomBorder(isBottomBorder);
      setIsLeftBorder(isLeftBorder);
      setIsRightBorder(isRightBorder);
      setIsTopBorder(isTopBorder);
    });

    return unsub;
  }, [
    dragMode,
    isCellBorderOfDragSelectionArea,
    isCellInDragSelectionArea,
    isDragSelecting,
    timeSlotsCol,
    timeSlotsRow
  ]);

  function handleMouseDown(e: MouseEvent<HTMLButtonElement>) {
    if (isSaving) return;
    // touchStart and touchEnd occurs before mouseEnd
    // need to prevent this on touch screens as mouseStart is trigged on touch as well
    if (!isLeftClick(e)) return;
    if (isViewMode(mode)) animateEditAvailabilityButton();
    if (isEditMode(mode)) {
      onMouseDragStart(timeSlotsRow, timeSlotsCol);
      setHoveredTimeSlot(getTimeSlot(sortedEventTimes[timeSlotsRow], sortedEventDates[timeSlotsCol]));
    }
  }

  function handleMouseEnter(e: MouseEvent<HTMLButtonElement>) {
    if (isSaving) return;
    if (!isLeftClick(e)) return;
    if (isEditMode(mode)) onMouseDragMove(timeSlotsRow, timeSlotsCol);
    setHoveredTimeSlot(getTimeSlot(sortedEventTimes[timeSlotsRow], sortedEventDates[timeSlotsCol]));
  }

  function extractRowCol(e: TouchEvent) {
    const data = extractGridDragSelectData(e);
    if (!data) return [-1, -1];

    const [rowStr, colStr] = data.split("_");
    const row = isNaN(Number(rowStr)) ? -1 : Number(rowStr);
    const col = isNaN(Number(colStr)) ? -1 : Number(colStr);
    return [row, col];
  }

  // While editing, a touch on the grid is either a drag that selects times or a sideways swipe through the
  // dates. The cells allow sideways panning (touch-pan-x), so the browser scrolls the dates on its own; the
  // first few pixels of movement decide which it is, and a swipe drops the selection it started.
  const touchGestureRef = useRef<{ kind: "pending" | "scroll" | "select"; x: number; y: number } | null>(null);

  function handleTouchStart(e: TouchEvent) {
    if (isSaving) return;
    const [row, col] = extractRowCol(e);

    if (isEditMode(mode)) {
      const touch = e.touches[0];
      touchGestureRef.current = { kind: "pending", x: touch.clientX, y: touch.clientY };
      onTouchDragStart(row, col);
    }
    if (row !== -1 && col !== -1) setHoveredTimeSlot(getTimeSlot(sortedEventTimes[row], sortedEventDates[col]));
  }

  function handleTouchMove(e: TouchEvent) {
    if (isSaving) return;
    if (!isEditMode(mode)) return;

    const gesture = touchGestureRef.current;
    if (gesture?.kind === "scroll") return;
    if (gesture?.kind === "pending") {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - gesture.x);
      const dy = Math.abs(touch.clientY - gesture.y);
      if (dx > dy) {
        // sideways: let the browser scroll the dates and drop the selection this touch started
        gesture.kind = "scroll";
        onTouchDragCancel();
        setHoveredTimeSlot(null);
        return;
      }
      // up or down: keep the touch for selecting (the browser must not start its own gesture first)
      gesture.kind = "select";
    }
    if (e.cancelable) e.preventDefault();

    const [row, col] = extractRowCol(e);
    onTouchDragMove(row, col);
    if (row !== -1 && col !== -1) setHoveredTimeSlot(getTimeSlot(sortedEventTimes[row], sortedEventDates[col]));
  }

  function handleTouchEnd(e: ReactTouchEvent<HTMLButtonElement>) {
    if (!isEditMode(mode)) return;
    // a tap or drag: stop the browser from also sending mouse events, which would toggle the cell again
    if (touchGestureRef.current?.kind !== "scroll" && e.cancelable) e.preventDefault();
    touchGestureRef.current = null;
    setHoveredTimeSlot(null);
  }

  useRegisterNonPassiveTouchEvents({
    onTouchMove: handleTouchMove,
    onTouchStart: handleTouchStart,
    ref: timeSlotCellRef
  });

  const isSelected = selectedTimeSlots.includes(timeSlot);

  function activateWithKeyboard(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail !== 0 || isSaving) return;
    if (isEditMode(mode)) {
      const state = useAvailabilityGridStore.getState();
      if (isSelected) state.removeSelectedTimeSlots([timeSlot]);
      else state.addSelectedTimeSlots([timeSlot]);
    } else {
      animateEditAvailabilityButton();
    }
  }

  const filteredParticipants = userFilter.length === 0 ? allParticipants : userFilter;
  const filteredParticipantsTotal = filteredParticipants.length;
  const allParticipantsForTimeSlot = timeSlotsToParticipants[timeSlot] ?? [];

  const particiantsSelectedCount = filteredParticipants.filter((participant) =>
    allParticipantsForTimeSlot.includes(participant)
  ).length;

  const highestParticiantsSelectedCount = Object.values(timeSlotsToParticipants).reduce((maxCount, paricipants) => {
    const filteredCount = filteredParticipants.filter((participant) => paricipants.includes(participant)).length;
    return Math.max(maxCount, filteredCount);
  }, 0);

  function getViewModeCellColour() {
    if (filteredParticipantsTotal === 0 || particiantsSelectedCount === 0) return "transparent";
    // primary-dark
    const darkestColour = { b: 255, g: 71, r: 151 };
    let ratio = particiantsSelectedCount / filteredParticipantsTotal;

    if (isBestTimesEnabled) {
      if (highestParticiantsSelectedCount === 0) return "transparent";
      if (highestParticiantsSelectedCount === particiantsSelectedCount) {
        ratio = 1;
      } else {
        ratio = 0.08;
      }
    }
    return `rgb(${darkestColour.r}, ${darkestColour.g}, ${darkestColour.b}, ${ratio})`;
  }

  function getBorderStyle() {
    // the line marking the hovered time is dotted so it's easier on the eye than a solid black rule
    if (isViewMode(mode)) return isTimeHovered && !isTimeSlotHovered ? "dotted solid solid solid" : "solid";
    // while editing, the divider between dates that aren't next to each other is dotted
    const rightStyle = isRightBorder ? "solid" : hasDateGapRight ? "dotted" : "dashed";
    const leftStyle = isLeftBorder ? "solid" : hasDateGapLeft ? "dotted" : "dashed";
    const bottomStyle = isBottomBorder ? "solid" : "dashed";
    const topStyle = isTopBorder ? "solid" : isTimeHovered ? "dotted" : "dashed";
    return `${topStyle} ${rightStyle} ${bottomStyle} ${leftStyle}`;
  }

  const shouldDisplayBorder = (eventTime && parseISO(getTimeSlot(eventTime)).getMinutes() === 0) || timeSlotsRow === 0;

  return (
    <button
      aria-label={`${format(parseISO(timeSlot), "EEEE, MMMM d, h:mm a")} (event time)`}
      aria-pressed={isEditMode(mode) ? isSelected : undefined}
      className={cn(
        "h-full w-full cursor-pointer appearance-none border-b-0 border-t-[1px] border-dark-gray outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary",
        borderXSizeStyles,
        isEditMode(mode) ? "touch-pan-x" : "touch-manipulation",
        {
          "bg-primary-purple": (isSelected || isBeingAdded) && !isBeingRemoved,
          "border-r-2": hasDateGapRight,
          // while editing, the dotted divider is drawn once for the whole column (see DateGapDivider)
          "border-r-transparent": hasDateGapRight && isEditMode(mode) && !isRightBorder,
          "border-t-2 border-t-black": isTimeHovered,
          "border-t-0": !shouldDisplayBorder && !isTimeHovered
        },
        isViewMode(mode) && isTimeHovered && "border-t-black",
        isEditMode(mode) && isTimeSlotHovered && "bg-light-gray",
        isViewMode(mode) &&
          isTimeSlotHovered && {
            "border-2 border-black": true,
            "border-l-2": hasDateGapLeft,
            "border-r-2": hasDateGapRight
          },
        isBeingRemoved && {
          "border-b-2 border-b-black": isBottomBorder,
          "border-l-2 border-l-black": isLeftBorder,
          "border-r-2 border-r-black": isRightBorder,
          "border-t-2 border-t-black": isTopBorder
        }
      )}
      disabled={isSaving}
      grid-drag-select-attr={`${timeSlotsRow}_${timeSlotsCol}`}
      onBlur={() => setHoveredTimeSlot(null)}
      onClick={activateWithKeyboard}
      onFocus={() => setHoveredTimeSlot(timeSlot)}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onTouchEnd={handleTouchEnd}
      ref={timeSlotCellRef}
      style={{
        borderStyle: getBorderStyle(),
        ...(isViewMode(mode) ? { backgroundColor: getViewModeCellColour() } : {})
      }}
      type="button"
    />
  );
}
