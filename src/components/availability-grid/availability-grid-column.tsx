"use client";
import { CellBorderCheck } from "@/hooks/useGridDragSelect";
import {
  AvailabilityGridMode,
  AvailabilityType,
  EventDate,
  EventTime,
  getTimeSlot,
  isViewMode,
  TimeSlot
} from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { isConsecutiveDay } from "@/utils/date";
import { parseISO } from "date-fns";
import { CSSProperties } from "react";
import { VariableSizeList } from "react-window";

import AvailabilityGridCell from "./availability-grid-cell";
import AvailabilityGridColumnHeader from "./availability-grid-column-header";

// AvailabilityCellPosition contains a row and column index that represents the position of a single cell in the availability grid
export type AvailabilityCellPosition = {
  col: number;
  row: number;
};

type AvailbilityGridColumnProps = {
  allParticipants: string[];
  autoSizerStyle: CSSProperties;
  availabilityType: AvailabilityType;
  columnHeaderHeight: string;
  columnIndex: number;
  eventEndTime: EventTime;
  gridContainerRef: React.RefObject<VariableSizeList>;
  handleCellMouseDown: (row: number, col: number) => void;
  handleCellMouseEnter: (row: number, col: number) => void;
  handleCellMouseLeave: () => void;
  handleSaveUserAvailability: (user: string) => void;
  handleUserChange: (user: string) => void;
  isBestTimesEnabled: boolean;
  isCellBorderOfSelectionArea: (row: number, col: number) => CellBorderCheck;
  isCellInDragSelectionArea: (row: number, col: number) => boolean;
  isDragAdding: boolean;
  isDragSelecting: boolean;
  mode: AvailabilityGridMode;
  selectedTimeSlots: TimeSlot[];
  sortedEventDates: EventDate[];
  sortedEventTimes: EventTime[];
  timeSlotsToParticipants: Readonly<Record<TimeSlot, string[]>>;
  user: string;
  userFilter: string[];
};

export default function AvailabilityGridColumn({
  allParticipants,
  autoSizerStyle,
  availabilityType,
  columnHeaderHeight,
  columnIndex,
  handleCellMouseDown,
  handleCellMouseEnter,
  handleCellMouseLeave,
  isBestTimesEnabled,
  isCellBorderOfSelectionArea,
  isCellInDragSelectionArea,
  isDragAdding,
  isDragSelecting,
  mode,
  selectedTimeSlots,
  sortedEventDates,
  sortedEventTimes,
  timeSlotsToParticipants,
  user,
  userFilter
}: AvailbilityGridColumnProps) {
  // TODO: add timezone logic
  const gridCellCol = columnIndex - 1;
  const eventDate = sortedEventDates[gridCellCol];

  const lastCellCol = sortedEventDates.length - 1;

  const prevEventDate = sortedEventDates[gridCellCol - 1];
  const nextEventDate = sortedEventDates[gridCellCol + 1];

  const isDateGapLeft = gridCellCol !== 0 && !isConsecutiveDay(parseISO(prevEventDate), parseISO(eventDate));
  const isDateGapRight = gridCellCol !== lastCellCol && !isConsecutiveDay(parseISO(eventDate), parseISO(nextEventDate));

  function getBorderStyle() {
    if (isViewMode(mode)) return "solid";
    const rightStyle = isDateGapRight ? "solid" : "dashed";
    const leftStyle = isDateGapLeft ? "solid" : "dashed";
    const bottomStyle = "dashed";
    const topStyle = "dashed";
    return `${topStyle} ${rightStyle} ${bottomStyle} ${leftStyle}`;
  }

  return columnIndex === 0 || columnIndex === sortedEventDates.length + 1 ? (
    <div className="grid w-full" />
  ) : (
    <div
      className="grid w-full"
      key={`availability-column-${gridCellCol}`}
      style={{
        gridTemplateRows: `${columnHeaderHeight} 0.7rem repeat(${sortedEventTimes.length}, minmax(0.8rem, 1fr)) 0.7rem`,
        ...autoSizerStyle
      }}
    >
      <AvailabilityGridColumnHeader
        availabilityType={availabilityType}
        eventDate={eventDate}
        hasUserAddedAvailability={allParticipants.includes(user)}
        isDateGapRight={isDateGapRight}
        key={`availability-grid-column-header-${gridCellCol}`}
        sortedEventTimes={sortedEventTimes}
      />
      {/* top row cell for styling */}
      <div
        className={cn("border-b-0 border-l-2 border-t-0 border-primary-light", {
          "border-l-0": gridCellCol === 0,
          "border-l-2 border-l-primary": isDateGapLeft,
          "mr-2 border-r-2 border-r-primary": isDateGapRight
        })}
        style={{
          borderStyle: getBorderStyle()
        }}
      />
      {sortedEventTimes.map((eventTime, gridRow) => {
        const timeSlot = getTimeSlot(eventTime, eventDate);
        const participantsSelectedTimeSlot = timeSlotsToParticipants[timeSlot] ?? [];
        const filteredParticipants = userFilter.length === 0 ? allParticipants : userFilter;

        const filteredParticipantCountForTimeSlot = filteredParticipants.filter((participant) =>
          participantsSelectedTimeSlot.includes(participant)
        ).length;

        const filteredMaxParticipantsForAllTimeSlots = Object.values(timeSlotsToParticipants).reduce(
          (maxCount, paricipants) => {
            const filteredCount = filteredParticipants.filter((participant) =>
              paricipants.includes(participant)
            ).length;
            return Math.max(maxCount, filteredCount);
          },
          0
        );

        return (
          <AvailabilityGridCell
            eventDate={eventDate}
            eventTime={eventTime}
            gridCol={gridCellCol}
            gridRow={gridRow}
            handleCellMouseDown={handleCellMouseDown}
            handleCellMouseEnter={handleCellMouseEnter}
            handleCellMouseLeave={handleCellMouseLeave}
            isBestTimesEnabled={isBestTimesEnabled}
            isCellBorderOfDragSelectionArea={isCellBorderOfSelectionArea}
            isCellInDragSelectionArea={isCellInDragSelectionArea}
            isDateGapLeft={isDateGapLeft}
            isDateGapRight={isDateGapRight}
            isDragAdding={isDragAdding}
            isDragSelecting={isDragSelecting}
            isSelected={selectedTimeSlots.includes(timeSlot)}
            key={`availability-grid-cell-${gridCellCol}-${gridRow}`}
            maxParticipantsCountForAllTimeSlots={filteredMaxParticipantsForAllTimeSlots}
            mode={mode}
            participantsSelectedCount={filteredParticipantCountForTimeSlot}
            totalParticipants={filteredParticipants.length}
          />
        );
      })}
      {/* bottom row cell for styling */}
      <div
        className={cn("border-b-0 border-l-2 border-t-2 border-primary-light", {
          "border-l-0": gridCellCol === 0,
          "border-l-2 border-l-primary": isDateGapLeft,
          "mr-2 border-r-2 border-r-primary": isDateGapRight
        })}
        style={{
          borderStyle: getBorderStyle()
        }}
      />
    </div>
  );
}
