import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

type EventResponsesFiltersReturn = {
  allParticipantsWithCurrentUser: string[];
  currentResponseCount: number;
  currentResponses: string[];
  onFliterClicked: (user: string) => void;
  totalResponseCount: number;
};

export default function useEventResponsesFilters(): EventResponsesFiltersReturn {
  const { allParticipants, timeSlotsToParticipants } = useAvailabilityGridStore((state) => state.eventData);
  const user = useAvailabilityGridStore((state) => state.user);
  const hoveredTimeSlot = useAvailabilityGridStore((state) => state.hoveredTimeSlot);
  const [userFilter, setUserFilter] = useAvailabilityGridStore(
    useShallow((state) => [state.userFilter, state.setUserFilter])
  );
  const mode = useAvailabilityGridStore((state) => state.mode);

  const allParticipantsWithCurrentUser = useMemo(() => {
    if (allParticipants.includes(user) || user === "") return allParticipants;
    return [user, ...allParticipants];
  }, [allParticipants, user]);

  let currentResponses = [] as string[];
  if (hoveredTimeSlot === null) {
    currentResponses = allParticipantsWithCurrentUser;
  } else if (userFilter.length === 0) {
    currentResponses = timeSlotsToParticipants[hoveredTimeSlot] ?? [];
  } else {
    currentResponses = (timeSlotsToParticipants[hoveredTimeSlot] ?? []).filter((user) => userFilter.includes(user));
  }

  const totalResponseCount = userFilter.length === 0 ? allParticipantsWithCurrentUser.length : userFilter.length;
  const currentResponseCount = isEditMode(mode) ? 1 : Math.min(totalResponseCount, currentResponses.length);

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
    allParticipantsWithCurrentUser,
    currentResponseCount,
    currentResponses,
    onFliterClicked: onFliterClicked,
    totalResponseCount
  };
}
