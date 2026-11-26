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
import { Dispatch, LegacyRef, MouseEvent, SetStateAction, useEffect, useRef, useState } from "react";

import useDragSelect, { extractDragSelectData } from "@/hooks/useDragSelect";
import useRegisterNonPassiveTouchEvents from "@/hooks/useRegisterNonPassiveTouchEvents";
import { EVENT_DATE_FORMAT, EventDate } from "@/types/Timeslot";
import { cn } from "@/utils/cn";
import { isLeftClick } from "@/utils/mouseEvent";

import { Button } from "./ui/button";
import NavArrowButton from "./ui/nav-arrow-button";

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

  function activateDate(date: EventDate) {
    if (isViewMode) {
      if (selectedDates.has(date)) onViewModeDateClick(date);
    } else if (!isBefore(parseISO(date), startOfToday()) || selectedDates.has(date)) {
      setSelectedDates((previous) => {
        const next = new Set(previous);
        if (next.has(date)) next.delete(date);
        else next.add(date);
        return next;
      });
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
  // Every size below is a multiple of --u. The small calendar uses --u = 16px; the large one is the very same
  // calendar scaled up to fit its card (same proportions, same square-ish days), using container units.
  const weekDayClassName = cn("text-[calc(var(--u)*0.875)] sm:text-[calc(var(--u)*0.95)]", {
    "text-xs sm:text-xs": isViewMode
  });
  const isLarge = size === "large";

  return (
    <div
      aria-invalid={error || undefined}
      className={cn(
        "select-none scroll-m-24",
        isLarge
          ? "card flex h-full w-full items-center justify-center bg-white p-0 [container-type:size]"
          : "h-fit rounded-xl bg-field"
      )}
      onContextMenu={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
      ref={forwardedRef}
    >
      <div
        className={cn(
          "w-full px-[calc(var(--u)*1.25)] pb-[calc(var(--u)*1.25)] pt-[calc(var(--u)*0.75)]",
          isLarge
            ? // the small calendar is about 18.9 x 18.7 units: scale it to the largest size that fits the card
              "w-[calc(var(--u)*18.9)] [--u:min(calc(100cqw/18.9),calc(100cqh/18.7))]"
            : "[--u:1rem]"
        )}
      >
        {/* The month title starts exactly where "Sun" starts and the arrows end exactly where "Sat" ends:
            the header uses the same 7 columns as the days, with an invisible "Sun"/"Sat" to measure against. */}
        <div className="grid h-[calc(var(--u)*2)] grid-cols-7 items-center">
          <div className="flex justify-center">
            <span className="relative">
              <span aria-hidden="true" className={cn(weekDayClassName, "invisible")}>
                Sun
              </span>
              <h2
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[length:var(--u)] text-black",
                  isViewMode && "text-md"
                )}
              >
                {format(firstDayCurrentMonth, "MMMM yyyy")}
              </h2>
            </span>
          </div>
          <div className="col-start-7 flex justify-center">
            <span className="relative">
              <span aria-hidden="true" className={cn(weekDayClassName, "invisible")}>
                Sat
              </span>
              {isNextAndPrevButtonsVisible && (
                <span className="absolute right-0 top-1/2 flex -translate-y-1/2 gap-[calc(var(--u)*0.375)]">
                  <NavArrowButton
                    className={NAV_ARROW_SIZE}
                    direction="previous"
                    disabled={isCurrentMonthEarliest}
                    label="Previous month"
                    onClick={setPrevMonth}
                  />
                  <NavArrowButton
                    className={NAV_ARROW_SIZE}
                    direction="next"
                    disabled={isCurrentMonthLatest}
                    label="Next month"
                    onClick={setNextMonth}
                  />
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="mt-[calc(var(--u)*0.75)] grid grid-cols-7 text-center font-normal leading-[var(--u)] text-text-light">
          {weekDays.map((weekDay) => {
            return (
              <p className={weekDayClassName} key={`calendar-weekday-${weekDay}`}>
                {weekDay}
              </p>
            );
          })}
        </div>

        <div className="mt-[calc(var(--u)*0.5)] grid touch-none grid-cols-7">
          {days.map((day) => (
            <DateButton
              day={day}
              firstDayCurrentMonth={firstDayCurrentMonth}
              id={id}
              isViewMode={isViewMode}
              key={`calendar-day-button-${day}`}
              onKeyboardActivate={activateDate}
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

// month arrows scale with the calendar too
const NAV_ARROW_SIZE =
  "h-[calc(var(--u)*2)] w-[calc(var(--u)*2)] rounded-[calc(var(--u)*0.625)] [&_svg]:h-[var(--u)] [&_svg]:w-[var(--u)]";

function DateButton({
  day,
  firstDayCurrentMonth,
  id,
  isViewMode,
  onKeyboardActivate,
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
      aria-label={format(day, "EEEE, MMMM d, yyyy")}
      aria-pressed={isViewMode ? !!isDayVisible : isDaySelected}
      className={cn(
        "my-[calc(var(--u)*0.1875)] flex h-[calc(var(--u)*1.7)] cursor-pointer touch-none items-center justify-center rounded-[calc(var(--u)*0.5)] p-[1px] text-[calc(var(--u)*0.875)] font-normal outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        !isDaySelected
          ? {
              "border-transparent": true,
              "bg-field": size !== "large",
              "bg-white": size === "large",
              "text-black": isSameMonth(day, firstDayCurrentMonth),
              // today is marked in red when picking dates, but not on the event page where it's just a distraction
              "bg-red text-white hover:bg-red/80": isToday(day) && !isViewMode,
              "hover:text-light/80 text-text-light":
                (isViewMode || !isToday(day)) && !isSameMonth(day, firstDayCurrentMonth)
            }
          : {
              "bg-primary/70": !isSameMonth(day, firstDayCurrentMonth),
              "ml-auto w-full rounded-r-none border-r-0": isNextDaySelected && day.getDay() !== 6,
              "mr-auto w-full rounded-l-none": isPrevDaySelected && day.getDay() !== 0,
              "rounded-l-[calc(var(--u)*0.5)]": isNextDaySelected && !isPrevDaySelected,
              "rounded-r-[calc(var(--u)*0.5)]": isPrevDaySelected && !isNextDaySelected
            },
        isDaySelected && {
          // selected days in a row join into one continuous bar: no visible borders between them
          "border-transparent": true,
          "ml-auto w-full rounded-r-none border-r-0": isNextDaySelected && day.getDay() !== 6,
          "mr-auto w-full rounded-l-none border-l-0": isPrevDaySelected && day.getDay() !== 0,
          "rounded-l-[calc(var(--u)*0.5)]": isNextDaySelected && !isPrevDaySelected,
          "rounded-r-[calc(var(--u)*0.5)]": isPrevDaySelected && !isNextDaySelected
        },
        isViewMode && {
          "bg-primary": isDaySelected,
          "pointer-events-none opacity-20 hover:bg-background": !isDaySelected,
          "text-xs": true
        },
        isViewMode &&
          !isDayVisible &&
          isDaySelected && {
            "border-l-0": !isPrevDayVisible && isPrevDaySelected && day.getDay() !== 0,
            "bg-secondary text-black hover:bg-secondary hover:opacity-80": true,
            "border-r-0": !isNextDayVisible && isNextDaySelected && day.getDay() !== 6
          },
        {
          "pointer-events-none opacity-20": !isViewMode && isBeforeToday(day) && !selectedDates.has(formattedDay)
        }
      )}
      disabled={isViewMode ? !isDaySelected : isBeforeToday(day) && !isDaySelected}
      drag-select-attr={formattedDay}
      id={`${id}-${formattedDay}`}
      key={`calendar-day-${day}`}
      onClick={(event) => {
        if (event.detail === 0) onKeyboardActivate(formattedDay);
      }}
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
