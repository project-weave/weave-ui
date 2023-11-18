import { cn } from "@/lib/utils";
import { format, isEqual, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MutableRefObject } from "react";

import { Button } from "../ui/button";
import { AvailabilityDate } from "./availability-grid";

type AvailabilityGridHeaderProps = {
  earliestAvailabilityDate: AvailabilityDate;
  lastColumn: number;
  latestAvailabilityDate: AvailabilityDate;
  sortedColumnRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  sortedVisibleColumnNums: number[];
};

export default function AvailabilityGridHeader({
  earliestAvailabilityDate,
  lastColumn,
  latestAvailabilityDate,
  sortedColumnRefs,
  sortedVisibleColumnNums
}: AvailabilityGridHeaderProps) {
  const earliestDate = parseISO(earliestAvailabilityDate);
  const latestDate = parseISO(latestAvailabilityDate);

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
    const secondLastColumn = sortedColumnRefs.current[sortedVisibleColumnNums[sortedVisibleColumnNums.length - 2]];
    secondLastColumn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  function scrollPrev() {
    if (firstColInView || sortedVisibleColumnNums.length <= 2) return;
    const secondColumn = sortedColumnRefs.current[sortedVisibleColumnNums[1]];
    secondColumn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" });
  }

  return (
    <>
      <div className="flex justify-between">
        <div className="">
          <h1 className="mb-[2px] mr-32 whitespace-nowrap text-2xl font-semibold tracking-wide text-secondary">
            {heading}
          </h1>
          <p className="text-2xs mb-[1px] tracking-wider text-primary">GMT-07</p>
        </div>
        {(!lastColInView || !firstColInView) && (
          <div className="mt-2 whitespace-nowrap">
            <Button
              className={"h-7 rounded-sm border-none p-0 px-[2px]"}
              onClick={scrollPrev}
              variant={firstColInView ? "outline" : "default"}
            >
              <ChevronLeft
                className={cn("h-6 w-6 stroke-[3px]", {
                  "text-primary": firstColInView
                })}
              />
            </Button>
            <Button
              className="ml-[5px] h-7 rounded-sm border-none p-0 px-[2px]"
              onClick={scrollNext}
              variant={lastColInView ? "outline" : "default"}
            >
              <ChevronRight className="h-6 w-6 stroke-[3px]" />
            </Button>
          </div>
        )}
      </div>

      <hr className="h-[2px] bg-secondary" />
    </>
  );
}
