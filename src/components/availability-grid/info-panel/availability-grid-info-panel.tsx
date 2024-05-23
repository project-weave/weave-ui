import EventDateCalendar from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useAvailabilityGridStore, {
  AvailabilityType,
  EventDate,
  isEditMode,
  TimeSlot
} from "@/store/availabilityGridStore";
import { Copy } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import { VariableSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";

const RESPONSES_TITLE = "Responses";

type AvailabilityGridInfoPanelProps = {
  allParticipants: string[];
  availabilityType: AvailabilityType;
  eventDates: EventDate[];
  eventName: string;
  gridContainerRef: React.MutableRefObject<null | VariableSizeList>;
  sortedEventDates: EventDate[];
  timeSlotsToParticipants: Readonly<Record<TimeSlot, string[]>>;
};

export default function AvailbilityGridInfoPanel({
  allParticipants,
  availabilityType,
  eventDates,
  eventName,
  gridContainerRef,
  sortedEventDates,
  timeSlotsToParticipants
}: AvailabilityGridInfoPanelProps) {
  const userFilter = useAvailabilityGridStore(useShallow((state) => state.userFilter));
  const setUserFilter = useAvailabilityGridStore((state) => state.setUserFilter);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const user = useAvailabilityGridStore((state) => state.user);
  const visibleColumnRange = useAvailabilityGridStore((state) => state.visibleColumnRange);
  const setFocusedDate = useAvailabilityGridStore((state) => state.setFocusedDate);
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);

  const { toast } = useToast();

  const allParticipantsWithCurrentUser = useMemo(() => {
    if (allParticipants.includes(user) || user === "") return allParticipants;
    return [user, ...allParticipants];
  }, [allParticipants, user]);

  let filteredUsersSelectedHoveredTimeSlot = [] as string[];
  if (hoveredTimeSlot === null) {
    filteredUsersSelectedHoveredTimeSlot = allParticipantsWithCurrentUser;
  } else if (userFilter.length === 0) {
    filteredUsersSelectedHoveredTimeSlot = timeSlotsToParticipants[hoveredTimeSlot] ?? [];
  } else {
    filteredUsersSelectedHoveredTimeSlot = (timeSlotsToParticipants[hoveredTimeSlot] ?? []).filter((user) =>
      userFilter.includes(user)
    );
  }

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

  const totalResponseCount = userFilter.length === 0 ? allParticipantsWithCurrentUser.length : userFilter.length;
  const currentRepsonseCount = isEditMode(mode)
    ? 1
    : Math.min(totalResponseCount, filteredUsersSelectedHoveredTimeSlot.length);

  return (
    <div className="card flex h-full cursor-pointer flex-col px-4">
      <div className="relative flex justify-between text-ellipsis rounded-2xl border-2 border-primary px-3 py-2 text-sm font-medium text-secondary">
        {eventName}
        <Button
          className="absolute -end-1 -top-[1.5px] h-10 rounded-2xl hover:bg-primary-hover hover:opacity-100"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
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

      <div className="m-3 select-none">
        <div className="flex items-center justify-between">
          <div className="flex font-medium">
            <p className="text-sm text-secondary">{RESPONSES_TITLE}</p>
            <p className="ml-4 text-sm text-secondary">
              {currentRepsonseCount}/{totalResponseCount}
            </p>
          </div>
        </div>
        <div
          className="mt-2 grid gap-x-4 gap-y-1 text-secondary"
          style={{ gridAutoRows: "min-content", gridTemplateColumns: `repeat(auto-fill, minmax(5rem, 1fr))` }}
        >
          {allParticipantsWithCurrentUser.map((name) => (
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
