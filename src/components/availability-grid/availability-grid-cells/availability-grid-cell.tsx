import { AvailabilityGridNode, NodeType } from "../availability-grid-node";

import { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { cn } from "@/utils/cn";

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
  const setHoveredTimeSlot = useAvailabilityGridStore((state) => state.setHoveredTimeSlot);

  const timeSlotsCol = node.getSortedEventDatesIndex();
  const timeSlotsRow = node.getSortedEventTimesIndex();
  const isInFirstDisplayedCol = node.displayedColIndex === 1;
  const isInFirstActualCol = node.offsettedColIndex === 1;

  const eventDate = sortedEventDates[timeSlotsCol];
  const eventTime = sortedEventTimes[timeSlotsRow];

  const isLastEventTime = timeSlotsRow === sortedEventTimes.length - 1;

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

  let topValue = 0;
  switch (availabilityType) {
    // Values for adjusting sticky headers
    case AvailabilityType.SPECIFIC_DATES:
      topValue = 10.9;
      if (screenSize === ScreenSize.LG) topValue -= 1.74;
      if (screenSize >= ScreenSize.XL) topValue -= 1.34;
      break;
    case AvailabilityType.DAYS_OF_WEEK:
      topValue = 9.7;
      if (screenSize === ScreenSize.LG) topValue -= 1.5;
      if (screenSize >= ScreenSize.XL) topValue -= 1.4;
      break;
  }
  const topStyle = `${topValue}rem`;

  switch (node.getRenderType()) {
    case NodeType.COLUMN_HEADER_PLACEHOLDER:
      return (
        <div
          className="m-0 h-full w-full bg-background"
          style={{
            position: "sticky",
            top: `${topStyle}`,
            zIndex: 100
          }}
        >
          &nbsp;
        </div>
      );
    case NodeType.PLACEHOLDER:
      return (
        <div className="h-full w-full" onMouseEnter={() => setHoveredTimeSlot(null)}>
          &nbsp;
        </div>
      );
    case NodeType.ROW_HEADER:
      return (
        <AvailabilityGridRowHeader
          isLastEventTime={isLastEventTime}
          eventTime={eventTime}
          onMouseEnter={() => setHoveredTimeSlot(null)}
        />
      );
    case NodeType.COLUMN_HEADER:
      return (
        <AvailabilityGridColumnHeader
          borderXSizeStyles={borderXSizeStyles}
          eventDate={eventDate}
          hasDateGapRight={hasDateGapRight}
          onMouseEnter={() => setHoveredTimeSlot(null)}
          style={{
            position: "sticky",
            top: `${topStyle}`,
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
          onMouseEnter={() => setHoveredTimeSlot(null)}
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
          onMouseEnter={() => setHoveredTimeSlot(null)}
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
