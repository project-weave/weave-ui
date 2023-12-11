import { Button } from "@/components/ui/button";
import useDragSelect from "@/hooks/useDragSelect";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK_DATES, EventDate } from "@/store/availabilityGridStore";
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
      className={cn("card flex h-[14rem] flex-col border-2 px-5 pt-4", {
        "h-full w-full px-8": size === "large"
      })}
      onMouseUp={onDragSelectMouseUp}
    >
      {size === "large" && (
        <h1 className="text-sec mb-12 mt-8 text-center text-xl font-medium tracking-wide">{DAYS_OF_WEEK_TITLE}</h1>
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
