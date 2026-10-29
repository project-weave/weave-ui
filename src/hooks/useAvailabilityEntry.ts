import { useState } from "react";

import useAvailabilityGridStore from "@/store/availabilityGridStore";

export default function useAvailabilityEntry() {
  const hasSavedAvailability = useAvailabilityGridStore((state) =>
    state.eventData.eventResponses.some(({ alias }) => alias === state.user)
  );
  const [namePromptOpen, setNamePromptOpen] = useState(false);

  function openAvailability() {
    const state = useAvailabilityGridStore.getState();
    if (state.isSavingAvailability) return;
    if (state.user) state.setUserGridState(state.user);
    else setNamePromptOpen(true);
  }

  return {
    actionLabel: hasSavedAvailability ? "Edit your availability" : "Add your availability",
    namePromptOpen,
    openAvailability,
    setNamePromptOpen
  };
}
