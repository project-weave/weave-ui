import { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { AvailabilityType, isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

import { AvailabilityGridNode, NodeType } from "../availability-grid-node";
import AvailabilityGridColumnHeader from "./availability-grid-column-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header";
import AvailabilityGridTimeSlot, { TimeSlotDragSelectionState } from "./availability-grid-time-slot";

type AvailabilityGridCellProps = {
  animateEditAvailabilityButton: () => void;
  hasDateGapLeft: boolean;
  hasDateGapRight: boolean;
  node: AvailabilityGridNode;
  screenSize: ScreenSize;
  timeSlotDragSelectionState: TimeSlotDragSelectionState;
};
export default function AvailabilityGridCell({
  animateEditAvailabilityButton,
  hasDateGapLeft,
  hasDateGapRight,
  node,
  screenSize,
  timeSlotDragSelectionState
}: AvailabilityGridCellProps) {
  const { availabilityType, sortedEventDates, sortedEventTimes } = useAvailabilityGridStore((state) => state.eventData);
  const mode = useAvailabilityGridStore((state) => state.mode);

  const timeSlotsCol = node.getSortedEventDatesIndex();
  const timeSlotsRow = node.getSortedEventTimesIndex();
  const isInFirstDisplayedCol = node.displayedColIndex === 1;
  const isInFirstActualCol = node.offsettedColIndex === 1;

  const eventDate = sortedEventDates[timeSlotsCol];
  const eventTime = sortedEventTimes[timeSlotsRow];

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

  function getFirstAndLastCellBorderStyle() {
    if (isViewMode(mode)) return "solid";
    const rightStyle = hasDateGapRight ? "solid" : "dashed";
    const leftStyle = hasDateGapLeft ? "solid" : "dashed";
    const bottomStyle = "dashed";
    const topStyle = "dashed";
    return `${topStyle} ${rightStyle} ${bottomStyle} ${leftStyle}`;
  }

  const borderXSizeStyles = getBorderXSizeStyles(
    isInFirstDisplayedCol,
    isInFirstActualCol,
    node.isNodeInLastDisplayedCol,
    node.isNodeInLastActualCol,
    hasDateGapLeft,
    hasDateGapRight
  );

  let topValue = "";
  switch (availabilityType) {
    case AvailabilityType.SPECIFIC_DATES:
      topValue = "9.24rem";
      if (screenSize === ScreenSize.LG) topValue = "7.5rem";
      if (screenSize >= ScreenSize.XL) topValue = "7.9rem";
      break;
    case AvailabilityType.DAYS_OF_WEEK:
      topValue = "8.80rem";
      if (screenSize === ScreenSize.LG) topValue = "7.60rem";
      if (screenSize >= ScreenSize.XL) topValue = "7.8rem";
      break;
  }

  switch (node.getRenderType()) {
    case NodeType.COLUMN_HEADER_PLACEHOLDER:
      return (
        <div
          className="m-0 h-full w-full bg-background"
          style={{
            position: "sticky",
            top: `${topValue}`,
            zIndex: 100
          }}
        >
          &nbsp;
        </div>
      );
    case NodeType.PLACEHOLDER:
      return <div className="h-full w-full">&nbsp;</div>;
    case NodeType.ROW_HEADER:
      return <AvailabilityGridRowHeader eventTime={eventTime} />;
    case NodeType.COLUMN_HEADER:
      return (
        <AvailabilityGridColumnHeader
          borderXSizeStyles={borderXSizeStyles}
          eventDate={eventDate}
          hasDateGapRight={hasDateGapRight}
          style={{
            position: "sticky",
            top: `${topValue}`,
            zIndex: 100
          }}
        />
      );

    case NodeType.FIRST_CELL_IN_COLUMN:
      return (
        <div
          className={cn("h-full w-full border-t-0 border-primary-light", borderXSizeStyles, {
            "border-l-primary": hasDateGapLeft,
            "border-r-primary": hasDateGapRight
          })}
          style={{ borderStyle: getFirstAndLastCellBorderStyle() }}
        />
      );
    case NodeType.LAST_CELL_IN_COLUMN:
      return (
        <div
          className={cn("h-full w-full border-b-0 border-t-2 border-primary-light", borderXSizeStyles, {
            "border-l-primary": hasDateGapLeft,
            "border-r-primary": hasDateGapRight
          })}
          style={{ borderStyle: getFirstAndLastCellBorderStyle() }}
        />
      );
    case NodeType.TIME_SLOT:
      return (
        <AvailabilityGridTimeSlot
          animateEditAvailabilityButton={animateEditAvailabilityButton}
          borderXSizeStyles={borderXSizeStyles}
          eventDate={eventDate}
          eventTime={eventTime}
          hasDateGapLeft={hasDateGapLeft}
          hasDateGapRight={hasDateGapRight}
          timeSlotDragSelectionState={timeSlotDragSelectionState}
          timeSlotsCol={timeSlotsCol}
          timeSlotsRow={timeSlotsRow}
        />
      );
  }
}
