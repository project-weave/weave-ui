"use client";
import useDragSelect from "@/hooks/useDragSelect";
import { cn } from "@/lib/utils";
import { EventDate } from "@/store/availabilityGridStore";
import { EVENT_DATE_FORMAT } from "@/store/availabilityGridStore";
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
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

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

const EventDateCalendar = ({
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
}: EventDateCalendarProps) => {
  const today = startOfToday();

  let defaultMonth = isViewMode ? format(parseISO(earliestSelectedDate), MONTH_FORMAT) : format(today, MONTH_FORMAT);
  if (currentMonthOverride !== undefined) {
    defaultMonth = currentMonthOverride;
  }
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);

  const {
    onMouseDown: onDragSelectMouseDown,
    onMouseEnter: onDragSelectMouseEnter,
    onMouseUp: onDragSelectMouseUp
  } = useDragSelect<EventDate>(selectedDates, setSelectedDates!);

  useEffect(() => {
    if (currentMonthOverride !== undefined) {
      setCurrentMonth(currentMonthOverride);
    }
  }, [currentMonthOverride]);

  const days = eachDayOfInterval({
    end: getLastDayOfCalendar(currentMonth),
    start: getFirstDayOfCalendar(currentMonth)
  });

  function getFirstDayOfCalendar(currentMonth: string): Date {
    const firstDayCurrentMonth = parse(currentMonth, MONTH_FORMAT, today);
    const firstDayCurrentMonthDayOfWeek = getDay(firstDayCurrentMonth);
    return sub(firstDayCurrentMonth, { days: firstDayCurrentMonthDayOfWeek });
  }

  function getLastDayOfCalendar(currentMonth: string): Date {
    const firstDayCurrentMonth = parse(currentMonth, MONTH_FORMAT, today);
    const lastDayOfCurrentMonth = endOfMonth(firstDayCurrentMonth);
    const lastDayOfCurrentMonthDayOfWeek = getDay(lastDayOfCurrentMonth);
    return add(lastDayOfCurrentMonth, { days: 6 - lastDayOfCurrentMonthDayOfWeek });
  }

  function handleMouseDown(day: EventDate) {
    if (isViewMode) {
      if (selectedDates.has(day)) {
        onViewModeDateClick(day);
      }
    } else {
      if (!isBefore(parseISO(day), today)) {
        onDragSelectMouseDown(day);
      }
    }
  }
  function handleMouseEnter(day: EventDate) {
    if (!isViewMode && !isBefore(parseISO(day), today)) {
      onDragSelectMouseEnter(day);
    }
  }
  function handleMouseUp() {
    if (!isViewMode) {
      onDragSelectMouseUp();
    }
  }

  const firstDayCurrentMonth = parse(currentMonth, MONTH_FORMAT, today);

  const earliestMonth = earliestSelectedDate ? format(parseISO(earliestSelectedDate), MONTH_FORMAT) : "";
  const isCurrentMonthEarliest = isViewMode
    ? earliestMonth === currentMonth
    : format(today, MONTH_FORMAT) === currentMonth;

  const latestdMonth = latestSelectedDate ? format(parseISO(latestSelectedDate), MONTH_FORMAT) : "";
  const isCurrentMonthLatest = latestdMonth === currentMonth;

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

  const colStartClasses: string[] = [
    "col-start-1",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7"
  ];

  const MotionButton = motion(Button);

  return (
    <div
      className={cn("card select-none border-2 px-5 py-3", {
        "h-full w-full px-12 pb-5 pt-8": size === "large"
      })}
      onContextMenu={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      <div className="mx-auto w-full">
        <div
          className={cn("flex items-center px-[1px]", {
            "mb-4 text-2xl": size === "large"
          })}
        >
          <h1 className="flex-auto font-semibold text-secondary">{format(firstDayCurrentMonth, "MMMM yyyy")}</h1>
          <MotionButton
            className={cn("ml-1 h-4 rounded-[.4rem] border-none px-[1px]", {
              "mr-1 h-7 w-7": size === "large"
            })}
            onClick={setPrevMonth}
            variant={isCurrentMonthEarliest ? "default-disabled" : "default"}
            whileTap={!isCurrentMonthEarliest ? { scale: 0.88 } : {}}
          >
            <span className="sr-only">Previous Columns</span>
            <ChevronLeft
              className={cn("h-4 w-4 stroke-[3px]", {
                "h-7 w-7": size === "large"
              })}
            />
          </MotionButton>

          <MotionButton
            className={cn("ml-1 h-4 rounded-[.4rem] border-none px-[1px]", {
              "h-7 w-7": size === "large"
            })}
            onClick={setNextMonth}
            variant={isCurrentMonthLatest ? "default-disabled" : "default"}
            whileTap={!isCurrentMonthLatest ? { scale: 0.88 } : {}}
          >
            <span className="sr-only">Next Columns</span>
            <ChevronRight
              className={cn("h-4 w-4 stroke-[3px]", {
                "h-7 w-7": size === "large"
              })}
            />
          </MotionButton>
        </div>
        <hr className="mt-[2px] h-[0.1rem] bg-primary-dark" />
        <div
          className={cn("mt-3 grid grid-cols-7 text-center text-sm font-semibold leading-4 text-secondary-light", {
            "mb-4 mt-6 text-xl": size === "large"
          })}
        >
          {weekDays.map((weekDay) => {
            return (
              <p className={cn("mx-[1.5px]")} key={`calendar-weekday-${weekDay}`}>
                {weekDay}
              </p>
            );
          })}
        </div>

        <div className="mt-2 grid grid-cols-7 text-sm">
          {days.map((day, dayIndex) => {
            const formattedDay = format(day, EVENT_DATE_FORMAT);
            const formattedPrevDay = format(sub(day, { days: 1 }), EVENT_DATE_FORMAT);
            const formattedNextDay = format(add(day, { days: 1 }), EVENT_DATE_FORMAT);

            const isDaySelected = selectedDates.has(formattedDay);
            const isPrevDaySelected = selectedDates.has(formattedPrevDay);
            const isNextDaySelected = selectedDates.has(formattedNextDay);

            const isDayVisible = visibleEventDates?.includes(formattedDay);
            const isPrevDayVisible = visibleEventDates?.includes(formattedPrevDay);
            const isNextDayVisible = visibleEventDates?.includes(formattedNextDay);

            const isFirstVisibleDay = visibleEventDates?.[0] === formattedDay;
            const isBeforeToday = isBefore(day, today);

            return (
              <div
                className={cn(dayIndex === 0 ? colStartClasses[getDay(day)] : "", size === "large" ? "py-5" : "py-1")}
                id={id}
                key={`calendar-day-${formattedDay}`}
              >
                <Button
                  className={cn(
                    "flex h-full w-full cursor-pointer items-center justify-center rounded-full border-2 border-primary-light/30 p-0 text-sm font-semibold outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                    {
                      "border-[1px] px-8 py-2 text-lg": size === "large"
                    },
                    !isDaySelected && {
                      "border-transparent bg-background": true,
                      "font-bold text-primary-dark": isToday(day),
                      "text-secondary": !isToday(day) && isSameMonth(day, firstDayCurrentMonth),
                      "text-secondary-light hover:text-secondary":
                        !isToday(day) && !isSameMonth(day, firstDayCurrentMonth)
                    },
                    isDaySelected && {
                      "bg-secondary hover:bg-secondary/80": isToday(day),
                      "ml-auto w-full rounded-r-none border-r-0": isNextDaySelected && day.getDay() !== 6,
                      "mr-auto w-full rounded-l-none": isPrevDaySelected && day.getDay() !== 0,
                      "rounded-l-full": isNextDaySelected && !isPrevDaySelected,
                      "rounded-r-full": isPrevDaySelected && !isNextDaySelected
                    },
                    !isViewMode && {
                      "text-gray-200 hover:bg-background hover:text-gray-200": isBeforeToday
                    },
                    isViewMode && {
                      "border-2 border-secondary/80": isFirstVisibleDay,
                      "hover:bg-background": !isDaySelected
                    },
                    isViewMode &&
                      !isDayVisible &&
                      isDaySelected && {
                        "bg-primary/40 hover:bg-primary/60": isToday(day),
                        "border-l-0": !isPrevDayVisible && isPrevDaySelected && day.getDay() !== 0,
                        "border-primary-light bg-accent-light text-secondary hover:bg-accent": true,
                        "border-r-0": !isNextDayVisible && isNextDaySelected && day.getDay() !== 6
                      }
                  )}
                  onMouseDown={() => handleMouseDown(formattedDay)}
                  onMouseEnter={() => handleMouseEnter(formattedDay)}
                  type="button"
                  variant={isDaySelected ? "default" : "outline"}
                >
                  <time dateTime={formattedDay}>{format(day, "d")}</time>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(EventDateCalendar);
