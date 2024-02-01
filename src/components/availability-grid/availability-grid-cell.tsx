import { CellBorderCheck } from "@/hooks/useGridDragSelect";
import { cn } from "@/lib/utils";
import useAvailabilityGridStore, {
  AvailabilityGridMode,
  EventDate,
  EventTime,
  getTimeFromTimeSlot,
  getTimeSlot,
  isViewMode
} from "@/store/availabilityGridStore";
import { parseISO } from "date-fns";
import { useEffect, useState } from "react";

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
  isDragSelecting: boolean;
  isSelected: boolean;
  maxParticipantsCountForAllTimeSlots: number;
  mode: AvailabilityGridMode;
  participantsSelectedCount: number;
  totalParticipants: number;
};

export default function AvailabilityGridCell({
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
  isDragSelecting,
  isSelected,
  maxParticipantsCountForAllTimeSlots,
  mode,
  participantsSelectedCount,
  totalParticipants
}: AvailabilityGridCellProps) {
  const [isBeingAdded, setIsBeingAdded] = useState(false);
  const [isBeingRemoved, setIsBeingRemoved] = useState(false);
  const [isBottomBorder, setIsBottomBorder] = useState(false);
  const [isLeftBorder, setIsLeftBorder] = useState(false);
  const [isRightBorder, setIsRightBorder] = useState(false);
  const [isTopBorder, setIsTopBorder] = useState(false);

  const isTimeHovered = useAvailabilityGridStore((state) => eventTime === getTimeFromTimeSlot(state.hoveredTimeSlot));

  useEffect(() => {
    /*    
      hacky/optimized way of rerendering cells within the drag selection area rather than rerendering all cells 
      subscribe function by itself doesn't cause rerender, hoveredTimeSlot causes changes to availabilityGridStore 
      when dragging occurs hoverTimeSlot will change and causing this subscribe code to run 
      setState is called and react will only rerender if there is any state changes 
      this way, only necessary cells will rerender and only during dragging (not during view mode and not during normal cell hover)
    */
    const unsub = useAvailabilityGridStore.subscribe(() => {
      if (isDragSelecting) {
        const isBeingAdded = isDragAdding && isCellInDragSelectionArea(gridRow, gridCol);
        const isBeingRemoved = !isDragAdding && isCellInDragSelectionArea(gridRow, gridCol);
        const { isBottomBorder, isLeftBorder, isRightBorder, isTopBorder } = isCellBorderOfDragSelectionArea(
          gridRow,
          gridCol
        );
        setIsBeingAdded(isBeingAdded);
        setIsBeingRemoved(isBeingRemoved);
        setIsBottomBorder(isBottomBorder);
        setIsLeftBorder(isLeftBorder);
        setIsRightBorder(isRightBorder);
        setIsTopBorder(isTopBorder);
      }
    });
    return unsub;
  }, [isDragSelecting]);

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

  function getBorderStyle() {
    if (isViewMode(mode)) return "solid";
    const rightStyle = isDateGapRight ? "solid" : "dashed";
    const leftStyle = isDateGapLeft ? "solid" : "dashed";
    const bottomStyle = "dashed";
    const topStyle = isTimeHovered ? "solid" : "dashed";
    return `${topStyle} ${rightStyle} ${bottomStyle} ${leftStyle}`;
  }

  const shouldDisplayBorder = eventTime && parseISO(getTimeSlot(eventTime)).getMinutes() === 0;

  return (
    <button
      className={cn(
        "cursor-pointer border-b-0 border-l-2 border-t-2 border-primary-light outline-none",
        {
          "border-l-0": gridCol === 0,
          "border-l-2 border-l-primary": isDateGapLeft,
          "border-t-[3px]": isTimeHovered,
          "border-t-0": !shouldDisplayBorder && !isTimeHovered,
          "mr-2 border-r-2 border-r-primary": isDateGapRight
        },
        isViewMode(mode) && {
          "border-t-secondary": isTimeHovered,
          "hover:border-[3px] hover:border-secondary": true,
          "hover:border-l-[3px]": isDateGapLeft,
          "hover:border-r-[3px]": isDateGapRight
        }
      )}
      onMouseDown={() => handleCellMouseDown(gridRow, gridCol)}
      onMouseEnter={() => handleCellMouseEnter(gridRow, gridCol)}
      onMouseLeave={handleCellMouseLeave}
      style={{
        borderStyle: getBorderStyle()
      }}
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
