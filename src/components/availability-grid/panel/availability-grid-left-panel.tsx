// eslint-disable-next-line prettier/prettier
import { format, isEqual, parseISO } from "date-fns";
import EditAvailabilityDialog from "../dialog/edit-availability-dialog";
// eslint-disable-next-line prettier/prettier
import { useCallback, useRef } from "react";
// eslint-disable-next-line prettier/prettier
import { useShallow } from "zustand/react/shallow";

import { MONTH_FORMAT } from "@/components/event-date-calendar";
import EventDateCalendar from "@/components/no-ssr-event-date-calendar";
import { Button } from "@/components/ui/button";
import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { EventDate } from "@/types/Timeslot";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";
import AvailabilityResponsesCount from "./availability-responses-count";

const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";
const EDITING_TEXT = "Editing availability";
const VIEWING_TEXT = "Viewing availability";

export default function AvailabilityGridLeftPanel() {
  const { availabilityType, eventName, sortedEventDates } = useAvailabilityGridStore((state) => state.eventData);
  const getEventParticipants = useAvailabilityGridStore((state) => state.getEventParticipants);
  const eventParticipants = getEventParticipants();

  const mode = useAvailabilityGridStore((state) => state.mode);

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

  const earliestDate = parseISO(sortedEventDates[0]);
  const latestDate = parseISO(sortedEventDates[sortedEventDates.length - 1]);

  let heading = "";
  if (isEqual(earliestDate, latestDate)) {
    heading = `${format(earliestDate, "MMM d yyyy")}`;
  } else if (earliestDate.getUTCFullYear() !== latestDate.getUTCFullYear()) {
    heading = `${format(earliestDate, "MMM d yyyy")} - ${format(latestDate, "MMM d yyyy")}`;
  } else {
    heading = `${format(earliestDate, "MMM d")} - ${format(latestDate, "MMM d yyyy")}`;
  }

  const saveUserAvailabilityButton = (
    <Button
      className="over:bg-primary-purple/80 w-full text-sm font-normal"
      form="availability-grid"
      type="submit"
      variant="default"
    >
      {SAVE_AVAILABILITY_BUTTON_TEXT}
    </Button>
  );

  const editUserAvailabilityButton = (
    <EditAvailabilityDialog
      // editAvailabilityButtonAnimationScope={editAvailabilityButtonAnimationScope}
      trigger={
        <Button className="over:bg-primary-purple/80 w-full rounded-md text-sm font-normal">Add availability</Button>
      }
    />
  );

  const eventCalendarMonthOverride = format(parseISO(sortedEventDates[leftMostColumnInView]), MONTH_FORMAT);

  return (
    <div className="card flex h-full cursor-pointer flex-col px-6 pb-6">
      <div className="pb-2 pt-1">
        <h1 className="text-xl font-normal text-black">{eventName}</h1>
        <p className="text-xs text-text-light">{heading}</p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <AvailabilityResponsesCount />
      </div>

      <div className="mt-3">{isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}</div>

      <div
        className="scrollbar-primary mt-5 box-border grid flex-1 gap-x-0.5 gap-y-1 overflow-y-scroll text-secondary"
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
