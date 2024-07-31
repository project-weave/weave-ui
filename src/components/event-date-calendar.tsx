"use client";
import useDragSelect from "@/hooks/useDragSelect";
import { EVENT_DATE_FORMAT, EventDate } from "@/types/Event";
import { cn } from "@/utils/cn";
import { isLeftClick } from "@/utils/mouseEvent";
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
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { Dispatch, MouseEvent, SetStateAction, useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";

type EventDateCalendarViewModeProps = {
  currentMonthOverride?: string;
  earliestSelectedDate: EventDate;
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

type EventDateCalendarProps = EventDateCalendarEditModeProps | EventDateCalendarViewModeProps;

export const MONTH_FORMAT = "yyyy-MM";

export default function EventDateCalendar({
  currentMonthOverride,
  earliestSelectedDate,
  id,
  isViewMode,
  latestSelectedDate,
  onViewModeDateClick,
  selectedDates,
  setCurrentMonthOverride,
  setSelectedDates,
  size,
  visibleEventDates
}: EventDateCalendarProps) {
  const dragSelectContainerRef = useRef<HTMLDivElement>(null);

  let defaultMonth = isViewMode
    ? format(parseISO(earliestSelectedDate), MONTH_FORMAT)
    : format(startOfToday(), MONTH_FORMAT);
  if (currentMonthOverride !== undefined) {
    defaultMonth = currentMonthOverride;
  }
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);

  const { onMouseDragEnd, onMouseDragMove, onMouseDragStart, onTouchDragEnd, onTouchDragMove, onTouchDragStart } =
    useDragSelect<EventDate>(selectedDates, setSelectedDates!, dragSelectContainerRef);

  useEffect(() => {
    if (currentMonthOverride !== undefined) {
      setCurrentMonth(currentMonthOverride);
    }
  }, [currentMonthOverride]);

  const isBeforeToday = (date: Date) => isBefore(date, startOfToday());

  const days = eachDayOfInterval({
    end: getLastDayOfCalendar(currentMonth),
    start: getFirstDayOfCalendar(currentMonth)
  });

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

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[e.touches.length - 1];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    const touchedElement = document.elementFromPoint(touchX, touchY);
    const date: EventDate | null = touchedElement?.getAttribute("drag-select-attr") || null;

    if (isViewMode) {
      if (date !== null && selectedDates.has(date)) {
        onViewModeDateClick(date);
      }
    } else {
      if (date === null || !isBefore(parseISO(date), startOfToday())) {
        onTouchDragStart(date);
      }
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    const touch = e.touches[e.touches.length - 1];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    const touchedElement = document.elementFromPoint(touchX, touchY);
    const date: EventDate | null = touchedElement?.getAttribute("drag-select-attr") || null;

    if (!isViewMode && date !== null && !isBefore(parseISO(date), startOfToday())) {
      onTouchDragMove(date);
    }
  }

  function handleMouseEnter(day: EventDate) {
    if (!isViewMode && !isBefore(parseISO(day), startOfToday())) {
      onMouseDragMove(day);
    }
  }

  function handleMouseDown(day: EventDate) {
    if (isViewMode) {
      if (selectedDates.has(day)) {
        onViewModeDateClick(day);
      }
    } else {
      if (!isBefore(parseISO(day), startOfToday()) || selectedDates.has(day)) {
        onMouseDragStart(day);
      }
    }
  }

  function handleTouchEnd() {
    if (!isViewMode) {
      onTouchDragEnd();
    }
  }

  function handleMouseUp() {
    if (!isViewMode) {
      onMouseDragEnd();
    }
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

  const weekDays: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const MotionButton = motion(Button);

  return (
    <div
      className={cn("card border-1 h-fit select-none p-5 pt-3", {
        "h-full w-full px-12 pb-5 pt-8": size === "large"
      })}
      onContextMenu={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      <div className="mx-auto w-full">
        <div
          className={cn("flex items-center py-0.5 pl-[3px]", {
            "mb-3 text-2xl": size === "large"
          })}
        >
          <h1
            className={cn("flex-auto text-lg font-semibold text-secondary ", {
              "text-2xl": size === "large",
              "text-md": isViewMode
            })}
          >
            {format(firstDayCurrentMonth, "MMMM yyyy")}
          </h1>

          {isNextAndPrevButtonsVisible && (
            <>
              <MotionButton
                className={cn("mb-0.5 h-[1.4rem] w-[1.4rem] rounded-[0.45rem] border-none px-[1px]", {
                  "h-5 w-5": isViewMode,
                  "h-7 w-7": size === "large"
                })}
                onClick={setPrevMonth}
                variant={isCurrentMonthEarliest ? "default-disabled" : "default"}
                whileTap={!isCurrentMonthEarliest ? { scale: 0.95 } : {}}
              >
                <span className="sr-only">Previous Columns</span>
                <ChevronLeft
                  className={cn("h-[1.1rem] w-[1.1rem] stroke-[3px]", {
                    "h-4 w-4": isViewMode,
                    "h-5 w-5": size === "large"
                  })}
                />
              </MotionButton>
              <MotionButton
                className={cn("mb-0.5 ml-[5px] mr-1 h-[1.4rem] w-[1.4rem] rounded-[0.45rem] border-none px-[1px]", {
                  "h-5 w-5": isViewMode,
                  "ml-2 h-7 w-7": size === "large"
                })}
                onClick={setNextMonth}
                variant={isCurrentMonthLatest ? "default-disabled" : "default"}
                whileTap={!isCurrentMonthLatest ? { scale: 0.95 } : {}}
              >
                <span className="sr-only">Next Columns</span>
                <ChevronRight
                  className={cn("h-[1.1rem] w-[1.1rem] stroke-[3px]", {
                    "h-4 w-4": isViewMode,
                    "h-5 w-5": size === "large"
                  })}
                />
              </MotionButton>
            </>
          )}
        </div>
        <hr className="mt-[0.1rem] h-[0.1rem] bg-primary" />
        <div className="mt-3 grid grid-cols-7 text-center font-semibold leading-4 text-secondary-light">
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

        <div className="mt-2 grid grid-cols-7" ref={dragSelectContainerRef}>
          {days.map((day) => {
            const formattedDay = format(day, EVENT_DATE_FORMAT);
            const formattedPrevDay = format(sub(day, { days: 1 }), EVENT_DATE_FORMAT);
            const formattedNextDay = format(add(day, { days: 1 }), EVENT_DATE_FORMAT);

            const isDaySelected = selectedDates.has(formattedDay);
            const isPrevDaySelected = selectedDates.has(formattedPrevDay);
            const isNextDaySelected = selectedDates.has(formattedNextDay);

            const isDayVisible = visibleEventDates?.includes(formattedDay);
            const isPrevDayVisible = visibleEventDates?.includes(formattedPrevDay);
            const isNextDayVisible = visibleEventDates?.includes(formattedNextDay);

            return (
              <Button
                className={cn(
                  "my-[3px] flex h-[1.9rem] cursor-pointer items-center justify-center rounded-full border-2 border-primary-light/30 p-[1px] text-sm font-semibold outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  !isDaySelected
                    ? {
                        "border-transparent bg-background": true,
                        "text-secondary": isSameMonth(day, firstDayCurrentMonth),
                        "text-secondary-light hover:text-secondary":
                          !isToday(day) && !isSameMonth(day, firstDayCurrentMonth)
                      }
                    : {
                        "bg-primary/70": !isSameMonth(day, firstDayCurrentMonth),
                        "bg-secondary hover:bg-secondary/80": isToday(day),
                        "ml-auto w-full rounded-r-none border-r-0": isNextDaySelected && day.getDay() !== 6,
                        "mr-auto w-full rounded-l-none": isPrevDaySelected && day.getDay() !== 0,
                        "rounded-l-full": isNextDaySelected && !isPrevDaySelected,
                        "rounded-r-full": isPrevDaySelected && !isNextDaySelected
                      },
                  isDaySelected && {
                    "border-secondary bg-secondary hover:bg-secondary/80": isToday(day),
                    "ml-auto w-full rounded-r-none border-r-0": isNextDaySelected && day.getDay() !== 6,
                    "mr-auto w-full rounded-l-none": isPrevDaySelected && day.getDay() !== 0,
                    "rounded-l-full": isNextDaySelected && !isPrevDaySelected,
                    "rounded-r-full": isPrevDaySelected && !isNextDaySelected
                  },
                  isViewMode && {
                    "text-secondary opacity-40 hover:bg-background": !isDaySelected,
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
                    "font-bold text-primary": isToday(day) && !isDaySelected,
                    "my-[3px] h-6 px-2": isViewMode,
                    "my-4 h-14 border-[1px] px-8 py-2 text-lg sm:text-lg": size === "large",
                    "text-gray-200 hover:bg-background hover:text-gray-200":
                      !isViewMode && isBeforeToday(day) && !selectedDates.has(formattedDay)
                  }
                )}
                drag-select-attr={formattedDay}
                id={id}
                key={`calendar-day-${day}`}
                onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                  if (!isLeftClick(e)) return;
                  handleMouseDown(formattedDay);
                }}
                onMouseEnter={() => handleMouseEnter(formattedDay)}
                onTouchCancel={handleTouchEnd}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchStart}
                type="button"
                variant={isDaySelected ? "default" : "outline"}
              >
                {format(day, "d")}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
