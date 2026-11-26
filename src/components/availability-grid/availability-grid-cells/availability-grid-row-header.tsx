import { addMinutes, differenceInCalendarDays, format, parse, parseISO } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import useAvailabilityGridStore, { getDisplayTimeZones } from "@/store/availabilityGridStore";
import { TIME_SLOT_INTERVAL_MINUTES } from "@/store/eventDataSlice";
import { EVENT_TIME_FORMAT, getTimeFromTimeSlot, getTimeSlot } from "@/types/Timeslot";
import { cn } from "@/utils/cn";

type AvailabilityGridRowHeaderProps = {
  eventTime: string;
  isLastEventTime: boolean;
  onMouseEnter: () => void;
};

export default function AvailabilityGridRowHeader({
  eventTime,
  isLastEventTime,
  onMouseEnter
}: AvailabilityGridRowHeaderProps) {
  const firstEventDate = useAvailabilityGridStore((state) => state.eventData.sortedEventDates[0] ?? "");
  const eventTimeZone = useAvailabilityGridStore((state) => state.eventData.timeZone);
  // left to right; the last one (next to the grid) is the primary
  const displayTimeZones = useAvailabilityGridStore(useShallow(getDisplayTimeZones));
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);
  const isHoveredTimeSlot = eventTime === getTimeFromTimeSlot(hoveredTimeSlot);

  const originalDateTime = parseISO(getTimeSlot(eventTime, firstEventDate));

  const isPrevTimeSlotHovered =
    hoveredTimeSlot &&
    eventTime === format(addMinutes(parseISO(hoveredTimeSlot), TIME_SLOT_INTERVAL_MINUTES), EVENT_TIME_FORMAT);

  const isNextDayMidnight = isLastEventTime && eventTime === "00:00:00";

  function getTimezoneConveredTimeAndDayDifference(selectedTimeZone: string): [string, number] {
    const originalDateTimeInUTC = zonedTimeToUtc(originalDateTime, eventTimeZone);

    const originalZonedDateTime = utcToZonedTime(originalDateTimeInUTC, eventTimeZone);
    const targetZoneDateTime = utcToZonedTime(originalDateTimeInUTC, selectedTimeZone);

    const DATE_FORMAT = "dd-MM-yyyy";
    const now = new Date();

    const originalFormattedDate = format(originalZonedDateTime, DATE_FORMAT);
    const targetFormattedDate = format(targetZoneDateTime, DATE_FORMAT);

    const originalParsedDate = parse(originalFormattedDate, DATE_FORMAT, now);
    const targetParsedDate = parse(targetFormattedDate, DATE_FORMAT, now);

    let dayDifference = isNextDayMidnight ? 1 : 0;
    dayDifference += differenceInCalendarDays(targetParsedDate, originalParsedDate);

    // "9 AM", or "9:30 AM" for zones that are offset by half an hour
    const timeFormat = targetZoneDateTime.getMinutes() === 0 ? "h a" : "h:mm a";
    return [format(targetZoneDateTime, timeFormat), dayDifference];
  }

  function getTranslatedTimeJSX(timeZone: string): ReactNode {
    const [convertedFormattedTime, dayDifference] = getTimezoneConveredTimeAndDayDifference(timeZone);
    let dayOffsetJSX: ReactNode = null;
    if (dayDifference > 0) {
      dayOffsetJSX = <sup className="ml-[0.5px] text-3xs">+1</sup>;
    } else if (dayDifference < 0) {
      dayOffsetJSX = <sup className="ml-[0.5px] text-3xs">-1</sup>;
    }

    return (
      <>
        {convertedFormattedTime}
        {dayOffsetJSX}
      </>
    );
  }

  const isHighlighted = isHoveredTimeSlot || isPrevTimeSlotHovered;

  return (
    <div
      className={cn(
        "flex -translate-y-1.5 justify-end whitespace-nowrap text-2xs font-normal duration-300 sm:-translate-y-2",
        { "opacity-0": originalDateTime.getMinutes() !== 0 },
        { "font-semibold opacity-100": isHighlighted }
      )}
      onMouseEnter={onMouseEnter}
    >
      {displayTimeZones.map((timeZone, index) => {
        const isPrimary = index === displayTimeZones.length - 1;
        return (
          <span
            className={cn(
              "w-[var(--time-zone-column-width)] shrink-0 pr-1.5 text-right",
              isPrimary ? "text-dark-gray" : "text-dark-gray/70",
              { "text-black": isHighlighted }
            )}
            key={timeZone}
          >
            {getTranslatedTimeJSX(timeZone)}
          </span>
        );
      })}
    </div>
  );
}
