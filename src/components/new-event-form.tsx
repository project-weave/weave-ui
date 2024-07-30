import DaysOfWeekPicker from "@/components/days-of-week-picker";
import Calendar, { MONTH_FORMAT } from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import DropdownWithLabel from "@/components/ui/dropdown-with-label";
import InputWithLabel from "@/components/ui/input-with-label";
import useCreateEvent, { CreateEventRequest } from "@/hooks/requests/useCreateEvent";
import { MediaQueryXS, MediaQueryXXS, ScreenSize } from "@/hooks/useScreenSize";
import { AvailabilityType } from "@/store/availabilityGridStore";
import { EVENT_TIME_FORMAT, EventDate, EventTime } from "@/types/Event";
import { cn } from "@/utils/cn";
import { timeFilter } from "@/utils/date";
import { addMinutes, format, isBefore, isEqual, parse, startOfToday } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(format(startOfToday(), MONTH_FORMAT));
  const [selectedDates, setSelectedDates] = useState(new Set<EventDate>());
  const [availabilityType, setAvailabilityType] = useState(AvailabilityType.SPECIFIC_DATES);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(new Set<EventDate>());

  const [eventName, setEventName] = useState("");

  const [startTime, setStartTime] = useState<EventTime>("9:00 am");
  const [endTime, setEndTime] = useState<EventTime>("9:00 pm");

  const router = useRouter();
  const { toast } = useToast();
  const { isPending, mutate } = useCreateEvent();

  const formRef = useRef<HTMLFormElement>(null);
  const [isFormInView, setIsFormInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([form]) => {
        setIsFormInView(form.isIntersecting);
      },
      {
        root: null,
        threshold: 0.75
      }
    );
    const formElement = formRef.current;
    if (formElement) {
      observer.observe(formElement);
    }
    return () => {
      if (formElement) {
        observer.unobserve(formElement);
      }
    };
  }, []);

  const isTimeRangeValid = useMemo(() => {
    const parsedStartTime = parse(startTime, TIME_FORMAT, new Date());
    const parsedEndTime = parse(endTime, TIME_FORMAT, new Date());

    return !isBefore(parsedEndTime, parsedStartTime) && !isEqual(parsedEndTime, parsedStartTime);
  }, [startTime, endTime]);

  const isFormValid = useMemo(() => {
    return (
      eventName.trim() !== "" &&
      ((availabilityType === AvailabilityType.SPECIFIC_DATES && selectedDates.size > 0) ||
        (availabilityType === AvailabilityType.DAYS_OF_WEEK && selectedDaysOfWeek.size > 0)) &&
      isTimeRangeValid
    );
  }, [eventName, selectedDates, isTimeRangeValid, availabilityType, selectedDaysOfWeek]);

  function createEventHandler() {
    const parsedStartTime = parse(startTime, TIME_FORMAT, new Date());
    const parsedEndTime = parse(endTime, TIME_FORMAT, new Date());

    let dates = [...selectedDates];
    if (availabilityType === AvailabilityType.DAYS_OF_WEEK) {
      dates = Array.from(selectedDaysOfWeek);
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

    const times: EventTime[] = [];
    let currentTime = startTime;
    const interval = 30;

    while (currentTime <= endTime) {
      const formattedTime = format(currentTime, TIME_FORMAT).toLowerCase();
      times.push(formattedTime);
      currentTime = addMinutes(currentTime, interval);
    }

    return times;
  }

  // TODO: add actual media queries
  const formSubmissionButton = (
    <>
      <MediaQueryXXS maxScreenSize={ScreenSize.XS}>
        <AnimatePresence>
          {isFormInView && (
            <motion.div
              animate={{ translateY: 0 }}
              className={cn(
                "fixed bottom-0 left-0 flex w-full justify-center rounded-t-sm bg-white px-9 py-5 shadow-[0px_2px_6px_6px] shadow-gray-100 sm:hidden"
              )}
              exit={{ translateY: 70 }}
              initial={{ translateY: 50 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {isPending ? (
                <div className="flex justify-center">
                  <Loader2 className="h-11 w-11 animate-spin text-primary" />
                </div>
              ) : (
                <Button
                  className={cn(
                    "bottom-3 left-0 w-full max-w-[26rem] rounded-xl border-[1px] border-primary py-2 align-bottom text-sm "
                  )}
                  disabled={!isFormValid}
                  onClick={createEventHandler}
                  type="submit"
                >
                  {CREATE_EVENT}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </MediaQueryXXS>
      <MediaQueryXS>
        {isPending ? (
          <div className="flex justify-center">
            <Loader2 className="mt-3 h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <Button
            className="mt-3 h-auto w-full rounded-xl border-[1px] border-primary py-3 align-bottom text-sm "
            disabled={!isFormValid}
            onClick={createEventHandler}
            type="submit"
          >
            {CREATE_EVENT}
          </Button>
        )}
      </MediaQueryXS>
    </>
  );

  return (
    <div className="mb-10 flex select-none flex-row justify-center">
      <form
        autoComplete="off"
        className="card mx-auto flex h-full w-full min-w-[22rem] max-w-[26rem] flex-col sm:min-h-[36rem] sm:max-w-[30rem] md:mx-[1rem] xl:max-w-[26rem]"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        ref={formRef}
      >
        <div className="mb-4 flex flex-col md:mb-5">
          <p className="mb-3 text-xs font-medium text-secondary sm:mb-4">{WHAT_EVENT_NAME}</p>
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
          <p className="mb-3 text-xs font-medium text-secondary sm:mb-4">{WHAT_TIMES}</p>
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
            <p className="mx-6 text-2xs text-secondary"> {TO} </p>
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
        <div className="mb-5 flex flex-col  md:mb-6">
          <p className="mb-3 text-xs font-medium text-secondary">{WHAT_AVAILABILITY}</p>
          <div className="flex w-full items-center justify-between">
            <Button
              className={cn("h-auto w-full border-[1px] border-primary text-sm", {
                "hover:bg-primary": availabilityType === AvailabilityType.SPECIFIC_DATES
              })}
              onClick={() => setAvailabilityType(AvailabilityType.SPECIFIC_DATES)}
              type="button"
              variant={availabilityType === AvailabilityType.SPECIFIC_DATES ? "default" : "outline"}
            >
              <span className="leading-5">
                <div>Specific</div>
                <div>Dates</div>
              </span>
            </Button>
            <p className="mx-6 text-xs text-secondary"> {OR} </p>
            <Button
              className={cn("h-auto w-full border-[1px] border-primary text-sm", {
                "hover:bg-primary": availabilityType === AvailabilityType.DAYS_OF_WEEK
              })}
              onClick={() => setAvailabilityType(AvailabilityType.DAYS_OF_WEEK)}
              type="button"
              variant={availabilityType === AvailabilityType.DAYS_OF_WEEK ? "default" : "outline"}
            >
              <span className="leading-5">
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
        {formSubmissionButton}
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
