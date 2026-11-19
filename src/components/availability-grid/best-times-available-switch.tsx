import { Star } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
import { getDateFromTimeSlot } from "@/types/Timeslot";
import { cn } from "@/utils/cn";

type BestTimesAvailableSwitchProps = {
  className?: string;
};

// Star toggle that highlights the times when the most participants are available
export default function BestTimesAvailableSwitch({ className }: BestTimesAvailableSwitchProps) {
  const { allParticipants, sortedEventDates, timeSlotsToParticipants } = useAvailabilityGridStore(
    (state) => state.eventData
  );
  const mode = useAvailabilityGridStore((state) => state.mode);
  const availabilityGridViewWindowSize = useAvailabilityGridStore((state) => state.availabilityGridViewWindowSize);
  const userFilter = useAvailabilityGridStore((state) => state.userFilter);

  const [isBestTimesEnabled, toggleIsBestTimesEnabled] = useAvailabilityGridStore(
    useShallow((state) => [state.isBestTimesEnabled, state.toggleIsBestTimesEnabled])
  );
  const [leftMostColumnInView, setLeftMostColumnInView] = useAvailabilityGridStore(
    useShallow((state) => [state.leftMostColumnInView, state.setLeftMostColumnInView])
  );

  function getFirstColumnWithBestTimes(): number {
    const filteredParticipants = userFilter.length === 0 ? allParticipants : userFilter;
    function getFilteredSelectionCount(participants: string[]): number {
      return filteredParticipants.filter((participant) => participants.includes(participant)).length;
    }

    const highestParticiantsSelectedCount = Object.values(timeSlotsToParticipants).reduce((maxCount, participants) => {
      return Math.max(maxCount, getFilteredSelectionCount(participants));
    }, 0);

    const eventDatesWithBestTimes = new Set(
      Object.entries(timeSlotsToParticipants)
        .filter(([, participants]) => getFilteredSelectionCount(participants) === highestParticiantsSelectedCount)
        .map(([timeSlot]) => getDateFromTimeSlot(timeSlot))
    );

    for (let col = 0; col < sortedEventDates.length; col++) {
      if (eventDatesWithBestTimes.has(sortedEventDates[col])) {
        return col;
      }
    }
    return -1;
  }

  function handleBestTimesToggle() {
    // when best times is toggled on, set view window to include the first column with best times
    if (!isBestTimesEnabled) {
      const firstColumnWithBestTimes = getFirstColumnWithBestTimes();

      if (
        firstColumnWithBestTimes !== -1 &&
        (firstColumnWithBestTimes < leftMostColumnInView ||
          firstColumnWithBestTimes >= leftMostColumnInView + availabilityGridViewWindowSize)
      ) {
        setLeftMostColumnInView(firstColumnWithBestTimes);
      }
    }
    toggleIsBestTimesEnabled();
    toast({ description: isBestTimesEnabled ? "Showing all times" : "Showing best times" });
  }

  return (
    <Button
      aria-label="Best times"
      aria-pressed={isBestTimesEnabled}
      className={cn(
        "h-10 w-10 shrink-0 rounded-lg p-0 transition-colors duration-200",
        isBestTimesEnabled && "bg-primary hover:bg-primary-hover",
        isEditMode(mode) && "invisible",
        className
      )}
      onClick={handleBestTimesToggle}
      title={isBestTimesEnabled ? "Show all times" : "Show best times"}
      type="button"
      variant="ghost"
    >
      <Star
        aria-hidden="true"
        className={cn("h-5 w-5", isBestTimesEnabled ? "fill-white text-white" : "text-black")}
        strokeWidth={1.75}
      />
    </Button>
  );
}
