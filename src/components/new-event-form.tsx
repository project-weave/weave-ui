"use-client";
import DaysOfWeekPicker from "@/components/days-of-week-picker";
import EventDateCalendar, { MONTH_FORMAT } from "@/components/event-date-calendar";
import { Button } from "@/components/ui/button";
import InputWithLabel from "@/components/ui/input-with-label";
import useCreateEvent, { CreateEventRequest } from "@/hooks/requests/useCreateEvent";
import { ScreenSize } from "@/hooks/useScreenSize";
import { AvailabilityType } from "@/store/availabilityGridStore";
import { EVENT_TIME_FORMAT, EventDate, EventTime } from "@/types/Event";
import { cn } from "@/utils/cn";
import { format, isBefore, isEqual, parse, startOfToday } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { MediaQueryXS, MediaQueryXXS } from "./media-query";
import TimeDropdown, { DROPDOWN_TIME_FORMAT, NEXT_DAY_MIDNIGHT_REPRESENTATION } from "./new-event-from-time-dropdown";
import { useToast } from "./ui/use-toast";

const EVENT_NAME_LABEL = "Event Name";

const WHAT_EVENT_NAME = "What is the name of your event?";
const WHAT_TIMES = "What times are you checking availability for?";
const WHAT_AVAILABILITY = "What availability do you want to know?";
const I_WANT_TO_BE_NOTIFIED = "I want to be notified when there is a new availability inputted.";
const CREATE_EVENT = "Create Event";
const TO = "to";
const OR = "or";

export default function NewEventForm() {
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(format(startOfToday(), MONTH_FORMAT));
  const [selectedDates, setSelectedDates] = useState(new Set<EventDate>());
  const [availabilityType, setAvailabilityType] = useState(AvailabilityType.SPECIFIC_DATES);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(new Set<EventDate>());

  const [eventName, setEventName] = useState("");

  const [startTime, setStartTime] = useState<EventTime>("9:00 am");
  const [endTime, setEndTime] = useState<EventTime>("9:00 pm");

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
    if (endTime === NEXT_DAY_MIDNIGHT_REPRESENTATION) return true;

    const parsedStartTime = parse(startTime, DROPDOWN_TIME_FORMAT, startOfToday());
    const parsedEndTime = parse(endTime, DROPDOWN_TIME_FORMAT, startOfToday());

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

  function onSubmit() {
    const parsedStartTime = parse(startTime, DROPDOWN_TIME_FORMAT, startOfToday());
    const parsedEndTime =
      endTime === NEXT_DAY_MIDNIGHT_REPRESENTATION
        ? parse("12:00 am", "h:mm a", startOfToday())
        : parse(endTime, DROPDOWN_TIME_FORMAT, startOfToday());

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
      onSuccess: () => {
        setTimeout(() => {
          toast({
            description: "Your event has been successfully created.",
            title: "Congrats!",
            variant: "success"
          });
        }, 1000);
      }
    });
  }

  const formSubmissionButton = (
    <>
      <MediaQueryXXS maxScreenSize={ScreenSize.XS}>
        {isFormInView && (
          <>
            <AnimatePresence>
              <motion.div
                animate={{ translateY: 0 }}
                className={cn(
                  "fixed bottom-0 left-0 flex w-full justify-center rounded-t-sm bg-white px-9 pb-6 pt-4 shadow-[0px_2px_2px_4px] shadow-gray-200"
                )}
                exit={{ translateY: 70 }}
                initial={{ translateY: 50 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Button
                  className="h-12 w-full max-w-[26rem] rounded-xl border-primary text-sm"
                  disabled={!isFormValid}
                  type="submit"
                >
                  {isPending ? <Loader2 className="m-auto h-7 w-7 animate-spin text-white" /> : CREATE_EVENT}
                </Button>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </MediaQueryXXS>
      <MediaQueryXS>
        <Button
          className="h-12 w-full rounded-xl border-[1px] border-primary align-bottom text-sm"
          disabled={!isFormValid}
          type="submit"
        >
          {isPending ? <Loader2 className="m-auto h-7 w-7 animate-spin py-0 text-white" /> : CREATE_EVENT}
        </Button>
      </MediaQueryXS>
    </>
  );

  return (
    <>
      <div className="flex select-none flex-row justify-center">
        <form
          autoComplete="off"
          className="card mx-auto flex h-full w-full min-w-[22rem] max-w-[26rem] flex-col sm:min-h-[36rem] sm:max-w-[30rem] md:mx-[1rem] xl:max-w-[26rem]"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
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
              <TimeDropdown
                error={!isTimeRangeValid}
                isStartTime={true}
                selectedTime={startTime}
                setSelectedTime={setStartTime}
              />
              <p className="mx-6 text-2xs text-secondary"> {TO} </p>
              <TimeDropdown
                error={!isTimeRangeValid}
                isStartTime={false}
                selectedTime={endTime}
                setSelectedTime={setEndTime}
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
          <div className="mb-6 h-[20.5rem]">
            {availabilityType === AvailabilityType.SPECIFIC_DATES ? (
              <EventDateCalendar
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
            <EventDateCalendar
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
      {/* add spacing on the bottom when button is fixed to bottom of*/}
      {isFormInView && (
        <MediaQueryXXS maxScreenSize={ScreenSize.XS}>
          <div className="h-20" />
        </MediaQueryXXS>
      )}
    </>
  );
}
