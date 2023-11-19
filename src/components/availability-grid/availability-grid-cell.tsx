import { cn } from "@/lib/utils";
import { MouseEventHandler } from "react";
import React from "react";

type AvailabilityGridCellProps = Omit<AvailabilityGridCellBaseProps, "children"> & {
  gridCol: number;
  gridRow: number;
  handleCellMouseDown: (row: number, col: number) => void;
  handleCellMouseEnter: (row: number, col: number) => void;
  isBeingAdded: boolean;
  isBeingRemoved: boolean;
  isDateGapLeft: boolean;
  isDateGapRight: boolean;
  isSelected: boolean;
  isViewMode: boolean;
  participantsSelected: string[];
  totalParticipants: number;
};

const AvailabilityGridCell = React.memo(
  ({
    gridCol,
    gridRow,
    handleCellMouseDown,
    handleCellMouseEnter,
    isBeingAdded,
    isBeingRemoved,
    isSelected,
    isViewMode,
    participantsSelected,
    totalParticipants,
    ...props
  }: AvailabilityGridCellProps) => {
    return (
      <AvailabilityGridCellBase gridCol={gridCol} {...props}>
        <div
          className={cn("h-full w-full border-0 border-primary-light duration-100 hover:bg-purple-100", {
            "bg-opacity-25 hover:bg-opacity-40": isBeingRemoved,
            "bg-primary-dark hover:bg-primary-dark hover:bg-opacity-70": isSelected || isBeingAdded
          })}
          onMouseDown={() => handleCellMouseDown(gridRow, gridCol)}
          onMouseEnter={() => handleCellMouseEnter(gridRow, gridCol)}
          style={
            isViewMode ? { backgroundColor: interpolateColor(participantsSelected.length, totalParticipants) } : {}
          }
        />
      </AvailabilityGridCellBase>
    );
  }
);

export default AvailabilityGridCell;

function interpolateColor(numParticipants: number, maxParticipants: number) {
  // white
  const startColor = { b: 255, g: 255, r: 255 };
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
