"use client";

import { Button } from "@/components/ui/button";
import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

import AvailabilityGridResponseFilterButton from "./availability-grid-response-filter-button";

type AvailabilityParticipantFiltersProps = {
  // "row": one line that scrolls sideways (mobile); "wrap": wraps onto as many lines as needed (desktop,
  // where the surrounding panel scrolls)
  layout?: "row" | "wrap";
};

export default function AvailabilityParticipantFilters({ layout = "wrap" }: AvailabilityParticipantFiltersProps) {
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
        <div
          aria-label="Participant filters"
          className={cn(
            "flex gap-2",
            layout === "row"
              ? "-mx-4 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : "flex-wrap"
          )}
        >
          {names.map((name) => (
            <AvailabilityGridResponseFilterButton className="shrink-0" key={name} name={name} />
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
