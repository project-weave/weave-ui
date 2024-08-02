import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
import { getDateFromTimeSlot } from "@/types/Event";
import { cn } from "@/utils/cn";
import { useShallow } from "zustand/react/shallow";

const BEST_TIMES_BUTTON_TEXT = "Best Times";

export default function BestTimesAvailableSwitch() {
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
        .filter(([_, participants]) => getFilteredSelectionCount(participants) === highestParticiantsSelectedCount)
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
  }

  return (
    <div className={cn("flex items-center space-x-2", { invisible: isEditMode(mode) })}>
      <Label
        className="cursor-pointer whitespace-nowrap text-sm font-semibold text-secondary lg:text-xs xl:text-sm"
        htmlFor="best-times"
      >
        {BEST_TIMES_BUTTON_TEXT}
      </Label>
      <Switch
        checked={isBestTimesEnabled}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-accent"
        id="best-times"
        onClick={handleBestTimesToggle}
      />
    </div>
  );
}
