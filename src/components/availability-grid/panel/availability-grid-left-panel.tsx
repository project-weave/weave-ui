import { format, parseISO } from "date-fns";
// eslint-disable-next-line prettier/prettier
import { useCallback, useRef } from "react";
// eslint-disable-next-line prettier/prettier
import { useShallow } from "zustand/react/shallow";

import { MONTH_FORMAT } from "@/components/event-date-calendar";
import EventDateCalendar from "@/components/no-ssr-event-date-calendar";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { EventDate } from "@/types/Timeslot";
import { formatEventDateRange } from "@/utils/date";

import AvailabilityParticipantFilters from "./availability-participant-filters";
import AvailabilityResponsesCount from "./availability-responses-count";

export default function AvailabilityGridLeftPanel() {
  const { availabilityType, eventName, sortedEventDates } = useAvailabilityGridStore((state) => state.eventData);

  const [leftMostColumnInView, setLeftMostColumnInView] = useAvailabilityGridStore(
    useShallow((state) => [state.leftMostColumnInView, state.setLeftMostColumnInView])
  );
  const availabilityGridViewWindowSize = useAvailabilityGridStore((state) => state.availabilityGridViewWindowSize);
  const setFocusedDate = useAvailabilityGridStore((state) => state.setFocusedDate);

  const visibleEventDates = sortedEventDates.slice(
    leftMostColumnInView,
    leftMostColumnInView + availabilityGridViewWindowSize
  );

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const onViewModeDateClick = useCallback(
    (date: EventDate) => {
      function scrollToDate() {
        const indexOfDate = sortedEventDates.indexOf(date);
        if (indexOfDate === -1) return;

        setLeftMostColumnInView(indexOfDate);
      }

      function setFocusedDateTimeout() {
        if (timeoutIdRef.current !== null) {
          clearTimeout(timeoutIdRef.current);
        }
        timeoutIdRef.current = setTimeout(() => {
          setFocusedDate(null);
        }, 1500);
        setFocusedDate(date);
      }

      scrollToDate();
      setFocusedDateTimeout();
    },
    [setFocusedDate, sortedEventDates, setLeftMostColumnInView]
  );

  const eventCalendarMonthOverride = format(parseISO(sortedEventDates[leftMostColumnInView]), MONTH_FORMAT);

  return (
    <aside aria-label="Event details" className="card flex h-full flex-col px-6 pb-6">
      <h1 className="break-words text-xl font-medium [overflow-wrap:anywhere]">{eventName}</h1>
      <p className="mt-1 text-sm text-text-light">
        {formatEventDateRange(sortedEventDates, availabilityType === AvailabilityType.SPECIFIC_DATES)}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <AvailabilityResponsesCount />
      </div>

      <div className="scrollbar-primary mt-5 min-h-0 flex-1 overflow-y-auto pb-4">
        <AvailabilityParticipantFilters />
      </div>
      {availabilityType === AvailabilityType.SPECIFIC_DATES && sortedEventDates.length !== 0 && (
        <div className="min-h-[16rem]">
          <EventDateCalendar
            currentMonthOverride={eventCalendarMonthOverride}
            earliestSelectedDate={sortedEventDates[0]}
            id="availability-grid-event-calendar"
            isViewMode={true}
            latestSelectedDate={sortedEventDates[sortedEventDates.length - 1]}
            onViewModeDateClick={onViewModeDateClick}
            selectedDates={new Set(sortedEventDates)}
            visibleEventDates={visibleEventDates}
          />
        </div>
      )}
    </aside>
  );
}
