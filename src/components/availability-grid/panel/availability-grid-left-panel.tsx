import { format, parseISO } from "date-fns";
import { Copy } from "lucide-react";
import { useCallback, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import EventDateCalendar from "@/components/dynamic-event-date-calendar";
import { MONTH_FORMAT } from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { EventDate } from "@/types/Timeslot";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";
import AvailabilityResponsesCount from "./availability-responses-count";

export default function AvailabilityGridLeftPanel() {
  const { availabilityType, eventId, eventName, sortedEventDates } = useAvailabilityGridStore(
    (state) => state.eventData
  );
  const getEventParticipants = useAvailabilityGridStore((state) => state.getEventParticipants);
  const eventParticipants = getEventParticipants();

  const [leftMostColumnInView, setLeftMostColumnInView] = useAvailabilityGridStore(
    useShallow((state) => [state.leftMostColumnInView, state.setLeftMostColumnInView])
  );
  const availabilityGridViewWindowSize = useAvailabilityGridStore((state) => state.availabilityGridViewWindowSize);
  const setFocusedDate = useAvailabilityGridStore((state) => state.setFocusedDate);

  const { toast } = useToast();

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
    <div className="card flex h-full cursor-pointer flex-col px-4 pb-4">
      <div className="relative flex justify-between rounded-2xl border-2 border-primary px-3 py-2 text-sm font-medium text-secondary">
        <p className="max-w-[80%] overflow-hidden text-ellipsis">{eventName}</p>
        <Button
          className="absolute -end-1 -top-[1.5px] h-10 rounded-2xl hover:bg-primary-hover"
          onClick={() => {
            const url = `${window.location.origin}/${eventId}`;
            navigator.clipboard.writeText(url);
            toast({
              description: "Copied link to clipboard.",
              variant: "success"
            });
          }}
          variant="default"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-2 mt-2 flex items-center justify-between">
        <AvailabilityResponsesCount />
      </div>

      <div
        className="scrollbar-primary m-3 box-border grid flex-1 gap-x-0.5 gap-y-1 overflow-y-scroll text-secondary"
        style={{ gridAutoRows: "min-content", gridTemplateColumns: `repeat(2, minmax(5rem, 1fr))` }}
      >
        {eventParticipants.map((name, i) => (
          <AvailabilityGridResponseFilterButton key={`${name}-${i}-filter-button`} name={name} />
        ))}
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
    </div>
  );
}
