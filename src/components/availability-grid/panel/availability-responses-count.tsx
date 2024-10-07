import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

const RESPONSES_TITLE = "Responses";

export default function AvailabilityResponsesCount({ className }: { className?: string }) {
  const [hoveredTimeSlotResponsesCount, totalResponseCount] = useAvailabilityGridStore((state) => {
    if (isEditMode(state.mode)) return [1, 1];

    const { hoveredTimeSlot, userFilter, eventData } = state;
    const eventParticipants = state.getEventParticipants();

    const totalResponseCount = userFilter.length === 0 ? eventParticipants.length : userFilter.length;
    const hoveredTimeSlotResponses = !hoveredTimeSlot
      ? totalResponseCount
      : (eventData.timeSlotsToParticipants[hoveredTimeSlot] ?? []).filter(
          (user) => userFilter.length === 0 || userFilter.includes(user)
        ).length;

    return [hoveredTimeSlotResponses, totalResponseCount];
  });
  return (
    <div className={cn(className, "flex font-medium")}>
      <p className="text-secondary">{RESPONSES_TITLE}</p>
      <p className="ml-4 text-secondary">
        {hoveredTimeSlotResponsesCount}/{totalResponseCount}
      </p>
    </div>
  );
}
