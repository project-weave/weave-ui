import { format, parseISO } from "date-fns";
import { Dispatch, forwardRef, MouseEvent, SetStateAction, useRef } from "react";

import { Button } from "@/components/ui/button";
import useDragSelect, { extractDragSelectData } from "@/hooks/useDragSelect";
import useRegisterNonPassiveTouchEvents from "@/hooks/useRegisterNonPassiveTouchEvents";
import { DAYS_OF_WEEK_DATES, EventDate } from "@/types/Timeslot";
import { cn } from "@/utils/cn";
import { isLeftClick } from "@/utils/mouseEvent";

type DaysOfWeekPickerProps = {
  error?: boolean;
  selectedDaysOfWeek: Set<EventDate>;
  setSelectedDaysOfWeek: Dispatch<SetStateAction<Set<EventDate>>>;
  size?: "large" | "small";
};

const DAYS_OF_WEEK_TITLE = "Days of the Week";

const DaysOfWeekPicker = forwardRef<HTMLDivElement, DaysOfWeekPickerProps>(
  ({ error, selectedDaysOfWeek, setSelectedDaysOfWeek, size }, ref) => {
    const { onMouseDragEnd, onMouseDragMove, onMouseDragStart, onTouchDragEnd, onTouchDragMove, onTouchDragStart } =
      useDragSelect<EventDate>(selectedDaysOfWeek, setSelectedDaysOfWeek);

    return (
      <div
        className={cn("bg-input rounded-xl scroll-m-24 flex h-[15rem] flex-col px-5 pt-4 sm:h-[16.5rem]", {
          "border-red-500": error,
          "w-full px-8 pb-8 sm:h-full": size === "large"
        })}
        onContextMenu={onMouseDragEnd}
        onMouseLeave={onMouseDragEnd}
        onMouseUp={onMouseDragEnd}
        ref={ref}
      >
        {size === "large" && (
          <div className="mx-4 mb-6 mt-4">
            <h1 className="text-left text-xl font-semibold tracking-wide text-secondary">{DAYS_OF_WEEK_TITLE}</h1>
            <hr className="mt-4 h-[0.1rem] bg-primary" />
          </div>
        )}

        <div className="flex flex-grow justify-between">
          {DAYS_OF_WEEK_DATES.map((date) => (
            <DayOfWeekButton
              date={date}
              key={`dow-button-${date}`}
              onMouseDragMove={onMouseDragMove}
              onMouseDragStart={onMouseDragStart}
              onTouchDragEnd={onTouchDragEnd}
              onTouchDragMove={onTouchDragMove}
              onTouchDragStart={onTouchDragStart}
              selected={selectedDaysOfWeek.has(date)}
              size={size}
            />
          ))}
        </div>
      </div>
    );
  }
);

export default DaysOfWeekPicker;

function DayOfWeekButton({
  date,
  onMouseDragMove,
  onMouseDragStart,
  onTouchDragEnd,
  onTouchDragMove,
  onTouchDragStart,
  selected,
  size
}) {
  function handleMouseDown(event: MouseEvent) {
    if (isLeftClick(event)) onMouseDragStart(date);
  }
  function handleMouseEnter() {
    onMouseDragMove(date);
  }

  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleTouchStart(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();
    const date = extractDragSelectData(e);
    onTouchDragStart(date as EventDate);
  }
  function handleTouchMove(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();
    const date = extractDragSelectData(e);
    onTouchDragMove(date as EventDate);
  }

  useRegisterNonPassiveTouchEvents({ onTouchMove: handleTouchMove, onTouchStart: handleTouchStart, ref: buttonRef });

  const formattedDateOfWeek = format(parseISO(date), "E");

  return (
    <div className="flex flex-col items-center text-text-light" key={`days-of-weeks-picker-${date}`}>
      <label
        className={cn("mb-2 text-sm font-medium", {
          "font-semibold md:mb-5 md:text-lg": size === "large"
        })}
        htmlFor={`days-of-weeks-picker-${date}`}
      >
        {formattedDateOfWeek}
      </label>
      <div className="flex h-full flex-grow touch-none">
        <Button
          className={cn(
            "h-full w-[2.16rem] touch-none rounded-sm bg-primary px-[.9rem] xs:px-4 sm:w-[2.4rem] sm:px-[1.2rem]",
            {
              "bg-[#E7E7E7] hover:scale-[1.02]": !selected,
              "text-md mx-2 w-[5rem] rounded-xl sm:w-[5rem]": size === "large"
            }
          )}
          drag-select-attr={date}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onTouchCancel={onTouchDragEnd}
          onTouchEnd={onTouchDragEnd}
          ref={buttonRef}
          type="button"
        />
      </div>
    </div>
  );
}
