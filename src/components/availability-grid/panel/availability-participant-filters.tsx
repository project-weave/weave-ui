"use client";

import { Button } from "@/components/ui/button";
import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";

export default function AvailabilityParticipantFilters() {
  const participants = useAvailabilityGridStore((state) => state.eventData.allParticipants);
  const user = useAvailabilityGridStore((state) => state.user);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const userFilter = useAvailabilityGridStore((state) => state.userFilter);
  const setUserFilter = useAvailabilityGridStore((state) => state.setUserFilter);
  const names = isEditMode(mode) && user && !participants.includes(user) ? [user, ...participants] : participants;

  return (
    <div className="space-y-3">
      {names.length === 0 ? (
        <p className="text-xs text-text-light">No responses yet. Add your availability to get started.</p>
      ) : (
        <div aria-label="Participant filters" className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
          {names.map((name) => (
            <AvailabilityGridResponseFilterButton key={name} name={name} />
          ))}
        </div>
      )}
      {!isEditMode(mode) && userFilter.length > 0 && (
        <Button className="h-7 px-2 text-xs" onClick={() => setUserFilter([])} type="button" variant="ghost">
          Show all responses
        </Button>
      )}
    </div>
  );
}
