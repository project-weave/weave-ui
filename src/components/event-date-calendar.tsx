"use client";

import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
  sub
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, LegacyRef, MouseEvent, SetStateAction, useEffect, useRef, useState } from "react";

import useDragSelect, { extractDragSelectData } from "@/hooks/useDragSelect";
import useRegisterNonPassiveTouchEvents from "@/hooks/useRegisterNonPassiveTouchEvents";
import { EVENT_DATE_FORMAT, EventDate } from "@/types/Timeslot";
import { cn } from "@/utils/cn";
import { isLeftClick } from "@/utils/mouseEvent";

import { Button } from "./ui/button";

type EventDateCalendarViewModeProps = {
  currentMonthOverride?: string;
  earliestSelectedDate: EventDate;
  error?: boolean;
  forwardedRef?: LegacyRef<HTMLDivElement>;
  id: string;
  isViewMode: true;
  latestSelectedDate: EventDate;
  onViewModeDateClick: (date: EventDate) => void;
  selectedDates: Set<EventDate>;
  setCurrentMonthOverride?: Dispatch<SetStateAction<string>>;
  setSelectedDates?: never;
  size?: "large" | "small";
  visibleEventDates: EventDate[];
};

type EventDateCalendarEditModeProps = {
  currentMonthOverride?: string;
  earliestSelectedDate?: never;
  error?: boolean;
  forwardedRef?: LegacyRef<HTMLDivElement>;
  id: string;
  isViewMode: false;
  latestSelectedDate?: never;
  onViewModeDateClick?: never;
  selectedDates: Set<EventDate>;
  setCurrentMonthOverride?: Dispatch<SetStateAction<string>>;
  setSelectedDates: Dispatch<SetStateAction<Set<EventDate>>>;
  size?: "large" | "small";
  visibleEventDates?: never;
};

export type EventDateCalendarProps = EventDateCalendarEditModeProps | EventDateCalendarViewModeProps;

export const MONTH_FORMAT = "yyyy-MM";

