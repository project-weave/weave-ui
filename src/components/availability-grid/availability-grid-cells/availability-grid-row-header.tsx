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
  onMouseEnter: () => void;
  isLastEventTime: boolean;
};

export default function AvailabilityGridRowHeader({
  eventTime,
  onMouseEnter,
  isLastEventTime
}: AvailabilityGridRowHeaderProps) {
  const eventTimeZone = useAvailabilityGridStore((state) => state.eventData.timeZone);
  const selectedTimeZone = useAvailabilityGridStore((state) =>
    isSupportedTimeZone(state.selectedTimeZone) ? state.selectedTimeZone : state.eventData.timeZone
  );
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const isHoveredTimeSlot = eventTime === getTimeFromTimeSlot(hoveredTimeSlot);

  // parsing time with arbitrary date as we're only interested in the time
  const parsedDateTime = parseISO(getTimeSlot(eventTime));

  const isPrevTimeSlotHovered =
    hoveredTimeSlot &&
    eventTime === format(addMinutes(parseISO(hoveredTimeSlot), TIME_SLOT_INTERVAL_MINUTES), EVENT_TIME_FORMAT);

  function getMinutesOffset(originalTZ: string, targetTZ: string): number {
    const now = new Date();
    const originalTime = zonedTimeToUtc(now, originalTZ);
    const targetTime = zonedTimeToUtc(now, targetTZ);

    return (originalTime.getTime() - targetTime.getTime()) / (1000 * 60);
  }

  function getDayDifferenceWithTimeZoneConversion(): number {
    const isNextDayMidnight = isLastEventTime && eventTime === "00:00:00";

    const formattedEventTime = format(parsedDateTime, "h:mm a");
    let originalDateTime = parse(formattedEventTime, "h:mm a", new Date());

    let originalDateWithMinuteOffset = new Date();
    const minutesOffset = getMinutesOffset(eventTimeZone, selectedTimeZone);
    originalDateWithMinuteOffset = addMinutes(originalDateTime, minutesOffset);

    let dayDifference = isNextDayMidnight ? 1 : 0;
    return (dayDifference += differenceInCalendarDays(originalDateWithMinuteOffset, originalDateTime));
  }

  function getTimeZoneConvertedTime(): string {
    const utcDateTime = zonedTimeToUtc(parsedDateTime, eventTimeZone);
    const targetDateTime = utcToZonedTime(utcDateTime, selectedTimeZone);
    return format(targetDateTime, "h:mm a");
  }

  function getTranslatedTimeJSX(): ReactNode {
    const dayDifference = getDayDifferenceWithTimeZoneConversion();
    let dayOffset: ReactNode = null;
    if (dayDifference > 0) {
      dayOffset = <sup className="text-3xs ml-[0.5px]">+1</sup>;
    } else if (dayDifference < 0) {
      dayOffset = <sup className="text-3xs ml-[0.5px]">-1</sup>;
    }

    return (
      <>
        {getTimeZoneConvertedTime()}
        {dayOffset}
      </>
    );
  }

  return (
    <span
      className={cn(
        "-translate-y-1.5 pr-2 text-right text-2xs font-medium text-primary duration-300 sm:-translate-y-2 sm:text-[0.75rem] xl:text-xs",
        { "opacity-0": parsedDateTime.getMinutes() !== 0 },
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
