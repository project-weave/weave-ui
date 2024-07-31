import { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { AvailabilityType, isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { isConsecutiveDay } from "@/utils/date";
import { parseISO } from "date-fns";
import { CSSProperties, ReactNode } from "react";

import { AvailabilityGridNode, NodeType } from "../availability-grid-node";
import AvailabilityGridColumnHeader from "./availability-grid-column-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header";
import AvailabilityGridTimeSlot, { TimeSlotDragSelectionState } from "./availability-grid-time-slot";

type AvailabilityGridCellProps = {
  animateEditAvailabilityButton: () => void;
  node: AvailabilityGridNode;
  screenSize: ScreenSize;
  timeSlotDragSelectionState: TimeSlotDragSelectionState;
};
export default function AvailabilityGridCell({
  animateEditAvailabilityButton,
  node,
  screenSize,
  timeSlotDragSelectionState
}: AvailabilityGridCellProps) {
  const { availabilityType, sortedEventDates, sortedEventTimes } = useAvailabilityGridStore((state) => state.eventData);
  const mode = useAvailabilityGridStore((state) => state.mode);

  const timeSlotsCol = node.getTimeSlotsColumnIndex();
  const timeSlotsRow = node.getTimeSlotsRowIndex();
  const eventDate = sortedEventDates[timeSlotsCol];
  const eventTime = sortedEventTimes[timeSlotsRow];

  const prevEventDate = sortedEventDates[timeSlotsCol - 1];
  const nextEventDate = sortedEventDates[timeSlotsCol + 1];

  const isInFirstDisplayedCol = node.displayedColIndex === 1;
  const isInFirstActualCol = node.offsettedColIndex === 1;

  const hasDateGapLeft = !isInFirstDisplayedCol && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
  const hasDateGapRight =
    !node.isNodeInLastDisplayedCol && !isConsecutiveDay(parseISO(eventDate), parseISO(nextEventDate));

  const CellWrapper = ({
    children,
    className,
    style
  }: {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
  }) => (
    <div
      className={cn(
        "w-full",
        {
          "pl-[1.5px] xl:pl-[2px]": hasDateGapLeft,
          "pr-[1.5px] xl:pr-[2px]": hasDateGapRight
        },
        className
      )}
      style={style}
    >
      {children}
    </div>
  );

  function getCellBorderStyle() {
    if (isViewMode(mode)) return "solid";
    const rightStyle = hasDateGapRight ? "solid" : "dashed";
    const leftStyle = hasDateGapLeft ? "solid" : "dashed";
    const bottomStyle = "dashed";
    const topStyle = "dashed";
    return `${topStyle} ${rightStyle} ${bottomStyle} ${leftStyle}`;
  }

  function getBorderXSizeStyles(
    isCellInFirstDisplayedCol: boolean,
    isCellInFirstActualCol: boolean,
    isCellInLastDisplayedCol: boolean,
    isCellInLastActualCol: boolean,
    hasDateGapLeft: boolean,
    hasDateGapRight: boolean
  ): string {
    const classNames: string[] = ["border-l-[1px] border-r-[1px]"];
    if (isCellInFirstDisplayedCol) classNames.push("border-l-0");
    if (hasDateGapLeft || (isCellInFirstDisplayedCol && !isCellInFirstActualCol)) classNames.push("border-l-2");
    if (isCellInLastActualCol) classNames.push("border-r-0");
    if (hasDateGapRight || (isCellInLastDisplayedCol && !isCellInLastActualCol)) classNames.push("border-r-2");

    return classNames.join(" ");
  }
  const borderStyle = getCellBorderStyle();
  const borderXSizeStyles = getBorderXSizeStyles(
    isInFirstDisplayedCol,
    isInFirstActualCol,
    node.isNodeInLastDisplayedCol,
    node.isNodeInLastActualCol,
    hasDateGapLeft,
    hasDateGapRight
  );
  const cellWidthGapOffset = hasDateGapRight ? (screenSize < ScreenSize.LG ? "3px" : "4px") : "0px";
  const cellWidth = `calc(100% - ${cellWidthGapOffset})`;

  let topValue = "";
  switch (availabilityType) {
    case AvailabilityType.SPECIFIC_DATES:
      topValue = "11rem";
      if (screenSize === ScreenSize.LG) topValue = "9.1rem";
      if (screenSize >= ScreenSize.XL) topValue = "9.6rem";
      break;
    case AvailabilityType.DAYS_OF_WEEK:
      topValue = "10rem";
      if (screenSize === ScreenSize.LG) topValue = "9.1rem";
      if (screenSize >= ScreenSize.XL) topValue = "9.6rem";
      break;
  }

  switch (node.getRenderType()) {
    case NodeType.COLUMN_HEADER_PLACEHOLDER:
      return (
        <CellWrapper
          className="z-[100] h-full bg-background"
          style={{
            position: "sticky",
            top: `${topValue}`
          }}
        >
          &nbsp;
        </CellWrapper>
      );
    case NodeType.PLACEHOLDER:
      return <div>&nbsp;</div>;
    case NodeType.ROW_HEADER:
      return <AvailabilityGridRowHeader eventTime={eventTime} />;
    case NodeType.COLUMN_HEADER:
      return (
        <CellWrapper
          className="z-[100] h-full bg-background"
          style={{
            position: "sticky",
            top: `${topValue}`
          }}
        >
          <AvailabilityGridColumnHeader
            borderXSizeStyles={borderXSizeStyles}
            cellWidth={cellWidth}
            eventDate={eventDate}
          />
        </CellWrapper>
      );

    case NodeType.FIRST_CELL_IN_COLUMN:
      return (
        <CellWrapper>
          <div
            className={cn("h-full border-t-0 border-primary-light", borderXSizeStyles, {
              "border-l-primary": hasDateGapLeft,
              "border-r-primary": hasDateGapRight
            })}
            style={{ borderStyle, width: cellWidth }}
          />
        </CellWrapper>
      );
    case NodeType.LAST_CELL_IN_COLUMN:
      return (
        <CellWrapper>
          <div
            className={cn("h-full border-b-0 border-t-2 border-primary-light", borderXSizeStyles, {
              "border-l-primary": hasDateGapLeft,
              "border-r-primary": hasDateGapRight
            })}
            style={{ borderStyle, width: cellWidth }}
          />
        </CellWrapper>
      );
    case NodeType.TIME_SLOT:
      return (
        <CellWrapper>
          <AvailabilityGridTimeSlot
            animateEditAvailabilityButton={animateEditAvailabilityButton}
            borderXSizeStyles={borderXSizeStyles}
            cellWidth={cellWidth}
            eventDate={eventDate}
            eventTime={eventTime}
            hasDateGapLeft={hasDateGapLeft}
            hasDateGapRight={hasDateGapRight}
            timeSlotDragSelectionState={timeSlotDragSelectionState}
            timeSlotsCol={timeSlotsCol}
            timeSlotsRow={timeSlotsRow}
          />
        </CellWrapper>
      );
  }
}
