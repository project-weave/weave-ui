import { EventDate } from "@/app/(event)/[eventId]/page";
import { format, isEqual, parseISO } from "date-fns";
import { AnimationControls, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, MutableRefObject, SetStateAction } from "react";

import { Button } from "../ui/button";

type AvailabilityGridHeaderProps = {
  earliestEventDate: EventDate;
  editButtonAnimationControls: AnimationControls;
  handleSaveUserAvailability: () => void;
  hasUserAddedAvailability: boolean;
  isViewMode: boolean;
  lastColumn: number;
  latestEventDate: EventDate;
  setIsViewMode: Dispatch<SetStateAction<boolean>>;
  sortedColumnRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  sortedVisibleColumnNums: number[];
};

export default function AvailabilityGridHeader({
  earliestEventDate,
  editButtonAnimationControls,
  handleSaveUserAvailability,
  hasUserAddedAvailability,
  isViewMode,
  lastColumn,
  latestEventDate,
  setIsViewMode,
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

  const saveUserAvailabilityButton = (
    <motion.div className="h-8" whileTap={{ scale: 0.94 }}>
      <Button className="h-full rounded-md" onClick={handleSaveUserAvailability}>
        Save Availability
      </Button>
    </motion.div>
  );

  const editUserAvailabilityButton = (
    <motion.div animate={editButtonAnimationControls} className="h-8" whileTap={{ scale: 0.94 }}>
      <Button className="h-full rounded-md" onClick={() => setIsViewMode(false)}>
        {hasUserAddedAvailability ? "Edit Availability" : "Add Availability"}
      </Button>
    </motion.div>
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
          {isViewMode ? editUserAvailabilityButton : saveUserAvailabilityButton}
          {(!lastColInView || !firstColInView) && (
            <div className="ml-8 flex h-7 whitespace-nowrap">
              <motion.div whileTap={!firstColInView ? { scale: 0.88 } : {}}>
                <Button
                  className="h-full rounded-sm border-none p-0 px-[2px]"
                  onClick={scrollPrev}
                  variant={firstColInView ? "outline" : "default"}
                >
                  <ChevronLeft className="h-6 w-6 stroke-[3px]" />
                </Button>
              </motion.div>
              <motion.div className="ml-[5px]" whileTap={!lastColInView ? { scale: 0.88 } : {}}>
                <Button
                  className="h-full rounded-sm border-none p-0 px-[2px]"
                  onClick={scrollNext}
                  variant={lastColInView ? "outline" : "default"}
                >
                  <ChevronRight className="h-6 w-6 stroke-[3px]" />
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <hr className="h-[2px] bg-secondary" />
    </>
  );
}
