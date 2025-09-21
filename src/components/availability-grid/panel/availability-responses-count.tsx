import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

const RESPONSES_TITLE = "Responses";

export default function AvailabilityResponsesCount({ className }: { className?: string }) {
  const [hoveredTimeSlotResponsesCount, totalResponseCount] = useAvailabilityGridStore((state) => {
    if (isEditMode(state.mode)) return [1, 1];

    const { eventData, hoveredTimeSlot, userFilter } = state;
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
    <div className={cn(className, "flex items-center text-xs font-medium")}>
      <p>{RESPONSES_TITLE}</p>
      <p className="ml-2">
        {hoveredTimeSlotResponsesCount}/{totalResponseCount}
      </p>
    </div>
  );
}
