"use client";
import { cn } from "@/lib/utils";
import { EventDate } from "@/store/availabilityGridStore";
import { EVENT_DATE_FORMAT } from "@/store/availabilityGridStore";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
  sub
} from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

import { Button } from "./ui/button";

type EventDateCalendarViewModeProps = {
  earliestSelectedDate: EventDate;
  id: string;
  isViewMode: true;
  latestSelectedDate: EventDate;
  onViewModeDateClick: (date: EventDate) => void;
  selected: EventDate[];
  visibleEventDates: EventDate[];
};

type EventDateCalendarEditModeProps = {
  earliestSelectedDate?: never;
  id: string;
  isViewMode: false;
  latestSelectedDate?: never;
  onViewModeDateClick?: never;
  selected: EventDate[];
  visibleEventDates?: never;
};

type EventDateCalendarProps = EventDateCalendarEditModeProps | EventDateCalendarViewModeProps;

export const MONTH_FORMAT = "yyyy-MM";

const EventDateCalendar = ({
  earliestSelectedDate,
  id,
  isViewMode,
  latestSelectedDate,
  onViewModeDateClick,
  selected,
  visibleEventDates
}: EventDateCalendarProps) => {
  const today = startOfToday();

  const defaultMonth = isViewMode ? format(parseISO(earliestSelectedDate), MONTH_FORMAT) : format(today, MONTH_FORMAT);

  const [selectedDates, setSelectedDates] = useState(new Set(selected));
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);
  const [isDragging, setIsDragging] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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
      setIsDragging(true);
      setSelectedDates((prevDates) => {
        const newSelected = new Set(prevDates);
        if (selectedDates.has(day)) {
          setIsAdding(false);
          newSelected.delete(day);
        } else {
          setIsAdding(true);
          newSelected.add(day);
        }
        return newSelected;
      });
    }
  }

  function handleMouseEnter(day: EventDate) {
    if (isViewMode || !isDragging || (selectedDates.has(day) && isAdding) || (!selectedDates.has(day) && !isAdding)) {
      return;
    }
    setSelectedDates((prevDates) => {
      const newSelected = new Set(prevDates);
      if (selectedDates.has(day) && !isAdding) {
        newSelected.delete(day);
      } else {
        newSelected.add(day);
      }
      return newSelected;
    });
  }

  function handleMouseUp() {
    if (isViewMode) return;
    setIsDragging(false);
  }

  const firstDayCurrentMonth = parse(currentMonth, MONTH_FORMAT, today);
  const earliestSelectedMonth = earliestSelectedDate ? format(parseISO(earliestSelectedDate), MONTH_FORMAT) : "";
  const isCurrentMonthEarliest = earliestSelectedMonth === currentMonth;

  const latestSelectedMonth = latestSelectedDate ? format(parseISO(latestSelectedDate), MONTH_FORMAT) : "";
  const isCurrentMonthLatest = latestSelectedMonth === currentMonth;

  function setPrevMonth() {
    if (isViewMode && isCurrentMonthEarliest) return;

    const firstDayPrevMonth = sub(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayPrevMonth, MONTH_FORMAT));
  }

  function setNextMonth() {
    if (isViewMode && isCurrentMonthLatest) return;

    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, MONTH_FORMAT));
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
      className="box-border select-none rounded-lg border-2 border-primary bg-background px-5 py-2"
      onContextMenu={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      <div className="mx-auto w-full">
        <div className="grid">
          <div>
            <div className="flex items-center px-[1px]">
              <h1 className="flex-auto font-semibold text-secondary">{format(firstDayCurrentMonth, "MMMM yyyy")}</h1>
              <MotionButton
                className="ring-none ml-2 h-4 rounded-[.4rem] border-none p-[1px]"
                onClick={setPrevMonth}
                variant={isCurrentMonthEarliest ? "default-disabled" : "default"}
                whileTap={!isCurrentMonthEarliest ? { scale: 0.88 } : {}}
              >
                <span className="sr-only">Previous Columns</span>
                <ChevronLeft className="h-4 w-4 stroke-[3px]" />
              </MotionButton>

              <MotionButton
                className="ml-1 h-4 rounded-[.4rem] border-none px-[1px]"
                onClick={setNextMonth}
                variant={isCurrentMonthLatest ? "default-disabled" : "default"}
                whileTap={!isCurrentMonthLatest ? { scale: 0.88 } : {}}
              >
                <span className="sr-only">Next Columns</span>
                <ChevronRight className="h-4 w-4 stroke-[3px]" />
              </MotionButton>
            </div>
            <hr className="mt-[2px] h-[0.1rem] bg-primary-dark" />
            <div className="mt-3 grid grid-cols-7 text-center text-sm font-semibold leading-4 text-secondary-light ">
              {weekDays.map((weekDay) => {
                return (
                  <p className="mx-[1.5px]" key={`calendar-weekday-${weekDay}`}>
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

                return (
                  <div
                    className={cn(dayIndex === 0 ? colStartClasses[getDay(day)] : "", "py-1")}
                    id={id}
                    key={`calendar-day-${formattedDay}`}
                  >
                    <Button
                      className={cn(
                        "flex h-full w-full select-none items-center justify-center rounded-full border-2 border-transparent p-0 text-sm font-semibold outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                        !isDaySelected && {
                          "bg-white": true,
                          "text-gray-300": !isToday(day) && !isSameMonth(day, firstDayCurrentMonth),
                          "text-primary-dark": isToday(day),
                          "text-secondary": !isToday(day) && isSameMonth(day, firstDayCurrentMonth)
                        },
                        isDaySelected && {
                          "bg-secondary": isToday(day),
                          "ml-auto w-full rounded-r-none": isNextDaySelected && day.getDay() !== 6,
                          "mr-auto w-full rounded-l-none": isPrevDaySelected && day.getDay() !== 0,
                          "rounded-l-full": isNextDaySelected && !isPrevDaySelected,
                          "rounded-r-full": isPrevDaySelected && !isNextDaySelected
                        },
                        isViewMode && {
                          "border-secondary/80": isFirstVisibleDay,
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
      </div>
    </div>
  );
};

export default React.memo(EventDateCalendar);
