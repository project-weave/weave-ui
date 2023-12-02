import { CellBorderCheck } from "@/hooks/useGridDragSelect";
import { cn } from "@/lib/utils";
import useAvailabilityGridStore, {
  AvailabilityGridMode,
  EventDate,
  EventTime,
  getTimeFromTimeSlot,
  getTimeSlot,
  isEditMode,
  isViewMode
} from "@/store/availabilityGridStore";
import { parseISO } from "date-fns";
import React from "react";

type AvailabilityGridCellProps = {
  eventDate: EventDate;
  eventTime: EventTime;
  gridCol: number;
  gridRow: number;
  handleCellMouseDown: (row: number, col: number) => void;
  handleCellMouseEnter: (row: number, col: number) => void;
  handleCellMouseLeave: () => void;
  isBestTimesEnabled: boolean;
  isCellBorderOfDragSelectionArea: (row: number, col: number) => CellBorderCheck;
  isCellInDragSelectionArea: (row: number, col: number) => boolean;
  isDateGapLeft: boolean;
  isDateGapRight: boolean;
  isDragAdding: boolean;
  isLastCol: boolean;
  isSelected: boolean;
  maxParticipantsCountForAllTimeSlots: number;
  mode: AvailabilityGridMode;
  participantsSelectedCount: number;
  totalParticipants: number;
};

export default function AvailabilityGridCell({
  eventDate,
  eventTime,
  gridCol,
  gridRow,
  handleCellMouseDown,
  handleCellMouseEnter,
  handleCellMouseLeave,
  isBestTimesEnabled,
  isCellBorderOfDragSelectionArea,
  isCellInDragSelectionArea,
  isDateGapLeft,
  isDateGapRight,
  isDragAdding,
  isLastCol,
  isSelected,
  maxParticipantsCountForAllTimeSlots,
  mode,
  participantsSelectedCount,
  totalParticipants
}: AvailabilityGridCellProps) {
  const timeSlot = getTimeSlot(eventTime, eventDate);
  const isTimeHovered = getTimeFromTimeSlot(useAvailabilityGridStore((state) => state.hoveredTimeSlot)) === eventTime;
  const isTimeSlotHovered = useAvailabilityGridStore((state) => state.hoveredTimeSlot) === timeSlot;

  const isBeingAdded = isDragAdding && isCellInDragSelectionArea(gridRow, gridCol);
  const isBeingRemoved = !isDragAdding && isCellInDragSelectionArea(gridRow, gridCol);

  const { isBottomBorder, isLeftBorder, isRightBorder, isTopBorder } = isCellBorderOfDragSelectionArea(
    gridRow,
    gridCol
  );

  function getViewModeCellColour() {
    if (totalParticipants === 0 || participantsSelectedCount === 0) return "transparent";
    // primary-dark
    const darkestColour = { b: 255, g: 71, r: 151 };
    let ratio = participantsSelectedCount / totalParticipants;

    if (isBestTimesEnabled) {
      if (maxParticipantsCountForAllTimeSlots === 0) return "transparent";
      if (maxParticipantsCountForAllTimeSlots === participantsSelectedCount) {
        ratio = 1;
      } else {
        ratio = 0.08;
      }
    }
    return `rgb(${darkestColour.r}, ${darkestColour.g}, ${darkestColour.b}, ${ratio})`;
  }

  const shouldDisplayBorder = eventTime && parseISO(getTimeSlot(eventTime)).getMinutes() === 0;

  return (
    <button
      className={cn(
        "cursor-pointer border-[1px] border-b-0 border-t-2 border-primary-light outline-none",
        {
          "border-l-0": gridCol === 0,
          "border-l-2 border-l-primary": isDateGapLeft,
          "border-r-0": isLastCol,
          "border-t-[3px]": isTimeHovered && isEditMode(mode),
          "border-t-0": !shouldDisplayBorder && !isTimeHovered,
          "border-t-2 border-t-secondary": isTimeHovered && isViewMode(mode),
          "mr-2 border-r-2 border-r-primary": isDateGapRight
        },
        isViewMode(mode) &&
          isTimeSlotHovered && {
            "border-[3px] border-secondary": true,
            "border-l-[3px]": isDateGapLeft,
            "border-r-[3px]": isDateGapRight
          }
      )}
      onMouseDown={() => handleCellMouseDown(gridRow, gridCol)}
      onMouseEnter={() => handleCellMouseEnter(gridRow, gridCol)}
      onMouseLeave={handleCellMouseLeave}
      type="button"
    >
      <div
        className={cn(
          "h-full w-full border-0 border-primary-light hover:bg-accent",
          { "bg-primary-dark hover:bg-primary-dark/70": (isSelected || isBeingAdded) && !isBeingRemoved },
          isBeingRemoved && {
            "border-b-4": isBottomBorder,
            "border-l-4": isLeftBorder,
            "border-r-4": isRightBorder,
            "border-secondary bg-background": true,
            "border-t-4": isTopBorder
          }
        )}
        style={isViewMode(mode) ? { backgroundColor: getViewModeCellColour() } : {}}
      />
    </button>
  );
}
