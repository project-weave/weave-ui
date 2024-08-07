import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

type useEventResponsesFiltersReturn = {
  allUsersForEvent: string[];
  hoveredTimeSlotResponsesCount: number;
  hoveredTimeSlotResponses: string[];
  onFliterClicked: (user: string) => void;
  totalResponseCount: number;
};

export default function useEventResponsesFilters(): useEventResponsesFiltersReturn {
  const { allParticipants, timeSlotsToParticipants } = useAvailabilityGridStore((state) => state.eventData);
  const user = useAvailabilityGridStore((state) => state.user);
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);
  const [userFilter, setUserFilter] = useAvailabilityGridStore(
    useShallow((state) => [state.userFilter, state.setUserFilter])
  );
  const mode = useAvailabilityGridStore((state) => state.mode);

  const allUsersForEvent = useMemo(() => {
    if (allParticipants.includes(user) || user === "") return allParticipants;
    return [user, ...allParticipants];
  }, [allParticipants, user]);

  let hoveredTimeSlotResponses = [] as string[];
  if (hoveredTimeSlot === null) {
    hoveredTimeSlotResponses = allUsersForEvent;
  } else if (userFilter.length === 0) {
    hoveredTimeSlotResponses = timeSlotsToParticipants[hoveredTimeSlot] ?? [];
  } else {
    hoveredTimeSlotResponses = (timeSlotsToParticipants[hoveredTimeSlot] ?? []).filter((user) =>
      userFilter.includes(user)
    );
  }

  const totalResponseCount = userFilter.length === 0 ? allUsersForEvent.length : userFilter.length;
  const hoveredTimeSlotResponsesCount = isEditMode(mode)
    ? 1
    : Math.min(totalResponseCount, hoveredTimeSlotResponses.length);

  function onFliterClicked(user: string) {
    if (isEditMode(mode)) return;

    const newUserFilter = [...userFilter];
    if (newUserFilter.includes(user)) {
      newUserFilter.splice(userFilter.indexOf(user), 1);
    } else {
      newUserFilter.push(user);
    }
    setUserFilter(newUserFilter);
  }

  return {
    allUsersForEvent,
    hoveredTimeSlotResponsesCount,
    hoveredTimeSlotResponses,
    onFliterClicked: onFliterClicked,
    totalResponseCount
  };
}
