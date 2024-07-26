import EventDateCalendar from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useAvailabilityGridStore, { AvailabilityType, isEditMode } from "@/store/availabilityGridStore";
import { EventDate } from "@/types/Event";
import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";

const RESPONSES_TITLE = "Responses";

export default function AvailbilityGridInfoPanel() {
  const { allParticipants, availabilityType, eventName, sortedEventDates, timeSlotsToParticipants } =
    useAvailabilityGridStore((state) => state.eventData);
  const userFilter = useAvailabilityGridStore(useShallow((state) => state.userFilter));
  const setUserFilter = useAvailabilityGridStore((state) => state.setUserFilter);

  const mode = useAvailabilityGridStore((state) => state.mode);
  const user = useAvailabilityGridStore((state) => state.user);

  const [leftMostColumnInView, setLeftMostColumnInView] = useAvailabilityGridStore(
    useShallow((state) => [state.leftMostColumnInView, state.setLeftMostColumnInView])
  );
  const availabilityGridViewWindowSize = useAvailabilityGridStore((state) => state.availabilityGridViewWindowSize);

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

  const visisbleEventDates = sortedEventDates.slice(
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
        }, 5000);
        setFocusedDate(date);
      }

      scrollToDate();
      setFocusedDateTimeout();
    },
    [setFocusedDate, sortedEventDates]
  );

  const eventDatesSet = useMemo(() => {
    return new Set<EventDate>(sortedEventDates);
  }, [sortedEventDates]);

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

  const MotionButton = motion(Button);

  return (
    <div className="card flex h-full cursor-pointer flex-col px-4">
      <div className="relative flex justify-between text-ellipsis rounded-2xl border-2 border-primary px-3 py-2 text-sm font-medium text-secondary">
        {eventName}
        <MotionButton
          className="absolute -end-1 -top-[1.5px] h-10 rounded-2xl hover:bg-primary-hover"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
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
            visibleEventDates={visisbleEventDates}
          />
        </div>
      )}
    </div>
  );
}
