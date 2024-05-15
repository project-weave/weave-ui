import DaysOfWeekPicker from "@/components/days-of-week-picker";
import Calendar, { MONTH_FORMAT } from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import DropdownWithLabel from "@/components/ui/dropdown-with-label";
import InputWithLabel from "@/components/ui/input-with-label";
import useCreateEvent, { CreateEventRequest } from "@/hooks/requests/useCreateEvent";
import useToday from "@/hooks/useToday";
import {
  AvailabilityType,
  DAYS_OF_WEEK_DATES,
  EVENT_TIME_FORMAT,
  EventDate,
  EventTime
} from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { timeFilter } from "@/utils/date";
import { addMinutes, format, isBefore, isEqual, parse } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useToast } from "./ui/use-toast";

const EVENT_NAME_LABEL = "Event Name";
const START_TIME_LABEL = "Start Time";
const END_TIME_LABEL = "End Time";

const WHAT_EVENT_NAME = "What is the name of your event?";
const WHAT_TIMES = "What times are you checking availability for?";
const WHAT_AVAILABILITY = "What availability do you want to know?";
const I_WANT_TO_BE_NOTIFIED = "I want to be notified when there is a new availability inputted.";
const CREATE_EVENT = "Create Event";
const TO = "to";
const OR = "or";

const TIME_FORMAT = "h:mm a";

export default function NewEventForm() {
  const today = useToday();

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(format(today, MONTH_FORMAT));
  const [selectedDates, setSelectedDates] = useState(new Set<EventDate>());
  const [availabilityType, setAvailabilityType] = useState(AvailabilityType.SPECIFIC_DATES);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(new Set<EventDate>());

  const [eventName, setEventName] = useState("");

  const [startTime, setStartTime] = useState<EventTime>("9:00 am");
  const [endTime, setEndTime] = useState<EventTime>("9:00 pm");

  const [isFormValid, setIsFormValid] = useState(false);
  const [isTimeRangeValid, setIsTimeRangeValid] = useState(true);

  const router = useRouter();
  const { toast } = useToast();
  const { isPending, mutate } = useCreateEvent();

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

    let dates = [...selectedDates];
    if (availabilityType === AvailabilityType.DAYS_OF_WEEK) {
      dates = DAYS_OF_WEEK_DATES;
    }
    const req: CreateEventRequest = {
      dates,
      endTime: format(parsedEndTime, EVENT_TIME_FORMAT),
      isSpecificDates: availabilityType === AvailabilityType.SPECIFIC_DATES ? true : false,
      name: eventName.trim(),
      startTime: format(parsedStartTime, EVENT_TIME_FORMAT)
    };

    mutate(req, {
      onError: () => {
        toast({
          description: "An error occurred while creating your event. Please try again later.",
          title: "Oh no! Something went wrong.",
          variant: "failure"
        });
      },
      onSuccess: (data) => {
        toast({
          description: "Your event has been successfully created.",
          title: "Congrats!",
          variant: "success"
        });
        router.push(`/${data.eventId}`);
      }
    });
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
    <div className="mb-10 flex select-none flex-row justify-center">
      <form
        autoComplete="off"
        className="card mx-auto flex h-full w-full min-w-[22rem] max-w-[24rem] flex-col sm:min-h-[36rem] sm:max-w-[30rem] md:mx-[1rem] xl:max-w-[26rem]"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="mb-4 flex flex-col md:mb-5">
          <p className="mb-2 text-2xs font-medium text-secondary sm:mb-3 sm:text-xs md:mb-4 md:text-[.8rem]">
            {WHAT_EVENT_NAME}
          </p>
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
        <div className="mb-4 flex w-full flex-col md:mb-5">
          <p className="mb-2 text-2xs font-medium text-secondary sm:mb-3 sm:text-xs md:mb-4 md:text-[.8rem]">
            {" "}
            {WHAT_TIMES}{" "}
          </p>
          <div className="flex w-full items-center justify-between">
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
        <div className="mb-5 flex flex-col text-sm md:mb-6">
          <p className="mb-2 text-2xs font-medium  text-secondary sm:text-xs md:mb-3 md:text-[.8rem]">
            {WHAT_AVAILABILITY}
          </p>
          <div className="flex w-full items-center justify-between">
            <Button
              className={cn(
                "xs:text-xs h-auto w-full border-[1px] border-primary text-2xs sm:text-xs md:text-[.8rem]",
                {
                  "hover:bg-primary": availabilityType === AvailabilityType.SPECIFIC_DATES
                }
              )}
              onClick={() => setAvailabilityType(AvailabilityType.SPECIFIC_DATES)}
              type="button"
              variant={availabilityType === AvailabilityType.SPECIFIC_DATES ? "default" : "outline"}
            >
              <span className="leading-4 sm:leading-5">
                <div>Specific</div>
                <div>Dates</div>
              </span>
            </Button>
            <p className="mx-6 text-xs text-secondary"> {OR} </p>
            <Button
              className={cn(
                "xs:text-xs h-auto w-full border-[1px] border-primary text-2xs sm:text-xs md:text-[.8rem]",
                {
                  "hover:bg-primary": availabilityType === AvailabilityType.DAYS_OF_WEEK
                }
              )}
              onClick={() => setAvailabilityType(AvailabilityType.DAYS_OF_WEEK)}
              type="button"
              variant={availabilityType === AvailabilityType.DAYS_OF_WEEK ? "default" : "outline"}
            >
              <span className="leading-4 sm:leading-5">
                <div>Days Of</div>
                <div>The Week</div>
              </span>
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

        {isPending ? (
          <div className="flex justify-center">
            <Loader2 className="mt-3 h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <Button
            className="mt-3 h-auto w-full rounded-2xl border-[1px] border-primary py-4 align-bottom text-2xs sm:text-xs md:text-sm"
            disabled={!isFormValid}
            onClick={createEventHandler}
            type="submit"
          >
            {CREATE_EVENT}
          </Button>
        )}
      </form>

      <div className="hidden w-[47rem] xl:block">
        {availabilityType === AvailabilityType.SPECIFIC_DATES ? (
          <Calendar
            currentMonthOverride={currentCalendarMonth}
            id="create-event-calendar-lg"
            isViewMode={false}
            selectedDates={selectedDates}
            setCurrentMonthOverride={setCurrentCalendarMonth}
            setSelectedDates={setSelectedDates}
            size="large"
          />
        ) : (
          <DaysOfWeekPicker
            selectedDaysOfWeek={selectedDaysOfWeek}
            setSelectedDaysOfWeek={setSelectedDaysOfWeek}
            size="large"
          />
        )}
      </div>
    </div>
  );
}
