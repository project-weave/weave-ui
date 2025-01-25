import { addMinutes, differenceInCalendarDays, format, parse, parseISO } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { ReactNode } from "react";

import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { TIME_SLOT_INTERVAL_MINUTES } from "@/store/eventDataSlice";
import { EVENT_TIME_FORMAT, getTimeFromTimeSlot, getTimeSlot } from "@/types/Timeslot";
import { cn } from "@/utils/cn";
import { isSupportedTimeZone } from "@/utils/timeZone";

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
  const selectedTimeZone = useAvailabilityGridStore((state) =>
    isSupportedTimeZone(state.selectedTimeZone) ? state.selectedTimeZone : state.eventData.timeZone
  );
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const isHoveredTimeSlot = eventTime === getTimeFromTimeSlot(hoveredTimeSlot);

  const originalDateTime = parseISO(getTimeSlot(eventTime, firstEventDate));

  const isPrevTimeSlotHovered =
    hoveredTimeSlot &&
    eventTime === format(addMinutes(parseISO(hoveredTimeSlot), TIME_SLOT_INTERVAL_MINUTES), EVENT_TIME_FORMAT);

  const isNextDayMidnight = isLastEventTime && eventTime === "00:00:00";

  function getTimezoneConveredTimeAndDayDifference(): [string, number] {
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

    return [format(targetZoneDateTime, "h:mm a"), dayDifference];
  }

  function getTranslatedTimeJSX(): ReactNode {
    const [convertedFormattedTime, dayDifference] = getTimezoneConveredTimeAndDayDifference();
    let dayOffsetJSX: ReactNode = null;
    if (dayDifference > 0) {
      dayOffsetJSX = <sup className="text-3xs ml-[0.5px]">+1</sup>;
    } else if (dayDifference < 0) {
      dayOffsetJSX = <sup className="text-3xs ml-[0.5px]">-1</sup>;
    }

    return (
      <>
        {convertedFormattedTime}
        {dayOffsetJSX}
      </>
    );
  }

  return (
    <span
      className={cn(
        "-translate-y-1.5 pr-2 text-right text-2xs font-medium text-primary duration-300 sm:-translate-y-2 sm:text-[0.75rem] xl:text-xs",
        { "opacity-0": originalDateTime.getMinutes() !== 0 },
        {
          "font-bold opacity-100": isHoveredTimeSlot || isPrevTimeSlotHovered,
          "text-secondary": isViewMode(mode) && (isHoveredTimeSlot || isPrevTimeSlotHovered)
        }
      )}
      onMouseEnter={onMouseEnter}
    >
      {getTranslatedTimeJSX()}
    </span>
  );
}
