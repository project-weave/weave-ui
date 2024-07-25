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
  node,
  timeSlotDragSelectionState,
  animateEditAvailabilityButton
}: AvailabilityGridCellProps) {
  const { sortedEventDates, sortedEventTimes } = useAvailabilityGridStore((state) => state.eventData);
  const mode = useAvailabilityGridStore((state) => state.mode);

  const timeSlotsCol = node.getTimeSlotsColumnIndex();
  const timeSlotsRow = node.getTimeSlotsRowIndex();
  const eventDate = sortedEventDates[timeSlotsCol];
  const eventTime = sortedEventTimes[timeSlotsRow];

  const prevEventDate = sortedEventDates[timeSlotsCol - 1];
  const nextEventDate = sortedEventDates[timeSlotsCol + 1];

  const isDateGapLeft = node.displayedColIndex !== 1 && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
  const isDateGapRight = !node.isLastNodeInRow && !isConsecutiveDay(parseISO(eventDate), parseISO(nextEventDate));

  function getBorderStyle() {
    if (isViewMode(mode)) return "solid";
    const rightStyle = isDateGapRight ? "solid" : "dashed";
    const leftStyle = isDateGapLeft ? "solid" : "dashed";
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
      return <AvailabilityGridColumnHeader eventDate={eventDate} isDateGapRight={isDateGapRight} />;

    case NodeType.FIRST_CELL_IN_COLUMN:
      return (
        <div
          className={cn("border-b-0 border-l-2 border-t-0 border-primary-light", {
            "border-l-0": node.displayedColIndex === 1,
            "border-l-2 border-l-primary": isDateGapLeft,
            "mr-2 border-r-2 border-r-primary": isDateGapRight
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
            "border-l-0": node.displayedColIndex === 1,
            "border-l-2 border-l-primary": isDateGapLeft,
            "mr-2 border-r-2 border-r-primary": isDateGapRight
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
          eventDate={eventDate}
          eventTime={eventTime}
          isDateGapLeft={isDateGapLeft}
          isDateGapRight={isDateGapRight}
          timeSlotDragSelectionState={timeSlotDragSelectionState}
          timeSlotsCol={timeSlotsCol}
          timeSlotsRow={timeSlotsRow}
        />
      );
  }
}
