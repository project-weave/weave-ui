import EventDateCalendar from "@/components/event-date-calendar";
import useAvailabilityGridStore, { EventDate, isEditMode, TimeSlot } from "@/store/availabilityGridStore";
import { parseISO } from "date-fns";
import { Link2 } from "lucide-react";
import { useMemo } from "react";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";

const RESPONSES_TITLE = "Responses";

type AvailabilityGridInfoPanelProps = {
  eventDatesToColumnRefs: Readonly<Record<EventDate, HTMLDivElement | null>>;
  sortedVisibleEventDates: EventDate[];
};

export default function AvailbilityGridInfoPanel({
  eventDatesToColumnRefs,
  sortedVisibleEventDates
}: AvailabilityGridInfoPanelProps) {
  const eventName = useAvailabilityGridStore((state) => state.eventData.eventName);
  const eventDates = useAvailabilityGridStore((state) => state.eventData.eventDates);
  const participantsToTimeSlots = useAvailabilityGridStore((state) => state.eventData.userAvailability);
  const userFilter = useAvailabilityGridStore((state) => state.userFilter);
  const setUserFilter = useAvailabilityGridStore((state) => state.setUserFilter);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const user = useAvailabilityGridStore((state) => state.user);
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);

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

  const sortedEventDates = useMemo(
    () =>
      eventDates.sort((date1, date2) => {
        return parseISO(date1).getTime() - parseISO(date2).getTime();
      }),
    [eventDates]
  );

  function onNotVisibleSelectedDateClick(date: EventDate) {
    const columnRef = eventDatesToColumnRefs[date];
    columnRef?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  // scroll aligns date with left side of grid
  // if date is first, or if last column is in view the date is currently in view, the dates are not clickable
  function isDateClickable(date: EventDate) {
    if (sortedVisibleEventDates[0] === date) return false;

    const lastEventDate = sortedEventDates[sortedEventDates.length - 1];
    const lastEventDateInView = sortedVisibleEventDates.includes(lastEventDate);
    return !(lastEventDateInView && sortedVisibleEventDates.includes(date));
  }

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
          isDateClickable={isDateClickable}
          isViewMode={true}
          latestSelectedDate={sortedEventDates[sortedEventDates.length - 1]}
          onNotVisibleSelectedDateClick={onNotVisibleSelectedDateClick}
          selected={new Set(eventDates)}
          sortedVisibleSelectedDates={sortedVisibleEventDates}
        />
      </div>
    </div>
  );
}
