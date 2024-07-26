import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { isConsecutiveDay } from "@/utils/date";
import { parseISO } from "date-fns";

import { AvailabilityGridNode, NodeType } from "../availability-grid-node";
import AvailabilityGridColumnHeader from "./availability-grid-column-header";
import AvailabilityGridRowHeader from "./availability-grid-row-header";
import AvailabilityGridTimeSlot, { TimeSlotDragSelectionState } from "./availability-grid-time-slot";

type AvailabilityGridCellProps = {
  animateEditAvailabilityButton: () => void;
  node: AvailabilityGridNode;
  timeSlotDragSelectionState: TimeSlotDragSelectionState;
};
export default function AvailabilityGridCell({
  animateEditAvailabilityButton,
  node,
  timeSlotDragSelectionState
}: AvailabilityGridCellProps) {
  const { sortedEventDates, sortedEventTimes } = useAvailabilityGridStore((state) => state.eventData);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const availabilityGridViewWindowSize = useAvailabilityGridStore((state) => state.availabilityGridViewWindowSize);

  const timeSlotsCol = node.getTimeSlotsColumnIndex();
  const timeSlotsRow = node.getTimeSlotsRowIndex();
  const eventDate = sortedEventDates[timeSlotsCol];
  const eventTime = sortedEventTimes[timeSlotsRow];

  const prevEventDate = sortedEventDates[timeSlotsCol - 1];
  const nextEventDate = sortedEventDates[timeSlotsCol + 1];

  const hasDateGapLeft =
    node.displayedColIndex !== 1 && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
  const hasDateGapRight =
    !node.isNodeInLastActualCol && !isConsecutiveDay(parseISO(eventDate), parseISO(nextEventDate));

  function getBorderStyle() {
    if (isViewMode(mode)) return "solid";
    const rightStyle = hasDateGapRight ? "solid" : "dashed";
    const leftStyle = hasDateGapLeft ? "solid" : "dashed";
    const bottomStyle = "dashed";
    const topStyle = "dashed";
    return `${topStyle} ${rightStyle} ${bottomStyle} ${leftStyle}`;
  }

  switch (node.getRenderType()) {
    case NodeType.PLACEHOLDER:
      return <div className="h-full">&nbsp;</div>;
    case NodeType.ROW_HEADER:
      return <AvailabilityGridRowHeader eventTime={eventTime} />;
    case NodeType.COLUMN_HEADER:
      return <AvailabilityGridColumnHeader eventDate={eventDate} hasDateGapRight={hasDateGapRight} />;

    case NodeType.FIRST_CELL_IN_COLUMN:
      return (
        <div
          className={cn("border-b-0 border-l-2 border-t-0 border-primary-light", {
            "border-l-0": node.offsettedColIndex === 1,
            "border-l-2 border-l-primary": hasDateGapLeft,
            "border-r-2": node.isNodeInLastDisplayedCol && !node.isNodeInLastActualCol,
            "mr-2 border-r-2 border-r-primary": hasDateGapRight
          })}
          style={{
            borderStyle: getBorderStyle()
          }}
        />
      );
    case NodeType.LAST_CELL_IN_COLUMN:
      return (
        <div
          className={cn("border-b-0 border-l-2 border-t-2 border-primary-light", {
            "border-l-0": node.offsettedColIndex === 1,
            "border-l-2 border-l-primary": hasDateGapLeft,
            "border-r-2": node.isNodeInLastDisplayedCol && !node.isNodeInLastActualCol,
            "mr-2 border-r-2 border-r-primary": hasDateGapRight
          })}
          style={{
            borderStyle: getBorderStyle()
          }}
        />
      );
    case NodeType.TIME_SLOT:
      return (
        <AvailabilityGridTimeSlot
          animateEditAvailabilityButton={animateEditAvailabilityButton}
          displayedCol={node.displayedColIndex}
          eventDate={eventDate}
          eventTime={eventTime}
          hasDateGapLeft={hasDateGapLeft}
          hasDateGapRight={hasDateGapRight}
          isInLastActualCol={node.isNodeInLastActualCol}
          isInLastDisplayedCol={node.isNodeInLastDisplayedCol}
          timeSlotDragSelectionState={timeSlotDragSelectionState}
          timeSlotsCol={timeSlotsCol}
          timeSlotsRow={timeSlotsRow}
        />
      );
  }
}
