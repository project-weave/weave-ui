import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MediaQueryLG, MediaQuerySM, ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { AvailabilityType, isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { getDateFromTimeSlot } from "@/types/Event";
import { cn } from "@/utils/cn";
import { format, isEqual, parseISO } from "date-fns";
import { AnimationScope, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import EditAvailabilityDialog from "../dialog/edit-availability-dialog";

const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";
const BEST_TIMES_BUTTON_TEXT = "Best Times";

type AvailabilityGridHeaderProps = {
  editAvailabilityButtonAnimationScope: AnimationScope;
  handleSaveUserAvailability: (user: string) => void;
  handleUserChange: (user: string) => void;
  screenSize: ScreenSize;
};

export default function AvailabilityGridHeader({
  editAvailabilityButtonAnimationScope,
  handleSaveUserAvailability,
  handleUserChange,
  screenSize
}: AvailabilityGridHeaderProps) {
  const { allParticipants, availabilityType, eventName, sortedEventDates, timeSlotsToParticipants } =
    useAvailabilityGridStore((state) => state.eventData);

  const mode = useAvailabilityGridStore((state) => state.mode);
  const user = useAvailabilityGridStore((state) => state.user);
  const userFilter = useAvailabilityGridStore((state) => state.userFilter);

  const [isBestTimesEnabled, toggleIsBestTimesEnabled] = useAvailabilityGridStore(
    useShallow((state) => [state.isBestTimesEnabled, state.toggleIsBestTimesEnabled])
  );
  const [availabilityGridNextPage, availabilityGridPreviousPage] = useAvailabilityGridStore(
    useShallow((state) => [state.nextPage, state.previousPage])
  );
  const isPaginationRequired = useAvailabilityGridStore((state) => state.isPaginationRequired);
  const [leftMostColumnInView, setLeftMostColumnInView] = useAvailabilityGridStore(
    useShallow((state) => [state.leftMostColumnInView, state.setLeftMostColumnInView])
  );
  const getMaxLeftMostColumnInView = useAvailabilityGridStore((state) => state.getMaxLeftMostColumnInView);
  const availabilityGridViewWindowSize = useAvailabilityGridStore((state) => state.availabilityGridViewWindowSize);

  const earliestDate = parseISO(sortedEventDates[0]);
  const latestDate = parseISO(sortedEventDates[sortedEventDates.length - 1]);

  const isFirstColInView = leftMostColumnInView === 0;
  const isLastColInView = leftMostColumnInView === getMaxLeftMostColumnInView();

  let heading = "";
  if (isEqual(earliestDate, latestDate)) {
    heading = `${format(earliestDate, "MMM d yyyy")}`;
  } else if (earliestDate.getUTCFullYear() !== latestDate.getUTCFullYear()) {
    heading = `${format(earliestDate, "MMM d yyyy")} - ${format(latestDate, "MMM d yyyy")}`;
  } else {
    heading = `${format(earliestDate, "MMM d")} - ${format(latestDate, "MMM d yyyy")}`;
  }

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

  const MotionButton = motion(Button);

  const saveUserAvailabilityButton = (
    <MotionButton
      className="h-[1.7rem] whitespace-nowrap rounded-[.4rem] xl:h-[1.9rem]"
      onClick={() => handleSaveUserAvailability(user)}
      variant="default"
      whileTap={{ scale: 0.94 }}
    >
      {SAVE_AVAILABILITY_BUTTON_TEXT}
    </MotionButton>
  );

  const editUserAvailabilityButton = (
    <EditAvailabilityDialog
      allParticipants={allParticipants}
      className="h-[1.7rem] whitespace-nowrap rounded-[.4rem] xl:h-[1.9rem]"
      editAvailabilityButtonAnimationScope={editAvailabilityButtonAnimationScope}
      handleUserChange={handleUserChange}
    />
  );

  return (
    <>
      <div
        className={cn("flex items-center", {
          "mb-2 mt-2": availabilityType === AvailabilityType.DAYS_OF_WEEK
        })}
      >
        <div className="ml-1 flex w-full items-center justify-between">
          <span>
            <h4 className="whitespace-nowrap text-[0.75rem] text-secondary xl:text-sm">
              {"You're now "}
              <span className="font-bold">{isEditMode(mode) ? "editing" : "viewing"} </span>
              {`${isEditMode(mode) ? "your availability" : "all availability"}`}
              {screenSize <= ScreenSize.MD && " for..."}
            </h4>
            {screenSize <= ScreenSize.MD && (
              <div className="text-ellipsis font-semibold text-primary"> {eventName} </div>
            )}
            {availabilityType === AvailabilityType.SPECIFIC_DATES && (
              <h1 className="mb-[2px] whitespace-nowrap text-base font-semibold tracking-wide text-secondary xl:mr-32 xl:text-xl">
                {heading}
              </h1>
            )}
          </span>
          <div className="flex w-fit items-center">
            <MediaQueryLG>
              <div className={cn("flex items-center space-x-2", { invisible: isEditMode(mode) })}>
                <Label
                  className="cursor-pointer whitespace-nowrap text-2xs font-semibold text-secondary xl:text-sm"
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
            </MediaQueryLG>
            <MediaQuerySM>
              <div
                className={cn(
                  "ml-10 mr-3 text-2xs lg:ml-8 xl:ml-16 xl:text-xs",
                  isPaginationRequired() && "sm:mr-6 md:mr-9 lg:mr-2 xl:mr-9"
                )}
              >
                {isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}
              </div>
            </MediaQuerySM>
          </div>
        </div>
        {isPaginationRequired() && (
          <div className="ml-4 mr-1 flex h-7 items-center whitespace-nowrap xs:pr-2 xl:pr-0">
            <MotionButton
              className="h-6 w-6 rounded-[0.45rem] px-[2px] py-0 xl:h-7 xl:w-7 xl:rounded-sm"
              // TODO
              onClick={availabilityGridPreviousPage}
              variant={isFirstColInView ? "default-disabled" : "default"}
              whileTap={!isFirstColInView ? { scale: 0.95 } : {}}
            >
              <span className="sr-only">Previous Columns</span>
              <ChevronLeft className="h-[1.1rem] w-[1.1rem] stroke-[3px] xl:h-5 xl:w-5" />
            </MotionButton>
            <MotionButton
              className="ml-[5px] h-6 w-6 rounded-[0.45rem] px-[2px] py-0 xl:h-7 xl:w-7 xl:rounded-sm"
              // TODO
              onClick={availabilityGridNextPage}
              variant={isLastColInView ? "default-disabled" : "default"}
              whileTap={!isLastColInView ? { scale: 0.95 } : {}}
            >
              <span className="sr-only">Next Columns</span>
              <ChevronRight className="h-[1.1rem] w-[1.1rem] stroke-[3px] xl:h-5 xl:w-5" />
            </MotionButton>
          </div>
        )}
      </div>
      <hr className="h-[2px] bg-secondary" />
    </>
  );
}
