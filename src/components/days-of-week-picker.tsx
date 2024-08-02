import { Button } from "@/components/ui/button";
import useDragSelect from "@/hooks/useDragSelect";
import { DAYS_OF_WEEK_DATES, EventDate } from "@/types/Event";
import { cn } from "@/utils/cn";
import { isLeftClick } from "@/utils/mouseEvent";
import { format, parseISO } from "date-fns";
import { Dispatch, MouseEvent, SetStateAction, useRef } from "react";
type DaysOfWeekPickerProps = {
  selectedDaysOfWeek: Set<EventDate>;
  setSelectedDaysOfWeek: Dispatch<SetStateAction<Set<EventDate>>>;
  size?: "large" | "small";
};

const DAYS_OF_WEEK_TITLE = "Days of the Week";

export default function DaysOfWeekPicker({ selectedDaysOfWeek, setSelectedDaysOfWeek, size }: DaysOfWeekPickerProps) {
  const dragSelectContainerRef = useRef<HTMLDivElement>(null);

  const { onMouseDragEnd, onMouseDragMove, onMouseDragStart, onTouchDragEnd, onTouchDragMove, onTouchDragStart } =
    useDragSelect<EventDate>(selectedDaysOfWeek, setSelectedDaysOfWeek, dragSelectContainerRef);

  function handleTouchMove(e: React.TouchEvent) {
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    const touchedElement = document.elementFromPoint(touchX, touchY);
    const date = touchedElement?.getAttribute("drag-select-attr") || null;
    onTouchDragMove(date as EventDate);
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    const touchedElement = document.elementFromPoint(touchX, touchY);
    const date = touchedElement?.getAttribute("drag-select-attr") || null;
    onTouchDragStart(date as EventDate);
  }

  return (
    <div
      className={cn("card border-1 flex h-[15rem] flex-col px-5 pt-4 sm:h-[16.5rem]", {
        "w-full px-8 pb-8 sm:h-full": size === "large"
      })}
      onContextMenu={onMouseDragEnd}
      onMouseLeave={onMouseDragEnd}
      onMouseUp={onMouseDragEnd}
      ref={dragSelectContainerRef}
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
                className={cn("mb-2 text-sm font-medium", {
                  "font-semibold md:mb-5 md:text-lg": size === "large"
                })}
                htmlFor={`days-of-weeks-picker-${date}`}
              >
                {size === "large" ? formattedDateOfWeek : formattedDateOfWeek[0]}
              </label>
              <div className="flex h-full flex-grow">
                <Button
                  className={cn(
                    "h-full w-[2.16rem] rounded-sm bg-primary px-[.9rem] xs:px-4 sm:w-[2.4rem] sm:px-[1.2rem]",
                    {
                      "bg-primary/30 hover:scale-[1.02]": !selectedDaysOfWeek.has(date),
                      "text-md mx-2 w-[5rem] rounded-xl sm:w-[5rem]": size === "large"
                    }
                  )}
                  drag-select-attr={date}
                  onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                    if (isLeftClick(e)) onMouseDragStart(date);
                  }}
                  onMouseEnter={() => {
                    onMouseDragMove(date);
                  }}
                  onTouchCancel={onTouchDragEnd}
                  onTouchEnd={onTouchDragEnd}
                  onTouchMove={handleTouchMove}
                  onTouchStart={handleTouchStart}
                  type="button"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
