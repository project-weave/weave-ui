import { cn } from "@/lib/utils";
import { MouseEventHandler } from "react";

import {
  AvailabilityCellPosition,
  AvailabilityDate,
  AvailabilityTime,
  getAvailabilityDateTimeFormat
} from "./availability-grid";

type AvailabilityGridCellProps = Omit<AvailabilityGridCellBaseProps, "children"> & {
  availabilityDate: AvailabilityDate;
  availabilityTime: AvailabilityTime;
  dragEndCellPosition: AvailabilityCellPosition | null;
  dragIsAdding: boolean;
  dragStartCellPosition: AvailabilityCellPosition | null;
  gridCol: number;
  gridRow: number;
  handleAvailabilityCellMouseDown: (cellPosition: AvailabilityCellPosition) => void;
  handleAvailabilityCellMouseEnter: (cellPosition: AvailabilityCellPosition) => void;
  hoveredTime: AvailabilityTime | null;
  isDateGapLeft: boolean;
  isDateGapRight: boolean;
  selectedAvailabilities: Set<AvailabilityTime>;
};

export default function AvailabilityGridCell({
  availabilityDate,
  availabilityTime,
  dragEndCellPosition,
  dragIsAdding,
  dragStartCellPosition,
  gridCol,
  gridRow,
  handleAvailabilityCellMouseDown,
  handleAvailabilityCellMouseEnter,
  hoveredTime,
  selectedAvailabilities,
  ...props
}: AvailabilityGridCellProps) {
  const availabilityDateTime = getAvailabilityDateTimeFormat(availabilityTime, availabilityDate);
  const cellPosition: AvailabilityCellPosition = { col: gridCol, row: gridRow };

  function isCellInDragSelectionArea(cellPosition: AvailabilityCellPosition): boolean {
    if (dragStartCellPosition === null || dragEndCellPosition === null) return false;
    const [minRow, maxRow] = [
      Math.min(dragStartCellPosition.row, dragEndCellPosition.row),
      Math.max(dragStartCellPosition.row, dragEndCellPosition.row)
    ];
    const [minCol, maxCol] = [
      Math.min(dragStartCellPosition.col, dragEndCellPosition.col),
      Math.max(dragStartCellPosition.col, dragEndCellPosition.col)
    ];
    return (
      minRow <= cellPosition.row &&
      cellPosition.row <= maxRow &&
      minCol <= cellPosition.col &&
      cellPosition.col <= maxCol
    );
  }

  const isSelected = selectedAvailabilities.has(availabilityDateTime);
  const isBeingAdded = dragIsAdding && isCellInDragSelectionArea(cellPosition);
  const isBeingRemoved = !dragIsAdding && isCellInDragSelectionArea(cellPosition);
  const isTimeHovered = availabilityTime === hoveredTime;

  return (
    <AvailabilityGridCellBase gridCol={gridCol} {...props}>
      <div
        className={cn("h-full w-full border-0 border-primary-light hover:bg-purple-100", {
          "bg-opacity-25 hover:bg-opacity-40": isBeingRemoved,
          "bg-primary hover:bg-primary hover:bg-opacity-70": isSelected || isBeingAdded,
          "border-t-[1.5px]": isTimeHovered
        })}
        onMouseDown={() => handleAvailabilityCellMouseDown(cellPosition)}
        onMouseEnter={() => handleAvailabilityCellMouseEnter(cellPosition)}
      />
    </AvailabilityGridCellBase>
  );
}

type AvailabilityGridCellBaseProps = {
  children?: React.ReactNode;
  className?: string;
  gridCol: number;
  isDateGapLeft: boolean;
  isDateGapRight: boolean;
  onMouseEnter?: MouseEventHandler;
};

export function AvailabilityGridCellBase({
  children,
  className,
  gridCol,
  isDateGapLeft,
  isDateGapRight,
  onMouseEnter
}: AvailabilityGridCellBaseProps) {
  return (
    <div
      className={cn(
        "text-cente border-2 border-b-0 border-r-0 border-primary-light",
        {
          "border-l-0": gridCol === 0,
          "border-l-primary": isDateGapLeft,
          "mr-2 border-r-2 border-r-primary": isDateGapRight
        },
        className
      )}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
}
