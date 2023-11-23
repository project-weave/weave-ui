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
          className={cn("hover:bg-accent h-full w-full border-0 border-primary-light", {
            "bg-accent hover:bg-purple-300": isBeingRemoved,
            "bg-primary-dark hover:bg-primary-dark/70": (isSelected || isBeingAdded) && !isBeingRemoved
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
      prevProps.handleCellMouseDown === nextProps.handleCellMouseDown &&
      prevProps.handleCellMouseEnter === nextProps.handleCellMouseEnter &&
      prevProps.isBeingAdded === nextProps.isBeingAdded &&
      prevProps.isBeingRemoved === nextProps.isBeingRemoved &&
      prevProps.isLastCol === nextProps.isLastCol &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isTimeHovered === nextProps.isTimeHovered &&
      prevProps.isTimeSlotHovered === nextProps.isTimeSlotHovered &&
      prevProps.mode === nextProps.mode &&
      prevProps.participantsSelectedCount === nextProps.participantsSelectedCount &&
      prevProps.totalParticipants === nextProps.totalParticipants
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
  isLastCol: boolean;
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
    isLastCol,
    isTimeHovered,
    isTimeSlotHovered,
    mode
  }: AvailabilityGridCellBaseProps) => {
    return (
      <button
        className={cn(
          "cursor-pointer border-[1px] border-primary-light outline-none",
          {
            "border-l-0": gridCol === 0,
            "border-l-2 border-l-primary": isDateGapLeft,
            "border-r-0": isLastCol,
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
      prevProps.children === nextProps.children &&
      prevProps.gridCol === nextProps.gridCol &&
      prevProps.gridRow === nextProps.gridRow &&
      prevProps.handleCellMouseDown === nextProps.handleCellMouseDown &&
      prevProps.handleCellMouseEnter === nextProps.handleCellMouseEnter &&
      prevProps.isDateGapLeft === nextProps.isDateGapLeft &&
      prevProps.isDateGapRight === nextProps.isDateGapRight &&
      prevProps.isLastCol === nextProps.isLastCol &&
      prevProps.isTimeHovered === nextProps.isTimeHovered &&
      prevProps.isTimeSlotHovered === nextProps.isTimeSlotHovered &&
      prevProps.mode === nextProps.mode
    );
  }
);
