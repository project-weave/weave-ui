// eslint-disable-next-line prettier/prettier
import EditAvailabilityDialog from "../dialog/edit-availability-dialog";
import { format, parseISO } from "date-fns";
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

import AvailabilityParticipantFilters from "./availability-participant-filters";
import AvailabilityResponsesCount from "./availability-responses-count";

const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";

export default function AvailabilityGridLeftPanel() {
  const { availabilityType, sortedEventDates } = useAvailabilityGridStore((state) => state.eventData);

  const mode = useAvailabilityGridStore((state) => state.mode);
  const isSaving = useAvailabilityGridStore((state) => state.isSavingAvailability);

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

  const saveUserAvailabilityButton = (
    <Button
      className="over:bg-primary-purple/80 w-full text-sm font-normal"
      disabled={isSaving}
      form="availability-grid"
      type="submit"
      variant="default"
    >
      {isSaving ? "Saving…" : SAVE_AVAILABILITY_BUTTON_TEXT}
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
    <aside aria-label="Event participants" className="card flex h-full flex-col px-6 pb-6">
      <div className="mt-1 flex items-center justify-between">
        <AvailabilityResponsesCount />
      </div>

      <div className="mt-3">{isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}</div>

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
