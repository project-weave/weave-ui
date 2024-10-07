import BestTimesAvailableSwitch from "../best-times-available-switch";
import EditAvailabilityDialog from "../dialog/edit-availability-dialog";
import { format, isEqual, parseISO } from "date-fns";
import { AnimationScope } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { MediaQueryLG } from "@/components/media-query";
import { Button } from "@/components/ui/button";
import { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { cn } from "@/utils/cn";

const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";

type AvailabilityGridHeaderProps = {
  editAvailabilityButtonAnimationScope: AnimationScope;
  screenSize: ScreenSize;
};

export default function AvailabilityGridHeader({
  editAvailabilityButtonAnimationScope,
  screenSize
}: AvailabilityGridHeaderProps) {
  const { availabilityType, eventName, sortedEventDates } = useAvailabilityGridStore((state) => state.eventData);

  const mode = useAvailabilityGridStore((state) => state.mode);

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

  const saveUserAvailabilityButton = (
    <Button
      className="h-[1.7rem] whitespace-nowrap rounded-[.5rem] xl:h-[2rem]"
      form="availability-grid"
      type="submit"
      variant="default"
    >
      {SAVE_AVAILABILITY_BUTTON_TEXT}
    </Button>
  );

  const editUserAvailabilityButton = (
    <EditAvailabilityDialog
      className="h-[1.7rem] whitespace-nowrap rounded-[.5rem] xl:h-[2rem]"
      editAvailabilityButtonAnimationScope={editAvailabilityButtonAnimationScope}
    />
  );

  return (
    <>
      <div
        className={cn("flex items-center xl:mb-1", {
          "mb-2 mt-2 xl:mb-2": availabilityType === AvailabilityType.DAYS_OF_WEEK
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
              <div className="max-w-[16rem] overflow-hidden text-ellipsis text-lg font-semibold text-primary sm:max-w-[24rem] md:max-w-[30rem]">
                {eventName}
              </div>
            )}
            {availabilityType === AvailabilityType.SPECIFIC_DATES && (
              <h1 className="mb-[2px] whitespace-nowrap text-lg font-semibold tracking-wide text-secondary xl:mr-20 xl:text-xl">
                {heading}
              </h1>
            )}
          </span>
          <div className="flex w-fit items-center">
            <MediaQueryLG>
              <div className="ml-3 lg:ml-0">
                <BestTimesAvailableSwitch />
              </div>
              <div
                className={cn(
                  "ml-8 mr-3 text-sm lg:ml-6 lg:text-xs xl:ml-16 xl:text-sm",
                  {
                    "lg:ml-12": availabilityType === AvailabilityType.DAYS_OF_WEEK
                  },
                  isPaginationRequired() && "lg:mr-2 xl:mr-9"
                )}
              >
                {isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}
              </div>
            </MediaQueryLG>
          </div>
        </div>
        {isPaginationRequired() && (
          <div className="ml-4 mr-1 flex h-7 items-center whitespace-nowrap xs:pr-2 xl:pr-0">
            <Button
              className="h-7 w-7 rounded-sm px-[2px] py-0 lg:h-6 lg:w-6 lg:rounded-[0.45rem] xl:h-7 xl:w-7 xl:rounded-sm"
              onClick={availabilityGridPreviousPage}
              type="button"
              variant={isFirstColInView ? "default-disabled" : "default"}
            >
              <span className="sr-only">Previous Columns</span>
              <ChevronLeft className="h-5 w-5 stroke-[3px] pr-[1px] lg:h-4 lg:w-4  xl:h-5 xl:w-5" />
            </Button>
            <Button
              className="ml-[5px] h-7 w-7 rounded-sm px-[2px] py-0 lg:h-6 lg:w-6 lg:rounded-[0.45rem] xl:h-7 xl:w-7 xl:rounded-sm"
              onClick={availabilityGridNextPage}
              type="button"
              variant={isLastColInView ? "default-disabled" : "default"}
            >
              <span className="sr-only">Next Columns</span>
              <ChevronRight className="h-5 w-5 stroke-[3px] pl-[1px] lg:h-4 lg:w-4 xl:h-5 xl:w-5" />
            </Button>
          </div>
        )}
      </div>
      <hr className="h-[2px] bg-secondary" />
    </>
  );
}
