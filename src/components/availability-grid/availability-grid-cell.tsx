import { cn } from "@/lib/utils";
import { AvailabilityGridMode, isEditMode, isViewMode } from "@/store/availabilityGridStore";
import React from "react";

type AvailabilityGridCellProps = Omit<AvailabilityGridCellBaseProps, "children"> & {
  gridCol: number;
  gridRow: number;
  isBeingAdded: boolean;
  isBeingRemoved: boolean;
  isDateGapLeft: boolean;
  isDateGapRight: boolean;
  isSelected: boolean;
  mode: AvailabilityGridMode;
  participantsSelectedCount: number;
  totalParticipants: number;
};

const AvailabilityGridCell = React.memo(
  ({
    gridCol,
    gridRow,
    isBeingAdded,
    isBeingRemoved,
    isSelected,
    mode,
    participantsSelectedCount,
    totalParticipants,
    ...props
  }: AvailabilityGridCellProps) => {
    return (
      <AvailabilityGridCellBase gridCol={gridCol} gridRow={gridRow} mode={mode} {...props}>
        <div
          className={cn("h-full w-full border-0 border-primary-light hover:bg-purple-100", {
            "bg-opacity-25 hover:bg-opacity-40": isBeingRemoved,
            "bg-primary-dark hover:bg-primary-dark hover:bg-opacity-70": isSelected || isBeingAdded
          })}
          style={
            isViewMode(mode) ? { backgroundColor: interpolateColour(participantsSelectedCount, totalParticipants) } : {}
          }
        />
      </AvailabilityGridCellBase>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.gridCol === nextProps.gridCol &&
      prevProps.gridRow === nextProps.gridRow &&
      prevProps.isBeingAdded === nextProps.isBeingAdded &&
      prevProps.isBeingRemoved === nextProps.isBeingRemoved &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.totalParticipants === nextProps.totalParticipants &&
      prevProps.isTimeSlotHovered === nextProps.isTimeSlotHovered &&
      prevProps.isTimeHovered === nextProps.isTimeHovered &&
      prevProps.handleCellMouseDown === nextProps.handleCellMouseDown &&
      prevProps.handleCellMouseEnter === nextProps.handleCellMouseEnter &&
      prevProps.mode === nextProps.mode &&
      prevProps.participantsSelectedCount === nextProps.participantsSelectedCount
    );
  }
);

export default AvailabilityGridCell;

function interpolateColour(numParticipants: number, maxParticipants: number) {
  // background colour
  const startColor = { b: 252, g: 252, r: 256 };
  if (maxParticipants === 0) return `rgb(${startColor.r}, ${startColor.g}, ${startColor.b})`;
  // primary-dark colour
  const endColor = { b: 255, g: 71, r: 151 };

  const ratio = numParticipants / maxParticipants;

  const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
  const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
  const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

  return `rgb(${r}, ${g}, ${b})`;
}

type AvailabilityGridCellBaseProps = {
  children?: React.ReactNode;
  className?: string;
  gridCol: number;
  gridRow: number;
  handleCellMouseDown: (row: number, col: number) => void;
  handleCellMouseEnter: (row: number, col: number) => void;
  isDateGapLeft: boolean;
  isDateGapRight: boolean;
  isTimeHovered: boolean;
  isTimeSlotHovered: boolean;
  mode: AvailabilityGridMode;
};

export const AvailabilityGridCellBase = React.memo(
  ({
    children,
    className,
    gridCol,
    gridRow,
    handleCellMouseDown,
    handleCellMouseEnter,
    isDateGapLeft,
    isDateGapRight,
    isTimeHovered,
    isTimeSlotHovered,
    mode
  }: AvailabilityGridCellBaseProps) => {
    return (
      <button
        className={cn(
          "cursor-pointer border-[1px] border-primary-light",
          {
            "border-l-0": gridCol === 0,
            "border-l-2 border-l-primary": isDateGapLeft,
            "border-t-[3px]": isTimeHovered && isEditMode(mode),
            "border-t-2 border-t-secondary": isTimeHovered && isViewMode(mode),
            "mr-2 border-r-2 border-r-primary": isDateGapRight
          },
          isViewMode(mode) &&
            isTimeSlotHovered && {
              "border-[3px] border-secondary": true,
              "border-l-[3px]": isDateGapLeft,
              "border-r-[3px]": isDateGapRight
            },
          className
        )}
        onMouseDown={() => handleCellMouseDown(gridRow, gridCol)}
        onMouseEnter={() => handleCellMouseEnter(gridRow, gridCol)}
        type="button"
      >
        {children}
      </button>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.gridCol === nextProps.gridCol &&
      prevProps.mode === nextProps.mode &&
      prevProps.isDateGapLeft === nextProps.isDateGapLeft &&
      prevProps.isDateGapRight === nextProps.isDateGapRight &&
      prevProps.gridRow === nextProps.gridRow &&
      prevProps.isTimeSlotHovered === nextProps.isTimeSlotHovered &&
      prevProps.isTimeHovered === nextProps.isTimeHovered &&
      prevProps.handleCellMouseDown === nextProps.handleCellMouseDown &&
      prevProps.handleCellMouseEnter === nextProps.handleCellMouseEnter &&
      prevProps.children === nextProps.children
    );
  }
);
