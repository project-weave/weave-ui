import { AvailabilityGridMode, EventDate, isViewMode } from "@/store/availabilityGridStore";
import { format, isEqual, parseISO } from "date-fns";
import { AnimationControls, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, MutableRefObject, SetStateAction } from "react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const ADD_AVAILABILITY_BUTTON_TEXT = "Add Availability";
const EDIT_AVAILABILITY_BUTTON_TEXT = "Edit Availability";
const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";
const BEST_TIMES_BUTTON_TEXT = "Best Times";

type AvailabilityGridHeaderProps = {
  earliestEventDate: EventDate;
  editButtonAnimationControls: AnimationControls;
  handleEditUserAvailability: () => void;
  handleSaveUserAvailability: () => void;
  hasUserAddedAvailability: boolean;
  isBestTimesEnabled: boolean;
  lastColumn: number;
  latestEventDate: EventDate;
  mode: AvailabilityGridMode;
  setIsBestTimesEnabled: Dispatch<SetStateAction<boolean>>;
  sortedColumnRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  sortedVisibleColumnNums: number[];
};

export default function AvailabilityGridHeader({
  earliestEventDate,
  editButtonAnimationControls,
  handleEditUserAvailability,
  handleSaveUserAvailability,
  hasUserAddedAvailability,
  isBestTimesEnabled,
  lastColumn,
  latestEventDate,
  mode,
  setIsBestTimesEnabled,
  sortedColumnRefs,
  sortedVisibleColumnNums
}: AvailabilityGridHeaderProps) {
  const earliestDate = parseISO(earliestEventDate);
  const latestDate = parseISO(latestEventDate);
  let heading = "";

  if (isEqual(earliestDate, latestDate)) {
    heading = `${format(earliestDate, "MMM d yyyy")}`;
  } else if (earliestDate.getUTCFullYear() !== latestDate.getUTCFullYear()) {
    heading = `${format(earliestDate, "MMM d yyyy")} - ${format(latestDate, "MMM d yyyy")}`;
  } else {
    heading = `${format(earliestDate, "MMM d")} - ${format(latestDate, "MMM d yyyy")}`;
  }

  const lastColInView = sortedVisibleColumnNums.length === 0 || sortedVisibleColumnNums.includes(lastColumn);
  const firstColInView = sortedVisibleColumnNums.length === 0 || sortedVisibleColumnNums.includes(0);

  function scrollNext() {
    if (lastColInView || sortedVisibleColumnNums.length <= 2) return;
    const secondLastColumn = sortedColumnRefs.current[sortedVisibleColumnNums[sortedVisibleColumnNums.length - 1]];
    secondLastColumn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  function scrollPrev() {
    if (firstColInView || sortedVisibleColumnNums.length <= 2) return;
    const secondColumn = sortedColumnRefs.current[sortedVisibleColumnNums[0]];
    secondColumn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" });
  }

  const MotionButton = motion(Button);

  const saveUserAvailabilityButton = (
    <MotionButton
      className="h-8 whitespace-nowrap rounded-md"
      onClick={handleSaveUserAvailability}
      variant="dark"
      whileTap={{ scale: 0.94 }}
    >
      {SAVE_AVAILABILITY_BUTTON_TEXT}
    </MotionButton>
  );

  const editUserAvailabilityButton = (
    <MotionButton
      animate={editButtonAnimationControls}
      className="h-8 whitespace-nowrap rounded-md "
      onClick={handleEditUserAvailability}
      variant="dark"
      whileTap={{ scale: 0.94 }}
    >
      {hasUserAddedAvailability ? EDIT_AVAILABILITY_BUTTON_TEXT : ADD_AVAILABILITY_BUTTON_TEXT}
    </MotionButton>
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-[2px] mr-32 whitespace-nowrap text-2xl font-semibold tracking-wide text-secondary">
            {heading}
          </h1>
          <p className="mb-[1px] text-2xs tracking-wider text-primary">GMT-07</p>
        </div>
        <div className="mb-2 flex items-center">
          {isViewMode(mode) && (
            <div className="mr-14 flex items-center space-x-2">
              <Label className="cursor-pointer whitespace-nowrap font-semibold text-secondary" htmlFor="best-times">
                {BEST_TIMES_BUTTON_TEXT}
              </Label>
              <Switch
                checked={isBestTimesEnabled}
                className="data-[state=unchecked]:bg-accent data-[state=checked]:bg-primary-dark"
                id="best-times"
                onClick={() => setIsBestTimesEnabled((isEnabled) => !isEnabled)}
              />
            </div>
          )}

          {isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}
          {(!lastColInView || !firstColInView) && (
            <div className="ml-8 flex h-7 whitespace-nowrap">
              <MotionButton
                className="h-full rounded-sm px-[2px] py-0"
                onClick={scrollPrev}
                variant={firstColInView ? "dark-disabled" : "dark"}
                whileTap={!firstColInView ? { scale: 0.88 } : {}}
              >
                <span className="sr-only">Previous Columns</span>
                <ChevronLeft className="h-6 w-6 stroke-[3px]" />
              </MotionButton>
              <MotionButton
                className="ml-[5px] h-full rounded-sm px-[2px] py-0"
                onClick={scrollNext}
                variant={lastColInView ? "dark-disabled" : "dark"}
                whileTap={!lastColInView ? { scale: 0.88 } : {}}
              >
                <span className="sr-only">Next Columns</span>
                <ChevronRight className="h-6 w-6 stroke-[3px]" />
              </MotionButton>
            </div>
          )}
        </div>
      </div>

      <hr className="h-[2px] bg-secondary" />
    </>
  );
}
