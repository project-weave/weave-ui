import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useAvailabilityGridStore, { AvailabilityType, isEditMode, isViewMode } from "@/store/availabilityGridStore";
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
};

export default function AvailabilityGridHeader({
  editAvailabilityButtonAnimationScope,
  handleSaveUserAvailability,
  handleUserChange
}: AvailabilityGridHeaderProps) {
  const { allParticipants, availabilityType, sortedEventDates } = useAvailabilityGridStore((state) => state.eventData);
  // TODO: pagination

  const earliestDate = parseISO(sortedEventDates[0]);
  const latestDate = parseISO(sortedEventDates[sortedEventDates.length - 1]);
  const lastColumn = sortedEventDates.length - 1;

  const mode = useAvailabilityGridStore((state) => state.mode);
  const user = useAvailabilityGridStore((state) => state.user);

  const [isBestTimesEnabled, toggleIsBestTimesEnabled] = useAvailabilityGridStore(
    useShallow((state) => [state.isBestTimesEnabled, state.toggleIsBestTimesEnabled])
  );

  const visibleColumnRange = useAvailabilityGridStore(useShallow((state) => state.visibleColumnRange));

  let heading = "";

  if (isEqual(earliestDate, latestDate)) {
    heading = `${format(earliestDate, "MMM d yyyy")}`;
  } else if (earliestDate.getUTCFullYear() !== latestDate.getUTCFullYear()) {
    heading = `${format(earliestDate, "MMM d yyyy")} - ${format(latestDate, "MMM d yyyy")}`;
  } else {
    heading = `${format(earliestDate, "MMM d")} - ${format(latestDate, "MMM d yyyy")}`;
  }

  const lastColInView = visibleColumnRange.end === lastColumn;
  const firstColInView = visibleColumnRange.start === 0;
  const visibleColumnRangeLoaded = visibleColumnRange.start !== -1 && visibleColumnRange.end !== -1;

  // function scrollNext() {
  //   if (lastColInView || gridContainerRef.current === null) return;
  //   gridContainerRef.current.scrollToItem(visibleColumnRange.end, "start");
  // }

  // function scrollPrev() {
  //   if (firstColInView || gridContainerRef.current === null) return;
  //   gridContainerRef.current.scrollToItem(visibleColumnRange.start, "end");
  // }

  const MotionButton = motion(Button);

  const saveUserAvailabilityButton = (
    <MotionButton
      className="h-[1.9rem] whitespace-nowrap rounded-[.4rem] text-[.85rem]"
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
      editAvailabilityButtonAnimationScope={editAvailabilityButtonAnimationScope}
      handleUserChange={handleUserChange}
    />
  );

  const showNavigationButtons = (!firstColInView || !lastColInView) && visibleColumnRangeLoaded;

  return (
    <>
      <div
        className={cn("grid grid-cols-2 items-center", {
          "mb-2 mt-2": availabilityType === AvailabilityType.DAYS_OF_WEEK
        })}
        style={{
          gridTemplateColumns: "40% 60%"
        }}
      >
        <div className="ml-1">
          <h4 className="text-[0.9rem] text-secondary">
            {"You're now"} <span className="font-bold">{isEditMode(mode) ? "editing" : "viewing"} </span>
            {`${isEditMode(mode) ? "your availability" : "all availability"}`}
          </h4>
          {availabilityType === AvailabilityType.SPECIFIC_DATES && (
            <h1 className="mb-[2px] mr-32 whitespace-nowrap text-xl font-semibold tracking-wide text-secondary">
              {heading}
            </h1>
          )}
        </div>

        <div className="mb-1 flex w-full items-center">
          <div
            className={cn("flex w-full items-center justify-around", {
              "ml-24 mr-1 justify-between": !showNavigationButtons
            })}
          >
            <div className={cn("flex items-center space-x-2", { invisible: isEditMode(mode) })}>
              <Label
                className="cursor-pointer whitespace-nowrap text-[.85rem] font-semibold text-secondary"
                htmlFor="best-times"
              >
                {BEST_TIMES_BUTTON_TEXT}
              </Label>
              <Switch
                checked={isBestTimesEnabled}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-accent"
                id="best-times"
                onClick={toggleIsBestTimesEnabled}
              />
            </div>
            <div>{isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}</div>
          </div>
          {showNavigationButtons && (
            <div className="ml-4 mr-1 flex h-7 whitespace-nowrap">
              <MotionButton
                className="h-7 w-7 rounded-sm px-[2px] py-0"
                // TODO
                onClick={() => {}}
                variant={firstColInView ? "default-disabled" : "default"}
                whileTap={!firstColInView ? { scale: 0.88 } : {}}
              >
                <span className="sr-only">Previous Columns</span>
                <ChevronLeft className="h-5 w-6 stroke-[3px]" />
              </MotionButton>
              <MotionButton
                className="ml-[5px] h-7 w-7 rounded-sm px-[2px] py-0"
                // TODO
                onClick={() => {}}
                variant={lastColInView ? "default-disabled" : "default"}
                whileTap={!lastColInView ? { scale: 0.88 } : {}}
              >
                <span className="sr-only">Next Columns</span>
                <ChevronRight className="h-5 w-5 stroke-[3px]" />
              </MotionButton>
            </div>
          )}
        </div>
      </div>

      <hr className="h-[2px] bg-secondary" />
    </>
  );
}
