import { CellBorderCheck } from "@/hooks/useGridDragSelect";
import { cn } from "@/lib/utils";
import useAvailabilityGridStore, {
  AvailabilityGridMode,
  EventDate,
  EventTime,
  getTimeSlot,
  isViewMode
} from "@/store/availabilityGridStore";
import { parseISO } from "date-fns";
import { useMemo } from "react";

type AvailabilityGridCellProps = {
  borderStyle: (isDateGapLeft: boolean, isDateGapRight: boolean) => string;
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
  isSelected: boolean;
  maxParticipantsCountForAllTimeSlots: number;
  mode: AvailabilityGridMode;
  participantsSelectedCount: number;
  totalParticipants: number;
};

export default function AvailabilityGridCell({
  borderStyle,
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
  isSelected,
  maxParticipantsCountForAllTimeSlots,
  mode,
  participantsSelectedCount,
  totalParticipants
}: AvailabilityGridCellProps) {
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);

  const { isBeingAdded, isBeingRemoved, isBottomBorder, isLeftBorder, isRightBorder, isTopBorder } = useMemo(() => {
    const isBeingAdded = isDragAdding && isCellInDragSelectionArea(gridRow, gridCol);
    const isBeingRemoved = !isDragAdding && isCellInDragSelectionArea(gridRow, gridCol);
    const { isBottomBorder, isLeftBorder, isRightBorder, isTopBorder } = isCellBorderOfDragSelectionArea(
      gridRow,
      gridCol
    );
    return { isBeingAdded, isBeingRemoved, isBottomBorder, isLeftBorder, isRightBorder, isTopBorder };
  }, [hoveredTimeSlot]);

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
        "cursor-pointer border-b-0 border-l-2 border-t-2 border-primary-light outline-none",
        {
          "border-l-0": gridCol === 0,
          "border-l-2 border-l-primary": isDateGapLeft,
          "border-t-0": !shouldDisplayBorder,
          "mr-2 border-r-2 border-r-primary": isDateGapRight
        },
        isViewMode(mode) && {
          "hover:border-[3px] hover:border-secondary": true,
          "hover:border-l-[3px]": isDateGapLeft,
          "hover:border-r-[3px]": isDateGapRight
        }
      )}
      onMouseDown={() => handleCellMouseDown(gridRow, gridCol)}
      onMouseEnter={() => handleCellMouseEnter(gridRow, gridCol)}
      onMouseLeave={handleCellMouseLeave}
      style={{ borderStyle: borderStyle(isDateGapLeft, isDateGapRight) }}
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
