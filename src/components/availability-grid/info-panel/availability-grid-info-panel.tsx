import EventDateCalendar from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useAvailabilityGridStore, {
  AvailabilityType,
  EventDate,
  isEditMode,
  TimeSlot
} from "@/store/availabilityGridStore";
import { parseISO } from "date-fns";
import { CheckCircle2, Copy } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import { VariableSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";

const RESPONSES_TITLE = "Responses";

type AvailabilityGridInfoPanelProps = {
  gridContainerRef: React.MutableRefObject<null | VariableSizeList>;
};

export default function AvailbilityGridInfoPanel({ gridContainerRef }: AvailabilityGridInfoPanelProps) {
  const eventName = useAvailabilityGridStore((state) => state.eventName);
  const eventDates = useAvailabilityGridStore(useShallow((state) => state.eventDates));
  const participantsToTimeSlots = useAvailabilityGridStore(useShallow((state) => state.eventUserAvailability));
  const userFilter = useAvailabilityGridStore(useShallow((state) => state.userFilter));
  const setUserFilter = useAvailabilityGridStore((state) => state.setUserFilter);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const availabilityType = useAvailabilityGridStore((state) => state.availabilityType);
  const user = useAvailabilityGridStore((state) => state.user);
  const visibleColumnRange = useAvailabilityGridStore((state) => state.visibleColumnRange);
  const setFocusedDate = useAvailabilityGridStore((state) => state.setFocusedDate);

  const { toast } = useToast();

  const SUCCESSFULLY_COPIED = "Copied link to clipboard.";

  const allParticipants = useMemo(() => {
    let users = Object.keys(participantsToTimeSlots);
    if (!users.includes(user) && isEditMode(mode)) {
      users = [...users, user];
    }
    users.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return users;
  }, [participantsToTimeSlots, user]);

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

  const eventDatesSet = useMemo(() => {
    return new Set<EventDate>(eventDates);
  }, [eventDates]);

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
      <div className="text-md relative flex justify-between text-ellipsis rounded-2xl border-2 border-primary px-3 py-2 font-medium text-secondary">
        {eventName}
        <Button
          className="absolute -end-1 -top-[1.5px] h-11 rounded-2xl hover:bg-primary-hover hover:opacity-100"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast({
              action: (
                <div className="-ml-4 flex w-full items-center">
                  <CheckCircle2 className="mr-2 h-6 w-6 text-green-800" />
                  <div className="text-sm">{SUCCESSFULLY_COPIED}</div>
                </div>
              ),
              //description: "Successfully saved availability.",
              variant: "success"
            });
          }}
          variant="default"
        >
          <Copy className="h-4 w-4" />
        </Button>
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
      {availabilityType === AvailabilityType.SPECIFIC_DATES && (
        <div className="mt-auto self-end">
          <EventDateCalendar
            earliestSelectedDate={sortedEventDates[0]}
            id="availability-grid-event-calendar"
            isViewMode={true}
            latestSelectedDate={sortedEventDates[sortedEventDates.length - 1]}
            onViewModeDateClick={onViewModeDateClick}
            selectedDates={eventDatesSet}
            visibleEventDates={sortedCalendarVisibleEventDates}
          />
        </div>
      )}
    </div>
  );
}
