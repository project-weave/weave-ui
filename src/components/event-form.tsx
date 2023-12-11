"use client";
import { EventType } from "@/app/(event)/new/page";
import DaysOfWeekPicker from "@/components/days-of-week-picker";
import Calendar from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import InputWithLabel from "@/components/ui/input-with-label";
import TimeInputWithLabel from "@/components/ui/time-input-with-label";
import { cn } from "@/lib/utils";
import { EventDate } from "@/store/availabilityGridStore";
import { isBefore, isEqual, parse } from "date-fns";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const EVENT_NAME_LABEL = "Event Name";
const START_TIME_LABEL = "Start Time";
const END_TIME_LABEL = "End Time";

const DAYS_OF_WEEK = "Days of The Week";
const SPECIFIC_DATES = "Specific Dates";
const WHAT_EVENT_NAME = "What is the name of your event?";
const WHAT_TIMES = "What times work for you?";
const WHAT_AVAILABILITY = "What availability do you want to know?";
const I_WANT_TO_BE_NOTIFIED = "I want to be notified when there is a new availbility inputted.";
const CREATE_EVENT = "Create Event";
const TO = "to";
const OR = "or";

type EventFormProps = {
  currentCalendarMonth: string;
  eventType: EventType;
  selectedDates: Set<EventDate>;
  selectedDaysOfWeek: Set<EventDate>;
  setCurrentCalendarMonth: Dispatch<SetStateAction<string>>;
  setEventType: Dispatch<SetStateAction<EventType>>;
  setSelectedDates: Dispatch<SetStateAction<Set<EventDate>>>;
  setSelectedDaysOfWeek: Dispatch<SetStateAction<Set<EventDate>>>;
};

export default function EventForm({
  currentCalendarMonth,
  eventType,
  selectedDates,
  selectedDaysOfWeek,
  setCurrentCalendarMonth,
  setEventType,
  setSelectedDates,
  setSelectedDaysOfWeek
}: EventFormProps) {
  const [eventName, setEventName] = useState("");

  const [startTimeHour, setStartTimeHour] = useState("9");
  const [startTimeMinute, setStartTimeMinute] = useState("00");
  const [startTimeAmPm, setStartTimeAmPm] = useState("am");

  const [endTimeHour, setEndTimeHour] = useState("9");
  const [endTimeMinute, setEndTimeMinute] = useState("00");
  const [endTimeAmPm, setEndTimeAmPm] = useState("pm");

  const [isFormValid, setIsFormValid] = useState(false);
  const [isTimeRangeValid, setIsTimeRangeValid] = useState(true);

  useEffect(() => {
    const startTime = parse(`${startTimeHour}:${startTimeMinute} ${startTimeAmPm}`, "h:mm a", new Date());
    const endtime = parse(`${endTimeHour}:${endTimeMinute} ${endTimeAmPm}`, "h:mm a", new Date());

    if (isBefore(endtime, startTime) || isEqual(endtime, startTime)) {
      setIsTimeRangeValid(false);
    } else {
      setIsTimeRangeValid(true);
    }
  }, [startTimeAmPm, startTimeHour, startTimeMinute, endTimeAmPm, endTimeHour, endTimeMinute]);

  useEffect(() => {
    if (
      eventName.trim() === "" ||
      (eventType === EventType.SPECIFIC_DATES && selectedDates.size === 0) ||
      (eventType === EventType.DAYS_OF_WEEK && selectedDaysOfWeek.size === 0) ||
      !isTimeRangeValid
    ) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
    }
  }, [eventName, selectedDates, isTimeRangeValid, eventType, selectedDaysOfWeek]);

  return (
    <div className="card flex h-full flex-col">
      <form
        autoComplete="off"
        className="flex h-full flex-col"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="mb-4 flex flex-col text-sm">
          <p className="mb-4 text-xs font-medium text-secondary"> {WHAT_EVENT_NAME} </p>
          <InputWithLabel
            id="event-name"
            label={EVENT_NAME_LABEL}
            onBlur={(e) => {
              setEventName(e.target.value.trim());
            }}
            onChange={(e) => {
              setEventName(e.target.value);
            }}
            type="text"
            value={eventName}
          />
        </div>

        <div className="mb-4 flex flex-col text-sm">
          <p className="mb-4 text-xs font-medium text-secondary"> {WHAT_TIMES} </p>
          <div className="flex w-full items-center">
            <TimeInputWithLabel
              ampm={startTimeAmPm}
              hour={startTimeHour}
              id="start-time"
              label={START_TIME_LABEL}
              minute={startTimeMinute}
              setAmPm={setStartTimeAmPm}
              setHour={setStartTimeHour}
              setMinute={setStartTimeMinute}
              variant={isTimeRangeValid ? "default" : "error"}
            />
            <p className="mx-6 text-xs text-secondary"> {TO} </p>
            <TimeInputWithLabel
              ampm={endTimeAmPm}
              hour={endTimeHour}
              id="end-time"
              label={END_TIME_LABEL}
              minute={endTimeMinute}
              setAmPm={setEndTimeAmPm}
              setHour={setEndTimeHour}
              setMinute={setEndTimeMinute}
              variant={isTimeRangeValid ? "default" : "error"}
            />
          </div>
        </div>

        <div className="mb-6 flex flex-col text-sm">
          <p className="mb-4 text-xs font-medium text-secondary"> {WHAT_AVAILABILITY} </p>
          <div className="flex w-full items-center">
            <Button
              className={cn("leading-0 h-auto w-full border-[1px] border-primary text-sm", {
                "hover:bg-primary": eventType === EventType.SPECIFIC_DATES
              })}
              onClick={() => setEventType(EventType.SPECIFIC_DATES)}
              type="button"
              variant={eventType === EventType.SPECIFIC_DATES ? "default" : "outline"}
            >
              {SPECIFIC_DATES}
            </Button>
            <p className="mx-6 text-xs text-secondary"> {OR} </p>
            <Button
              className={cn("leading-0 h-auto w-full border-[1px] border-primary text-sm", {
                "hover:bg-primary": eventType === EventType.DAYS_OF_WEEK
              })}
              onClick={() => setEventType(EventType.DAYS_OF_WEEK)}
              type="button"
              variant={eventType === EventType.DAYS_OF_WEEK ? "default" : "outline"}
            >
              {DAYS_OF_WEEK}
            </Button>
          </div>
        </div>

        <div className="mb-4 flex-grow">
          {eventType === EventType.SPECIFIC_DATES ? (
            <Calendar
              currentMonthOverride={currentCalendarMonth}
              id="create-event-calendar-sm"
              isViewMode={false}
              selectedDates={selectedDates}
              setCurrentMonthOverride={setCurrentCalendarMonth}
              setSelectedDates={setSelectedDates}
              size="small"
            />
          ) : (
            <DaysOfWeekPicker selectedDaysOfWeek={selectedDaysOfWeek} setSelectedDaysOfWeek={setSelectedDaysOfWeek} />
          )}
        </div>

        {/* <div className="mb-2 ml-1 flex items-center text-sm">
              <Checkbox className="h-4 w-4" id="avail-notif" />
              <label className="ml-2 pt-0 text-xs text-secondary" htmlFor="avail-notif">
                {I_WANT_TO_BE_NOTIFIED}
              </label>
            </div> */}

        <Button
          className="mt-3 h-auto w-full rounded-2xl border-[1px] border-primary py-4 align-bottom"
          disabled={!isFormValid}
          type="submit"
        >
          {CREATE_EVENT}
        </Button>
      </form>
    </div>
  );
}
