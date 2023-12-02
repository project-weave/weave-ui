import EventDateCalendar from "@/components/event-date-calendar";
import useAvailabilityGridStore, { EventDate, isEditMode, TimeSlot } from "@/store/availabilityGridStore";
import { parseISO } from "date-fns";
import { Link2 } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import { VariableSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";

const RESPONSES_TITLE = "Responses";

type AvailabilityGridInfoPanelProps = {
  gridContainerRef: React.MutableRefObject<null | VariableSizeList>;
};

export default function AvailbilityGridInfoPanel({ gridContainerRef }: AvailabilityGridInfoPanelProps) {
  const eventName = useAvailabilityGridStore((state) => state.eventData.eventName);
  const eventDates = useAvailabilityGridStore(useShallow((state) => state.eventData.eventDates));
  const participantsToTimeSlots = useAvailabilityGridStore(useShallow((state) => state.eventData.userAvailability));
  const userFilter = useAvailabilityGridStore(useShallow((state) => state.userFilter));
  const setUserFilter = useAvailabilityGridStore((state) => state.setUserFilter);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const user = useAvailabilityGridStore((state) => state.user);
  const visibleColumnRange = useAvailabilityGridStore((state) => state.visibleColumnRange);
  const setFocusedDate = useAvailabilityGridStore((state) => state.setFocusedDate);

  const allParticipants = Object.keys(participantsToTimeSlots);

  const timeSlotsToParticipants = useMemo<Readonly<Record<TimeSlot, string[]>>>(() => {
    const record: Record<TimeSlot, string[]> = {};
    Object.entries(participantsToTimeSlots).forEach(([participant, timeSlots]) => {
      timeSlots.forEach((timeSlot) => {
        if (record[timeSlot] === undefined) {
          record[timeSlot] = [];
        }
        record[timeSlot].push(participant);
      });
    });
    return record;
  }, [participantsToTimeSlots]);

  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);

  let filteredUsersSelectedHoveredTimeSlot = [] as string[];
  if (hoveredTimeSlot === null) {
    filteredUsersSelectedHoveredTimeSlot = allParticipants;
  } else if (userFilter.length === 0) {
    filteredUsersSelectedHoveredTimeSlot = timeSlotsToParticipants[hoveredTimeSlot] ?? [];
  } else {
    filteredUsersSelectedHoveredTimeSlot = (timeSlotsToParticipants[hoveredTimeSlot] ?? []).filter((user) =>
      userFilter.includes(user)
    );
  }

  const sortedEventDates = useMemo(
    () =>
      eventDates.sort((date1, date2) => {
        return parseISO(date1).getTime() - parseISO(date2).getTime();
      }),
    [eventDates]
  );
  const sortedCalendarVisibleEventDates = useMemo(() => {
    const startIndex = visibleColumnRange.start === 0 ? 0 : visibleColumnRange.start - 1;
    return sortedEventDates.slice(startIndex, visibleColumnRange.end);
  }, [visibleColumnRange.start, visibleColumnRange.end, sortedEventDates]);

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const onViewModeDateClick = useCallback(
    (date: EventDate) => {
      function scrollToDate() {
        const indexOfDate = sortedEventDates.indexOf(date);
        if (indexOfDate === -1 || gridContainerRef.current === null) return;

        let columnNum = indexOfDate + 1;
        if (indexOfDate === 0) {
          columnNum = 0;
        }
        gridContainerRef.current.scrollToItem(columnNum, "start");
      }

      function setFocusedDateTimeout() {
        if (timeoutIdRef.current !== null) {
          clearTimeout(timeoutIdRef.current);
        }
        timeoutIdRef.current = setTimeout(() => {
          setFocusedDate(null);
        }, 5000);
        setFocusedDate(date);
      }

      scrollToDate();
      setFocusedDateTimeout();
    },
    [gridContainerRef, setFocusedDate, sortedEventDates]
  );

  function filterUserHandler(user: string) {
    if (isEditMode(mode)) return;

    const newUserFilter = [...userFilter];
    if (newUserFilter.includes(user)) {
      newUserFilter.splice(userFilter.indexOf(user), 1);
    } else {
      newUserFilter.push(user);
    }
    setUserFilter(newUserFilter);
  }

  const totalResponseCount = userFilter.length === 0 ? allParticipants.length : userFilter.length;
  const currentRepsonseCount = isEditMode(mode)
    ? 1
    : Math.min(totalResponseCount, filteredUsersSelectedHoveredTimeSlot.length);

  return (
    <div className="card flex h-full cursor-pointer flex-col px-4">
      <div className="flex justify-between text-ellipsis rounded-2xl border-2 border-primary px-3 py-2 font-medium text-secondary">
        {eventName}
        <Link2 />
      </div>

      <div className="m-3 select-none">
        <div className="flex items-center justify-between">
          <div className="flex font-medium">
            <p className="text-secondary">{RESPONSES_TITLE}</p>
            <p className="ml-4 text-secondary">
              {currentRepsonseCount}/{totalResponseCount}
            </p>
          </div>
        </div>
        <div
          className="mt-2 grid gap-x-4 gap-y-1 text-secondary"
          style={{ gridAutoRows: "min-content", gridTemplateColumns: `repeat(auto-fill, minmax(5rem, 1fr))` }}
        >
          {allParticipants.map((name) => (
            <AvailabilityGridResponseFilterButton
              filteredUsersSelectedHoveredTimeSlot={filteredUsersSelectedHoveredTimeSlot}
              filterUserHandler={filterUserHandler}
              key={`${name}-filter-button`}
              mode={mode}
              name={name}
              user={user}
              userFilter={userFilter}
            />
          ))}
        </div>
      </div>
      <div className="mt-auto self-end">
        <EventDateCalendar
          earliestSelectedDate={sortedEventDates[0]}
          id="availability-grid-event-calendar"
          isViewMode={true}
          latestSelectedDate={sortedEventDates[sortedEventDates.length - 1]}
          onViewModeDateClick={onViewModeDateClick}
          selected={sortedEventDates}
          visibleEventDates={sortedCalendarVisibleEventDates}
        />
      </div>
    </div>
  );
}
