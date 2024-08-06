import { DragMode } from "@/hooks/useDragSelect";
import {
  CellBorderCheck,
  extractGridDragSelectData,
  GridDragMoveHandler,
  GridDragStartHandler
} from "@/hooks/useGridDragSelect";
import useRegisterNonPassiveTouchEvents from "@/hooks/useRegisterNonPassiveTouchEvents";
import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { EventDate, EventTime, getTimeFromTimeSlot, getTimeSlot, TimeSlot } from "@/types/Event";
import { cn } from "@/utils/cn";
import { isLeftClick } from "@/utils/mouseEvent";
import { parseISO } from "date-fns";
import { MouseEvent, useEffect, useRef, useState } from "react";
import style from "styled-jsx/style";

export type TimeSlotDragSelectionState = {
  dragMode: DragMode;
  isCellBorderOfDragSelectionArea: (row: number, col: number) => CellBorderCheck;
  isCellInDragSelectionArea: (row: number, col: number) => boolean;
  isDragSelecting: boolean;
  onMouseDragMove: GridDragMoveHandler;
  onMouseDragStart: GridDragStartHandler;
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
  }, [isDragSelecting]);

  function handleMouseDown(e: MouseEvent<HTMLButtonElement>) {
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
    if (!isLeftClick(e)) return;
    if (isEditMode(mode)) onMouseDragMove(timeSlotsRow, timeSlotsCol);
    setHoveredTimeSlot(getTimeSlot(sortedEventTimes[timeSlotsRow], sortedEventDates[timeSlotsCol]));
  }

  function handleMouseLeave() {
    setHoveredTimeSlot(null);
  }

  function extractRowCol(e: TouchEvent) {
    const data = extractGridDragSelectData(e);
    if (!data) return [-1, -1];

    const [rowStr, colStr] = data.split("_");
    const row = isNaN(Number(rowStr)) ? -1 : Number(rowStr);
    const col = isNaN(Number(colStr)) ? -1 : Number(colStr);
    return [row, col];
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();
    const [row, col] = extractRowCol(e);

    if (isEditMode(mode)) onTouchDragStart(row, col);
    if (row !== -1 && col !== -1) setHoveredTimeSlot(getTimeSlot(sortedEventTimes[row], sortedEventDates[col]));
  }

  function handleTouchMove(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();

    const [row, col] = extractRowCol(e);
    if (isEditMode(mode)) onTouchDragMove(row, col);
    if (row !== -1 && col !== -1) setHoveredTimeSlot(getTimeSlot(sortedEventTimes[row], sortedEventDates[col]));
  }

  function handleTouchEnd() {
    if (isEditMode(mode)) setHoveredTimeSlot(null);
  }

  useRegisterNonPassiveTouchEvents({
    onTouchMove: handleTouchMove,
    onTouchStart: handleTouchStart,
    ref: timeSlotCellRef
  });

  const isSelected = selectedTimeSlots.includes(timeSlot);

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
    if (isViewMode(mode)) return "solid";
    const rightStyle = hasDateGapRight || isRightBorder ? "solid" : "dashed";
    const leftStyle = hasDateGapLeft || isLeftBorder ? "solid" : "dashed";
    const bottomStyle = isBottomBorder ? "solid" : "dashed";
    const topStyle = isTimeHovered || isTopBorder ? "solid" : "dashed";
    return `${topStyle} ${rightStyle} ${bottomStyle} ${leftStyle}`;
  }

  const shouldDisplayBorder = (eventTime && parseISO(getTimeSlot(eventTime)).getMinutes() === 0) || timeSlotsRow === 0;

  return (
    <button
      className={cn(
        "h-full w-full cursor-pointer touch-none appearance-none border-b-0 border-t-2 border-primary-light outline-none",
        borderXSizeStyles,
        {
          "bg-primary hover:bg-primary/60": (isSelected || isBeingAdded) && !isBeingRemoved,
          "border-l-primary": hasDateGapLeft,
          "border-r-primary": hasDateGapRight,
          "border-t-[3px]": isTimeHovered,
          "border-t-0": !shouldDisplayBorder && !isTimeHovered
        },
        isViewMode(mode) && isTimeHovered && "border-t-secondary",
        isEditMode(mode) && isDragSelecting && isTimeSlotHovered && "bg-accent",
        isViewMode(mode) &&
          isTimeSlotHovered && {
            "border-[3px] border-secondary": true,
            "border-l-[3px]": hasDateGapLeft,
            "border-r-[3px]": hasDateGapRight
          },
        isBeingRemoved && {
          "border-b-4 border-b-secondary": isBottomBorder,
          "border-l-4 border-l-secondary": isLeftBorder,
          "border-r-4 border-r-secondary": isRightBorder,
          "border-t-4 border-t-secondary": isTopBorder
        }
      )}
      grid-drag-select-attr={`${timeSlotsRow}_${timeSlotsCol}`}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleTouchEnd}
      ref={timeSlotCellRef}
      style={{
        borderStyle: getBorderStyle(),
        ...(isViewMode(mode) ? { backgroundColor: getViewModeCellColour() } : {}),
        ...style
      }}
    />
  );
}
