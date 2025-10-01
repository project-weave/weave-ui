import TimeZoneDropdown from "../timezone-dropdown";
import { Separator } from "../ui/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { isSupportedTimeZone } from "@/utils/timeZone";

export default function AvailabilityGridHeader() {
  const { sortedEventDates, timeZone: eventTimeZone } = useAvailabilityGridStore((state) => state.eventData);

  const [selectedTimeZone, setSelectedTimeZone] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeZone, state.setSelectedTimeZone])
  );

  const [availabilityGridNextPage, availabilityGridPreviousPage] = useAvailabilityGridStore(
    useShallow((state) => [state.nextPage, state.previousPage])
  );
  const [availabilityGridViewWindowSize, _] = useAvailabilityGridStore(
    useShallow((state) => [state.availabilityGridViewWindowSize, state.setAvailabilityGridViewWindowSize])
  );
  const isPaginationRequired = useAvailabilityGridStore((state) => state.isPaginationRequired);
  const leftMostColumnInView = useAvailabilityGridStore(useShallow((state) => state.leftMostColumnInView));
  const getMaxLeftMostColumnInView = useAvailabilityGridStore((state) => state.getMaxLeftMostColumnInView);

  const isFirstColInView = leftMostColumnInView === 0;
  const isLastColInView = leftMostColumnInView === getMaxLeftMostColumnInView();

  const numDays = sortedEventDates.length;
  const progressWidth = (availabilityGridViewWindowSize / numDays) * 100;
  const progressPos = (leftMostColumnInView / numDays) * 100;

  const progressBar =
    availabilityGridViewWindowSize >= numDays ? (
      <Separator className="mt-3 bg-light-gray" />
    ) : (
      <div className="absolute left-7 right-0 mb-2 mt-2 h-0.5 rounded-full bg-light-gray">
        <div
          className="absolute h-0.5 rounded-full bg-primary transition-all duration-300"
          style={{
            width: `${progressWidth}%`,
            left: `${progressPos}%`
          }}
        ></div>
      </div>
    );

  const paginationButtons = isPaginationRequired() && (
    <div className="ml-4 mr-1 flex items-center whitespace-nowrap  xs:pr-2 xl:pr-0">
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
    <div className="mt-1">
      <div className="mb-1 flex w-full">
        <div className="ml-2 flex w-full items-center justify-between">
          <TimeZoneDropdown
            error={false}
            gridDropdown={true}
            onChange={setSelectedTimeZone}
            originalTimeZone={eventTimeZone}
            selected={isSupportedTimeZone(selectedTimeZone) ? selectedTimeZone : eventTimeZone}
          />
        </div>
        {paginationButtons}
      </div>
      {progressBar}
    </div>
  );
}