const EventDateCalendar = ({
  currentMonthOverride,
  earliestSelectedDate,
  error,
  forwardedRef,
  id,
  isViewMode,
  latestSelectedDate,
  onViewModeDateClick,
  selectedDates,
  setCurrentMonthOverride,
  setSelectedDates,
  size,
  visibleEventDates
}: EventDateCalendarProps) => {
  const defaultMonth =
    currentMonthOverride !== undefined
      ? currentMonthOverride
      : isViewMode
        ? format(parseISO(earliestSelectedDate), MONTH_FORMAT)
        : format(startOfToday(), MONTH_FORMAT);
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);

  useEffect(() => {
    if (currentMonthOverride !== undefined) {
      setCurrentMonth(currentMonthOverride);
    }
  }, [currentMonthOverride]);
  const { onMouseDragEnd, onMouseDragMove, onMouseDragStart, onTouchDragEnd, onTouchDragMove, onTouchDragStart } =
    useDragSelect<EventDate>(selectedDates, setSelectedDates!);

  function handleMouseUp() {
    if (!isViewMode) onMouseDragEnd();
  }

  const firstDayCurrentMonth = parse(currentMonth, MONTH_FORMAT, startOfToday());

  const earliestMonth = earliestSelectedDate ? format(parseISO(earliestSelectedDate), MONTH_FORMAT) : "";
  const isCurrentMonthEarliest = isViewMode
    ? earliestMonth === currentMonth
    : format(startOfToday(), MONTH_FORMAT) === currentMonth;

  const latestdMonth = latestSelectedDate ? format(parseISO(latestSelectedDate), MONTH_FORMAT) : "";
  const isCurrentMonthLatest = latestdMonth === currentMonth;
  const isNextAndPrevButtonsVisible = !isCurrentMonthEarliest || !isCurrentMonthLatest;

  function setPrevMonth() {
    if (isCurrentMonthEarliest) return;
    const firstDayPrevMonth = sub(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayPrevMonth, MONTH_FORMAT));
    setCurrentMonthOverride?.(format(firstDayPrevMonth, MONTH_FORMAT));
  }
  function setNextMonth() {
    if (isCurrentMonthLatest) return;
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, MONTH_FORMAT));
    setCurrentMonthOverride?.(format(firstDayNextMonth, MONTH_FORMAT));
  }

  function getFirstDayOfCalendar(currentMonth: string): Date {
    const firstDayCurrentMonth = parse(currentMonth, MONTH_FORMAT, startOfToday());
    const firstDayCurrentMonthDayOfWeek = getDay(firstDayCurrentMonth);
    return sub(firstDayCurrentMonth, { days: firstDayCurrentMonthDayOfWeek });
  }
  function getLastDayOfCalendar(currentMonth: string): Date {
    const firstDayCurrentMonth = parse(currentMonth, MONTH_FORMAT, startOfToday());
    const lastDayOfCurrentMonth = endOfMonth(firstDayCurrentMonth);
    const lastDayOfCurrentMonthDayOfWeek = getDay(lastDayOfCurrentMonth);
    return add(lastDayOfCurrentMonth, { days: 6 - lastDayOfCurrentMonthDayOfWeek });
  }

  const days = eachDayOfInterval({
    end: getLastDayOfCalendar(currentMonth),
    start: getFirstDayOfCalendar(currentMonth)
  });
  const weekDays: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div
      className={cn("bg-input h-fit scroll-m-24 select-none border-[1px] p-5 pt-3", {
        "border-red-500": error,
        "h-full w-full px-12 pb-5 pt-8": size === "large"
      })}
      onContextMenu={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
      ref={forwardedRef}
    >
      <div className="mx-auto w-full">
        <div
          className={cn("flex items-center py-0.5 pl-[3px]", {
            "mb-3 text-2xl": size === "large"
          })}
        >
          <h1
            className={cn("flex-auto text-md text-text-primary ", {
              "text-2xl": size === "large",
              "text-md": isViewMode
            })}
          >
            {format(firstDayCurrentMonth, "MMMM yyyy")}
          </h1>

          {isNextAndPrevButtonsVisible && (
            <>
              <Button
                className={cn("mb-0.5 h-[1.6rem] w-[1.6rem] rounded-[0.45rem] border-none px-[1px]", {
                  "h-5 w-5": isViewMode,
                  "h-7 w-7": size === "large"
                })}
                onClick={setPrevMonth}
                type="button"
                variant={isCurrentMonthEarliest ? "default-disabled" : "default"}
              >
                <span className="sr-only">Previous Columns</span>
                <ChevronLeft
                  className={cn("h-[1.2rem] w-[1.2rem] stroke-[3px] pr-[1px]", {
                    "h-4 w-4": isViewMode,
                    "h-5 w-5": size === "large"
                  })}
                />
              </Button>
              <Button
                className={cn("mb-0.5 ml-[5px] mr-1 h-[1.6rem] w-[1.6rem] rounded-[0.45rem] border-none px-[1px]", {
                  "h-5 w-5": isViewMode,
                  "ml-2 h-7 w-7": size === "large"
                })}
                onClick={setNextMonth}
                type="button"
                variant={isCurrentMonthLatest ? "default-disabled" : "default"}
              >
                <span className="sr-only">Next Columns</span>
                <ChevronRight
                  className={cn("h-[1.2rem] w-[1.2rem] stroke-[3px] pl-[1px]", {
                    "h-4 w-4": isViewMode,
                    "h-5 w-5": size === "large"
                  })}
                />
              </Button>
            </>
          )}
        </div>
        <hr className="mt-[0.1rem] h-[0.05rem] bg-text-light" />
        <div className="mt-3 grid grid-cols-7 text-center font-semibold leading-4 text-text-light">
          {weekDays.map((weekDay) => {
            return (
              <p
                className={cn("text-sm sm:text-[0.95rem]", {
                  "mb-4 mt-6 text-lg sm:text-lg": size === "large",
                  "text-xs sm:text-xs": isViewMode
                })}
                key={`calendar-weekday-${weekDay}`}
              >
                {weekDay}
              </p>
            );
          })}
        </div>

        <div className="mt-2 grid touch-none grid-cols-7">
          {days.map((day) => (
            <DateButton
              day={day}
              firstDayCurrentMonth={firstDayCurrentMonth}
              id={id}
              isViewMode={isViewMode}
              key={`calendar-day-button-${day}`}
              onMouseDragMove={onMouseDragMove}
              onMouseDragStart={onMouseDragStart}
              onTouchDragEnd={onTouchDragEnd}
              onTouchDragMove={onTouchDragMove}
              onTouchDragStart={onTouchDragStart}
              onViewModeDateClick={onViewModeDateClick}
              selectedDates={selectedDates}
              size={size}
              visibleEventDates={visibleEventDates}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDateCalendar;

function DateButton({
  day,
  firstDayCurrentMonth,
  id,
  isViewMode,
  onMouseDragMove,
  onMouseDragStart,
  onTouchDragEnd,
  onTouchDragMove,
  onTouchDragStart,
  onViewModeDateClick,
  selectedDates,
  size,
  visibleEventDates
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const formattedDay = format(day, EVENT_DATE_FORMAT);
  const formattedPrevDay = format(sub(day, { days: 1 }), EVENT_DATE_FORMAT);
  const formattedNextDay = format(add(day, { days: 1 }), EVENT_DATE_FORMAT);

  const isDaySelected = selectedDates.has(formattedDay);
  const isPrevDaySelected = selectedDates.has(formattedPrevDay);
  const isNextDaySelected = selectedDates.has(formattedNextDay);

  const isDayVisible = visibleEventDates?.includes(formattedDay);
  const isPrevDayVisible = visibleEventDates?.includes(formattedPrevDay);
  const isNextDayVisible = visibleEventDates?.includes(formattedNextDay);

  function isBeforeToday(date: Date) {
    return isBefore(date, startOfToday());
  }

  function handleMouseDown(e: MouseEvent) {
    if (!isLeftClick(e)) return;

    if (isViewMode) {
      if (selectedDates.has(formattedDay)) onViewModeDateClick(formattedDay);
    } else {
      if (!isBefore(parseISO(formattedDay), startOfToday()) || selectedDates.has(formattedDay))
        onMouseDragStart(formattedDay);
    }
  }
  function handleMouseEnter() {
    if (!isViewMode && !isBefore(parseISO(formattedDay), startOfToday())) onMouseDragMove(formattedDay);
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();

    const date = extractDragSelectData(e) as EventDate;
    if (isViewMode) {
      if (date !== null && selectedDates.has(date)) onViewModeDateClick(date);
    } else {
      if (date === null || !isBefore(parseISO(date), startOfToday())) onTouchDragStart(date);
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();

    const date = extractDragSelectData(e) as EventDate;
    if (!isViewMode && date !== null && !isBefore(parseISO(date), startOfToday())) onTouchDragMove(date);
  }

  function handleTouchEnd() {
    if (!isViewMode) onTouchDragEnd();
  }

  useRegisterNonPassiveTouchEvents({ onTouchMove: handleTouchMove, onTouchStart: handleTouchStart, ref: buttonRef });

  return (
    <Button
      className={cn(
        "my-[3px] flex h-[2.1rem] xl:h-[1.7rem] cursor-pointer touch-none items-center justify-center rounded-sm p-[1px] text-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        !isDaySelected
          ? {
              "border-transparent bg-input": true,
              "text-text-primary": isSameMonth(day, firstDayCurrentMonth),
              "bg-lime-200 hover:bg-lime-200/80": isToday(day),
              "text-text-light hover:text-light/80": !isToday(day) && !isSameMonth(day, firstDayCurrentMonth)
            }
          : {
              "bg-primary/70": !isSameMonth(day, firstDayCurrentMonth),
              "bg-secondary hover:bg-secondary/80": isToday(day),
              "ml-auto w-full rounded-r-none border-r-0": isNextDaySelected && day.getDay() !== 6,
              "mr-auto w-full rounded-l-none": isPrevDaySelected && day.getDay() !== 0,
              "rounded-l-sm": isNextDaySelected && !isPrevDaySelected,
              "rounded-r-sm": isPrevDaySelected && !isNextDaySelected
            },
        isDaySelected && {
          "border-lime-500 bg-lime-500 hover:bg-lime-500/80": isToday(day),
          "ml-auto w-full rounded-r-none border-r-0": isNextDaySelected && day.getDay() !== 6,
          "mr-auto w-full rounded-l-none": isPrevDaySelected && day.getDay() !== 0,
          "rounded-l-sm": isNextDaySelected && !isPrevDaySelected,
          "rounded-r-sm": isPrevDaySelected && !isNextDaySelected
        },
        isViewMode && {
          "text-text-light hover:bg-background": !isDaySelected,
          "text-xs": true
        },
        isViewMode &&
          !isDayVisible &&
          isDaySelected && {
            "bg-primary/40 hover:bg-primary/60": isToday(day),
            "border-l-0": !isPrevDayVisible && isPrevDaySelected && day.getDay() !== 0,
            "border-primary-light bg-accent-light text-secondary hover:bg-accent": true,
            "border-r-0": !isNextDayVisible && isNextDaySelected && day.getDay() !== 6
          },
        {
          "text-text-primary": isToday(day) && !isDaySelected,
          "my-[3px] h-6 px-2": isViewMode,
          "my-4 xl:h-[3.1rem] border-[1px] px-8 py-2 text-lg sm:text-lg": size === "large",
          "text-text-light pointer-events-none":
            !isViewMode && isBeforeToday(day) && !selectedDates.has(formattedDay)
        }
      )}
      drag-select-attr={formattedDay}
      id={id}
      key={`calendar-day-${day}`}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onTouchCancel={handleTouchEnd}
      onTouchEnd={handleTouchEnd}
      ref={buttonRef}
      type="button"
      variant={isDaySelected ? "default" : "outline"}
    >
      {format(day, "d")}
    </Button>
  );
}
