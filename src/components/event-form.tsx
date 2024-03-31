import DaysOfWeekPicker from "@/components/days-of-week-picker";
import Calendar from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DropdownWithLabel from "@/components/ui/dropdown-with-label";
import InputWithLabel from "@/components/ui/input-with-label";
import { timeFilter } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import useAvailabilityGridStore, { AvailabilityType, EventTime } from "@/store/availabilityGridStore";
import { EventDate } from "@/store/availabilityGridStore";
import { addMinutes, format, isBefore, isEqual, parse } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

const TIME_FORMAT = "h:mm a";

type EventFormProps = {
  availabilityType: AvailabilityType;
  currentCalendarMonth: string;
  selectedDates: Set<EventDate>;
  selectedDaysOfWeek: Set<EventDate>;
  setAvailabilityType: Dispatch<SetStateAction<AvailabilityType>>;
  setCurrentCalendarMonth: Dispatch<SetStateAction<string>>;
  setSelectedDates: Dispatch<SetStateAction<Set<EventDate>>>;
  setSelectedDaysOfWeek: Dispatch<SetStateAction<Set<EventDate>>>;
};

export default function EventForm({
  availabilityType,
  currentCalendarMonth,
  selectedDates,
  selectedDaysOfWeek,
  setAvailabilityType,
  setCurrentCalendarMonth,
  setSelectedDates,
  setSelectedDaysOfWeek
}: EventFormProps) {
  const router = useRouter();

  const [eventName, setEventName] = useState("");

  const [startTime, setStartTime] = useState<EventTime>("9:00 am");
  const [endTime, setEndTime] = useState<EventTime>("9:00 pm");

  const [isFormValid, setIsFormValid] = useState(false);
  const [isTimeRangeValid, setIsTimeRangeValid] = useState(true);

  const setSpecificDatesEvent = useAvailabilityGridStore((state) => state.setSpecificDatesEvent);
  const setDaysOfTheWeekEvent = useAvailabilityGridStore((state) => state.setDaysOfTheWeekEvent);

  const [submitClicked, setSubmitClicked] = useState(false);

  useEffect(() => {
    const parsedStartTime = parse(startTime, TIME_FORMAT, new Date());
    const parsedEndTime = parse(endTime, TIME_FORMAT, new Date());

    if (isBefore(parsedEndTime, parsedStartTime) || isEqual(parsedEndTime, parsedStartTime)) {
      setIsTimeRangeValid(false);
    } else {
      setIsTimeRangeValid(true);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (
      eventName.trim() === "" ||
      (availabilityType === AvailabilityType.SPECIFIC_DATES && selectedDates.size === 0) ||
      (availabilityType === AvailabilityType.DAYS_OF_WEEK && selectedDaysOfWeek.size === 0) ||
      !isTimeRangeValid
    ) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
    }
  }, [eventName, selectedDates, isTimeRangeValid, availabilityType, selectedDaysOfWeek]);

  function createEventHandler() {
    const parsedStartTime = parse(startTime, TIME_FORMAT, new Date());
    const parsedEndTime = parse(endTime, TIME_FORMAT, new Date());

    if (availabilityType === AvailabilityType.SPECIFIC_DATES) {
      setSpecificDatesEvent(
        eventName,
        format(parsedStartTime, "HH:mm:ss"),
        format(parsedEndTime, "HH:mm:ss"),
        Array.from(selectedDates)
      );
    } else {
      setDaysOfTheWeekEvent(
        eventName,
        format(parsedStartTime, "HH:mm:ss"),
        format(parsedEndTime, "HH:mm:ss"),
        Array.from(selectedDaysOfWeek)
      );
    }
    router.push("/123");
    setSubmitClicked(true);
  }

  function possibleTimes() {
    const startTime = new Date(0, 0, 0, 0, 0);
    const endTime = new Date(0, 0, 0, 23, 30);

    const times = [];
    let currentTime = startTime;
    const interval = 30;

    while (currentTime <= endTime) {
      const formattedTime = format(currentTime, TIME_FORMAT).toLowerCase();
      times.push(formattedTime);
      currentTime = addMinutes(currentTime, interval);
    }

    return times;
  }

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
            <DropdownWithLabel
              emptyOptionText={"Invalid time"}
              error={!isTimeRangeValid}
              filterFunc={timeFilter}
              label={START_TIME_LABEL}
              options={possibleTimes()}
              selected={startTime}
              setSelected={setStartTime}
            />
            <p className="mx-6 text-xs text-secondary"> {TO} </p>
            <DropdownWithLabel
              emptyOptionText={"Invalid time"}
              error={!isTimeRangeValid}
              filterFunc={timeFilter}
              label={END_TIME_LABEL}
              options={possibleTimes()}
              selected={endTime}
              setSelected={setEndTime}
            />
          </div>
        </div>
        <div className="mb-6 flex flex-col text-sm">
          <p className="mb-4 text-xs font-medium text-secondary"> {WHAT_AVAILABILITY} </p>
          <div className="flex w-full items-center">
            <Button
              className={cn("leading-0 h-auto w-full border-[1px] border-primary text-sm", {
                "hover:bg-primary": availabilityType === AvailabilityType.SPECIFIC_DATES
              })}
              onClick={() => setAvailabilityType(AvailabilityType.SPECIFIC_DATES)}
              type="button"
              variant={availabilityType === AvailabilityType.SPECIFIC_DATES ? "default" : "outline"}
            >
              {SPECIFIC_DATES}
            </Button>
            <p className="mx-6 text-xs text-secondary"> {OR} </p>
            <Button
              className={cn("leading-0 h-auto w-full border-[1px] border-primary text-sm", {
                "hover:bg-primary": availabilityType === AvailabilityType.DAYS_OF_WEEK
              })}
              onClick={() => setAvailabilityType(AvailabilityType.DAYS_OF_WEEK)}
              type="button"
              variant={availabilityType === AvailabilityType.DAYS_OF_WEEK ? "default" : "outline"}
            >
              {DAYS_OF_WEEK}
            </Button>
          </div>
        </div>
        <div className="mb-4 flex-grow">
          {availabilityType === AvailabilityType.SPECIFIC_DATES ? (
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

        {submitClicked ? (
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <Button
            className="mt-3 h-auto w-full rounded-2xl border-[1px] border-primary py-4 align-bottom"
            disabled={!isFormValid}
            onClick={createEventHandler}
            type="submit"
          >
            {CREATE_EVENT}
          </Button>
        )}
      </form>
    </div>
  );
}
