import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import useAvailabilityGridStore, {
  AvailabilityGridMode,
  AvailabilityType,
  EventDate,
  isEditMode,
  isViewMode
} from "@/store/availabilityGridStore";
import { format, isEqual, parseISO } from "date-fns";
import { AnimationControls, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { VariableSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";

import EditAvailabilityDialog from "./dialog/edit-availability-dialog";

const EDIT_AVAILABILITY_BUTTON_TEXT = "Edit Availability";
const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";
const BEST_TIMES_BUTTON_TEXT = "Best Times";

type AvailabilityGridHeaderProps = {
  earliestEventDate: EventDate;
  editButtonAnimationControls: AnimationControls;
  gridContainerRef: React.MutableRefObject<null | VariableSizeList>;
  handleSaveUserAvailability: () => void;
  hasUserAddedAvailability: boolean;
  isBestTimesEnabled: boolean;
  isPageLoading: boolean;
  lastColumn: number;
  latestEventDate: EventDate;
  mode: AvailabilityGridMode;
  setIsBestTimesEnabled: Dispatch<SetStateAction<boolean>>;
};

export default function AvailabilityGridHeader({
  earliestEventDate,
  editButtonAnimationControls,
  gridContainerRef,
  handleSaveUserAvailability,
  isBestTimesEnabled,
  isPageLoading,
  lastColumn,
  latestEventDate,
  mode,
  setIsBestTimesEnabled
}: AvailabilityGridHeaderProps) {
  const availabilityType = useAvailabilityGridStore((state) => state.availabilityType);
  const visibleColumnRange = useAvailabilityGridStore(useShallow((state) => state.visibleColumnRange));
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

  const lastColInView = visibleColumnRange.end === lastColumn;
  const firstColInView = visibleColumnRange.start === 0;
  const visibleColumnRangeNotLoaded = visibleColumnRange.start === -1 || visibleColumnRange.end === -1;

  function scrollNext() {
    if (lastColInView || gridContainerRef.current === null) return;
    gridContainerRef.current.scrollToItem(visibleColumnRange.end, "start");
  }

  function scrollPrev() {
    if (firstColInView || gridContainerRef.current === null) return;
    gridContainerRef.current.scrollToItem(visibleColumnRange.start, "end");
  }

  const MotionButton = motion(Button);

  const saveUserAvailabilityButton = (
    <MotionButton
      className="h-8 whitespace-nowrap rounded-[.4rem]"
      onClick={handleSaveUserAvailability}
      variant="dark"
      whileTap={{ scale: 0.94 }}
    >
      {SAVE_AVAILABILITY_BUTTON_TEXT}
    </MotionButton>
  );

  const editUserAvailabilityButton = (
    <Dialog>
      <DialogTrigger asChild>
        <MotionButton
          animate={editButtonAnimationControls}
          className="h-8 whitespace-nowrap rounded-[.4rem]"
          variant="dark"
        >
          {EDIT_AVAILABILITY_BUTTON_TEXT}
        </MotionButton>
      </DialogTrigger>
      <EditAvailabilityDialog />
    </Dialog>
  );

  return (
    <>
      <div className="flex w-[54rem] items-center justify-between">
        <div>
          <h4 className="mb-[2px] text-secondary">
            {"You're now"} <span className="font-bold">{`${isEditMode(mode) ? "editing" : "viewing"}`} </span>
            {`${isEditMode(mode) ? "your availability" : "all availability"}`}
          </h4>
          {availabilityType === AvailabilityType.SPECIFIC_DATES && (
            <h1 className="mb-[2px] mr-32 whitespace-nowrap text-2xl font-semibold tracking-wide text-secondary">
              {heading}
            </h1>
          )}
        </div>

        {availabilityType === AvailabilityType.DAYS_OF_WEEK && <div className="h-12"></div>}

        <div className="mb-2 flex items-center">
          <div className={cn("mr-14 flex items-center space-x-2", { hidden: isEditMode(mode) })}>
            <Label className="cursor-pointer whitespace-nowrap font-semibold text-secondary" htmlFor="best-times">
              {BEST_TIMES_BUTTON_TEXT}
            </Label>
            <Switch
              checked={isBestTimesEnabled}
              className="data-[state=checked]:bg-primary-dark data-[state=unchecked]:bg-accent"
              id="best-times"
              onClick={() => setIsBestTimesEnabled((isEnabled) => !isEnabled)}
            />
          </div>

          {isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}

          {(!firstColInView || !lastColInView || visibleColumnRangeNotLoaded) && !isPageLoading && (
            <div className="ml-8 flex h-7 whitespace-nowrap">
              <MotionButton
                className="h-7 w-7 rounded-sm px-[2px] py-0"
                onClick={scrollPrev}
                variant={firstColInView ? "dark-disabled" : "dark"}
                whileTap={!firstColInView ? { scale: 0.88 } : {}}
              >
                <span className="sr-only">Previous Columns</span>
                <ChevronLeft className="h-7 w-7 stroke-[3px]" />
              </MotionButton>
              <MotionButton
                className="ml-[5px] h-7 w-7 rounded-sm px-[2px] py-0"
                onClick={scrollNext}
                variant={lastColInView ? "dark-disabled" : "dark"}
                whileTap={!lastColInView ? { scale: 0.88 } : {}}
              >
                <span className="sr-only">Next Columns</span>
                <ChevronRight className="h-7 w-7 stroke-[3px]" />
              </MotionButton>
            </div>
          )}
        </div>
      </div>

      <hr className="h-[2px] bg-secondary" />
    </>
  );
}
