import EventDateCalendar, { MONTH_FORMAT } from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useEventResponsesFilters from "@/hooks/useEventResponsesFilters";
import useAvailabilityGridStore, { AvailabilityType } from "@/store/availabilityGridStore";
import { EventDate } from "@/types/Event";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import { useCallback, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";

const RESPONSES_TITLE = "Responses";

export default function AvailabilityGridLeftPanel() {
  const { availabilityType, eventId, eventName, sortedEventDates } = useAvailabilityGridStore(
    (state) => state.eventData
  );

  const [leftMostColumnInView, setLeftMostColumnInView] = useAvailabilityGridStore(
    useShallow((state) => [state.leftMostColumnInView, state.setLeftMostColumnInView])
  );
  const availabilityGridViewWindowSize = useAvailabilityGridStore((state) => state.availabilityGridViewWindowSize);

  const setFocusedDate = useAvailabilityGridStore((state) => state.setFocusedDate);

  const { toast } = useToast();

  const {
    allParticipantsWithCurrentUser,
    currentResponseCount,
    currentResponses,
    onFliterClicked,
    totalResponseCount
  } = useEventResponsesFilters();

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

  const MotionButton = motion(Button);

  return (
    <div className="card flex h-full cursor-pointer flex-col px-4 pb-4">
      <div className="mt relative flex justify-between text-ellipsis rounded-2xl border-2 border-primary px-3 py-2 text-sm font-medium text-secondary">
        {eventName}
        <MotionButton
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
          whileTap={{ scaleX: 0.97 }}
        >
          <Copy className="h-4 w-4" />
        </MotionButton>
      </div>

      <div className="ml-2 mt-2 flex items-center justify-between">
        <div className="flex font-medium">
          <p className="text-sm text-secondary">{RESPONSES_TITLE}</p>
          <p className="ml-4 text-sm text-secondary">
            {currentResponseCount}/{totalResponseCount}
          </p>
        </div>
      </div>

      <div
        className="m-3 box-border grid flex-1 gap-x-3 gap-y-1 overflow-y-scroll text-secondary scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary-light"
        style={{ gridAutoRows: "min-content", gridTemplateColumns: `repeat(auto-fill, minmax(5rem, 1fr))` }}
      >
        {allParticipantsWithCurrentUser.map((name) => (
          <AvailabilityGridResponseFilterButton
            currentResponses={currentResponses}
            key={`${name}-filter-button`}
            name={name}
            onFilterClicked={onFliterClicked}
          />
        ))}
      </div>
      <div className="h-[16rem]">
        {availabilityType === AvailabilityType.SPECIFIC_DATES && sortedEventDates.length !== 0 && (
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
        )}
      </div>
    </div>
  );
}
