import { Button } from "@/components/ui/button";
import { MediaQueryLG, ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { AvailabilityType, isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { format, isEqual, parseISO } from "date-fns";
import { AnimationScope, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import BestTimesAvailableSwitch from "../best-times-available-switch";
import EditAvailabilityDialog from "../dialog/edit-availability-dialog";

const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";

type AvailabilityGridHeaderProps = {
  editAvailabilityButtonAnimationScope: AnimationScope;
  handleSaveUserAvailability: (user: string) => void;
  screenSize: ScreenSize;
};

export default function AvailabilityGridHeader({
  editAvailabilityButtonAnimationScope,
  handleSaveUserAvailability,
  screenSize
}: AvailabilityGridHeaderProps) {
  const { allParticipants, availabilityType, eventName, sortedEventDates } = useAvailabilityGridStore(
    (state) => state.eventData
  );

  const mode = useAvailabilityGridStore((state) => state.mode);
  const user = useAvailabilityGridStore((state) => state.user);

  const isBestTimesEnabled = useAvailabilityGridStore(useShallow((state) => state.isBestTimesEnabled));
  const [availabilityGridNextPage, availabilityGridPreviousPage] = useAvailabilityGridStore(
    useShallow((state) => [state.nextPage, state.previousPage])
  );
  const isPaginationRequired = useAvailabilityGridStore((state) => state.isPaginationRequired);
  const leftMostColumnInView = useAvailabilityGridStore(useShallow((state) => state.leftMostColumnInView));
  const getMaxLeftMostColumnInView = useAvailabilityGridStore((state) => state.getMaxLeftMostColumnInView);

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
            <h4 className="whitespace-nowrap text-xs text-secondary xl:text-sm">
              {"You're now "}
              <span className="font-bold">{isEditMode(mode) ? "editing" : "viewing"} </span>
              {`${isEditMode(mode) ? "your availability" : "all availability"}`}
              {screenSize <= ScreenSize.MD && " for..."}
            </h4>
            {screenSize <= ScreenSize.MD && (
              <div className="text-ellipsis text-xl font-semibold text-primary"> {eventName} </div>
            )}
            {availabilityType === AvailabilityType.SPECIFIC_DATES && (
              <h1 className="mb-[2px] whitespace-nowrap text-lg font-semibold tracking-wide text-secondary xl:mr-32 xl:text-xl">
                {heading}
              </h1>
            )}
          </span>
          <div className="flex w-fit items-center">
            <MediaQueryLG>
              <BestTimesAvailableSwitch />
              <div
                className={cn("ml-8 mr-3 text-2xs xl:ml-16 xl:text-xs", isPaginationRequired() && "lg:mr-2 xl:mr-12")}
              >
                {isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}
              </div>
            </MediaQueryLG>
          </div>
        </div>
        {isPaginationRequired() && (
          <div className="ml-4 mr-1 flex h-7 items-center whitespace-nowrap xs:pr-2 xl:pr-0">
            <MotionButton
              className="h-6 w-6 rounded-[0.45rem] px-[2px] py-0 xl:h-7 xl:w-7 xl:rounded-sm"
              onClick={availabilityGridPreviousPage}
              variant={isFirstColInView ? "default-disabled" : "default"}
              whileTap={!isFirstColInView ? { scale: 0.95 } : {}}
            >
              <span className="sr-only">Previous Columns</span>
              <ChevronLeft className="h-[1.1rem] w-[1.1rem] stroke-[3px] xl:h-5 xl:w-5" />
            </MotionButton>
            <MotionButton
              className="ml-[5px] h-6 w-6 rounded-[0.45rem] px-[2px] py-0 xl:h-7 xl:w-7 xl:rounded-sm"
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