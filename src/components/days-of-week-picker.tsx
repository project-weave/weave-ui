import { Button } from "@/components/ui/button";
import useDragSelect from "@/hooks/useDragSelect";
import { DAYS_OF_WEEK_DATES, EventDate } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { format, parseISO } from "date-fns";
import { Dispatch, SetStateAction, useRef } from "react";
type DaysOfWeekPickerProps = {
  selectedDaysOfWeek: Set<EventDate>;
  setSelectedDaysOfWeek: Dispatch<SetStateAction<Set<EventDate>>>;
  size?: "large" | "small";
};

const DAYS_OF_WEEK_TITLE = "Days of the Week";

export default function DaysOfWeekPicker({ selectedDaysOfWeek, setSelectedDaysOfWeek, size }: DaysOfWeekPickerProps) {
  const isTouch = useRef(false);
  const { onDragEnd, onDragMove, onDragStart, onTouchDragEnd, onTouchDragMove, onTouchDragStart } =
    useDragSelect<EventDate>(selectedDaysOfWeek, setSelectedDaysOfWeek);

  return (
    <div
      className={cn("card border-1 flex h-[15rem] flex-col px-5 pt-4 sm:h-[16.5rem]", {
        "w-full px-8 pb-8 sm:h-full": size === "large"
      })}
      onContextMenu={onDragEnd}
      onMouseLeave={onDragEnd}
      onMouseUp={onDragEnd}
      onTouchCancel={onTouchDragEnd}
      onTouchEnd={onTouchDragEnd}
      onTouchMove={(e) => {
        isTouch.current = true;
        const touch = e.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        const touchedElement = document.elementFromPoint(touchX, touchY);
        const date = touchedElement?.getAttribute("drag-select-attr") || null;
        onTouchDragMove(date as EventDate);
      }}
      onTouchStart={(e) => {
        isTouch.current = true;
        const touch = e.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        const touchedElement = document.elementFromPoint(touchX, touchY);
        const date = touchedElement?.getAttribute("drag-select-attr") || null;
        onTouchDragStart(date as EventDate);
      }}
    >
      {size === "large" && (
        <div className="mx-4 mb-6 mt-4">
          <h1 className="text-left text-xl font-semibold tracking-wide text-secondary">{DAYS_OF_WEEK_TITLE}</h1>
          <hr className="mt-4 h-[0.1rem] bg-primary" />
        </div>
      )}

      <div className="flex flex-grow justify-between">
        {DAYS_OF_WEEK_DATES.map((date) => {
          const formattedDateOfWeek = format(parseISO(date), "E");

          return (
            <div className="flex flex-col items-center text-secondary" key={`days-of-weeks-picker-${date}`}>
              <label
                className={cn("mb-4 text-sm font-medium md:mb-2 md:text-sm", {
                  "md:mb-5 md:text-lg": size === "large"
                })}
                htmlFor={`days-of-weeks-picker-${date}`}
              >
                {size === "large" ? formattedDateOfWeek : formattedDateOfWeek[0]}
              </label>
              <div className="flex h-full flex-grow">
                <Button
                  className={cn("h-full w-full rounded-sm bg-primary px-[.9rem] xs:px-4 sm:px-[18px]", {
                    "bg-primary/30 hover:scale-[1.02]": !selectedDaysOfWeek.has(date),
                    "text-md mx-3 w-[4.5rem] rounded-xl": size === "large"
                  })}
                  drag-select-attr={date}
                  onMouseDown={() => {
                    if (isTouch.current === true) return;
                    onDragStart(date);
                  }}
                  onMouseEnter={() => {
                    if (isTouch.current === true) return;
                    onDragMove(date);
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
