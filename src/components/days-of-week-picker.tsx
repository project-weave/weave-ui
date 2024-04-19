import { Button } from "@/components/ui/button";
import useDragSelect from "@/hooks/useDragSelect";
import { DAYS_OF_WEEK_DATES, EventDate } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { format, parseISO } from "date-fns";
import { Dispatch, SetStateAction } from "react";
type DaysOfWeekPickerProps = {
  selectedDaysOfWeek: Set<EventDate>;
  setSelectedDaysOfWeek: Dispatch<SetStateAction<Set<EventDate>>>;
  size?: "large" | "small";
};

const DAYS_OF_WEEK_TITLE = "Days of the Week";

export default function DaysOfWeekPicker({ selectedDaysOfWeek, setSelectedDaysOfWeek, size }: DaysOfWeekPickerProps) {
  const {
    onMouseDown: onDragSelectMouseDown,
    onMouseEnter: onDragSelectMouseEnter,
    onMouseUp: onDragSelectMouseUp
  } = useDragSelect<EventDate>(selectedDaysOfWeek, setSelectedDaysOfWeek);

  return (
    <div
      className={cn("card border-1 flex h-[14rem] flex-col px-5 pt-4", {
        "h-full w-full px-8 pb-8": size === "large"
      })}
      onContextMenu={onDragSelectMouseUp}
      onMouseLeave={onDragSelectMouseUp}
      onMouseUp={onDragSelectMouseUp}
    >
      {size === "large" && (
        <div className="mx-4 mb-6 mt-4 ">
          <h1 className="text-left text-2xl font-semibold tracking-wide text-secondary">{DAYS_OF_WEEK_TITLE}</h1>
          <hr className="mt-4 h-[0.1rem] bg-primary" />
        </div>
      )}

      <div className="flex flex-grow justify-between">
        {DAYS_OF_WEEK_DATES.map((date) => {
          const formattedDateOfWeek = format(parseISO(date), "E");

          return (
            <div className="flex flex-col items-center text-secondary" key={`days-of-weeks-picker-${date}`}>
              <label
                className={cn("mb-2 text-sm font-medium", { "mb-4 text-xl": size === "large" })}
                htmlFor={`days-of-weeks-picker-${date}`}
              >
                {size === "large" ? formattedDateOfWeek : formattedDateOfWeek[0]}
              </label>
              <div className="flex h-full flex-grow">
                <Button
                  className={cn("h-full w-full rounded-sm bg-primary", {
                    "bg-primary/30 hover:scale-[1.02]": !selectedDaysOfWeek.has(date),
                    "mx-3 w-[4.5rem] rounded-xl": size === "large"
                    // "bg-primary/30 hover:scale-[1.02]": !selectedDaysOfWeek.has(da
                  })}
                  onMouseDown={() => {
                    onDragSelectMouseDown(date);
                  }}
                  onMouseEnter={() => {
                    onDragSelectMouseEnter(date);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
