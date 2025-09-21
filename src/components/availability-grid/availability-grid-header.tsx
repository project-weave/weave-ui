import TimeZoneDropdown from "../timezone-dropdown";
import { Label } from "../ui/label";
import { format, isEqual, parseISO } from "date-fns";
import { AnimationScope } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, Link, Pencil } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { MediaQueryLG } from "@/components/media-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { cn } from "@/utils/cn";
import { isSupportedTimeZone } from "@/utils/timeZone";

import EditAvailabilityDialog from "./dialog/edit-availability-dialog";

const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";
const EDITING_TEXT = "Editing availability";
const VIEWING_TEXT = "Viewing availability";

type AvailabilityGridHeaderProps = {
  editAvailabilityButtonAnimationScope: AnimationScope;
  screenSize: ScreenSize;
};

export default function AvailabilityGridHeader({
  editAvailabilityButtonAnimationScope,
  screenSize
}: AvailabilityGridHeaderProps) {
  const {
    availabilityType,
    eventName,
    sortedEventDates,
    eventId,
    timeZone: eventTimeZone
  } = useAvailabilityGridStore((state) => state.eventData);

  const [selectedTimeZone, setSelectedTimeZone] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeZone, state.setSelectedTimeZone])
  );

  const mode = useAvailabilityGridStore((state) => state.mode);

  const [availabilityGridNextPage, availabilityGridPreviousPage] = useAvailabilityGridStore(
    useShallow((state) => [state.nextPage, state.previousPage])
  );
  const [availabilityGridViewWindowSize, setAvailabilityGridViewWindowSize] = useAvailabilityGridStore(
    useShallow((state) => [state.availabilityGridViewWindowSize, state.setAvailabilityGridViewWindowSize])
  );
  const isPaginationRequired = useAvailabilityGridStore((state) => state.isPaginationRequired);
  const leftMostColumnInView = useAvailabilityGridStore(useShallow((state) => state.leftMostColumnInView));
  const getMaxLeftMostColumnInView = useAvailabilityGridStore((state) => state.getMaxLeftMostColumnInView);

  const earliestDate = parseISO(sortedEventDates[0]);
  const latestDate = parseISO(sortedEventDates[sortedEventDates.length - 1]);
  const numDays = sortedEventDates.length;
  const progressWidth = (availabilityGridViewWindowSize / numDays) * 100;
  const progressPos = (leftMostColumnInView / numDays) * 100;

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

  const eventTitle = (
    <span className="flex items-center justify-between">
      {screenSize <= ScreenSize.MD && (
        <div className="max-w-[16rem] overflow-hidden text-ellipsis text-lg font-semibold text-text sm:max-w-[24rem] md:max-w-[30rem]">
          {eventName}
        </div>
      )}
      <Button
        className="h-[2.5rem] w-[2.5rem] rounded-sm bg-primary p-0 sm:h-[2.3rem] md:h-[2.6rem] md:text-[1.05rem]"
        onClick={() => {
          const url = `${window.location.origin}/${eventId}`;
          navigator.clipboard.writeText(url);
          toast({
            className: "w-fit ml-auto py-4 text-sm md:w-full md:py-6",
            description: "Copied link to clipboard.",
            variant: "success"
          });
        }}
      >
        <Link className="h-4 w-4 text-white md:h-5 md:w-5" />
      </Button>
    </span>
  );

  const editStatus = (
    <div className="flex items-center space-x-2">
      <Label
        className={cn(
          "bg-red-200 text-text-primary whitespace-nowrap rounded-sm px-4 py-1 text-sm lg:text-xs xl:text-sm",
          isEditMode(mode) && "bg-yellow-200"
        )}
        htmlFor="edit-status"
      >
        {isEditMode(mode) ? (
          <span className="flex items-center gap-2">
            <Pencil className="h-4 w-4 md:h-5 md:w-5" /> {EDITING_TEXT}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4 md:h-5 md:w-5" /> {VIEWING_TEXT}
          </span>
        )}
      </Label>
    </div>
  );

  const progressBar = (
    <div
      className="mb-2 mt-2 h-0.5 w-full rounded-full bg-gray-200"
      style={{
        position: "absolute"
      }}
    >
      <div
        className="h-0.5 rounded-full bg-primary transition-all duration-300"
        style={{
          width: `${progressWidth}%`,
          left: `${progressPos}%`,
          position: "absolute"
        }}
      ></div>
    </div>
  );
  const headerTitle = (
    <span>
      <div className="mb-2">{editStatus}</div>
      {availabilityType === AvailabilityType.SPECIFIC_DATES && (
        <h1 className="text-text-primary mb-[2px] whitespace-nowrap text-lg font-semibold tracking-wide xl:mr-20 xl:text-xl">
          {heading}
        </h1>
      )}
      <TimeZoneDropdown
        error={false}
        gridDropdown={true}
        onChange={setSelectedTimeZone}
        originalTimeZone={eventTimeZone}
        selected={isSupportedTimeZone(selectedTimeZone) ? selectedTimeZone : eventTimeZone}
      />
    </span>
  );

  const gridSettingsButtons = (
    <div className="flex w-fit items-center">
      <MediaQueryLG>
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
  );

  const paginationButtons = isPaginationRequired() && (
    <div className="ml-4 mr-1 flex h-7 items-center whitespace-nowrap xs:pr-2 xl:pr-0">
      <Button
        className="h-7 w-7 rounded-sm px-[2px] py-0 lg:h-6 lg:w-6 lg:rounded-[0.45rem] xl:h-7 xl:w-7 xl:rounded-sm"
        onClick={() => {
          availabilityGridPreviousPage();
        }}
        type="button"
        variant={isFirstColInView ? "default-disabled-white" : "default"}
      >
        <span className="sr-only">Previous Columns</span>
        <ChevronLeft className="h-5 w-5 stroke-[3px] pr-[1px] lg:h-4 lg:w-4  xl:h-5 xl:w-5" />
      </Button>
      <Button
        className="ml-[5px] h-7 w-7 rounded-sm px-[2px] py-0 lg:h-6 lg:w-6 lg:rounded-[0.45rem] xl:h-7 xl:w-7 xl:rounded-sm"
        onClick={() => {
          availabilityGridNextPage();
        }}
        type="button"
        variant={isLastColInView ? "default-disabled-white" : "default"}
      >
        <span className="sr-only">Next Columns</span>
        <ChevronRight className="h-5 w-5 stroke-[3px] pl-[1px] lg:h-4 lg:w-4 xl:h-5 xl:w-5" />
      </Button>
    </div>
  );

  return (
    <>
      <div className="mb-2">{eventTitle}</div>
      <div
        className={cn("flex items-center xl:mb-1", {
          "mb-2 mt-2 xl:mb-2": availabilityType === AvailabilityType.DAYS_OF_WEEK
        })}
      >
        <div className="ml-1 flex w-full items-center justify-between">
          <>{headerTitle}</>
          <>{gridSettingsButtons}</>
        </div>
        {paginationButtons}
      </div>
      <>{progressBar}</>
    </>
  );
}
