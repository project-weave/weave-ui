"use-client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfToday } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";

import DaysOfWeekPicker from "@/components/days-of-week-picker";
import EventDateCalendar, { MONTH_FORMAT } from "@/components/event-date-calendar";
import TimeDropdown from "@/components/new-event-from-time-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputWithLabel from "@/components/ui/input-with-label";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import useCreateEvent, { CreateEventRequest } from "@/hooks/requests/useCreateEvent";
import { AvailabilityType, EventForm, EventFormSchema } from "@/types/Event";
import { EventDate } from "@/types/Timeslot";
import { cn } from "@/utils/cn";

const EVENT_NAME_LABEL = "Event Name";

const WHAT_EVENT_NAME = "What is the name of your event?";
const WHAT_TIMES = "What times are you checking availability for?";
const WHAT_AVAILABILITY = "What availability do you want to know?";
const WHAT_TIMEZONE = "What is the timezone of your event?";
const I_WANT_TO_BE_NOTIFIED = "I want to be notified when there is a new availability inputted.";
const CREATE_EVENT = "Create Event";
const TO = "to";
const OR = "or";

export default function NewEventForm() {
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(format(startOfToday(), MONTH_FORMAT));
  const [selectedDates, setSelectedDates] = useState(new Set<EventDate>());
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(new Set<EventDate>());

  const isSubmitAttempted = useRef(false);
  const isSpecificDatesTouched = useRef(false);
  const isDaysOfTheWeekTouched = useRef(false);

  const nameInputRef = useRef<HTMLDivElement>(null);
  const timeRangeDropdownsRef = useRef<HTMLDivElement>(null);
  const specificDatesPickerRef = useRef<HTMLDivElement>(null);
  const daysOfWeekPickerRef = useRef<HTMLDivElement>(null);

  const { control, formState, getFieldState, handleSubmit, setValue, trigger, watch } = useForm<EventForm>({
    defaultValues: {
      availabilityType: AvailabilityType.SPECIFIC_DATES,
      daysOfTheWeek: new Set<EventDate>(),
      name: "",
      specificDates: new Set<EventDate>(),
      timeRange: {
        endTime: "21:00:00",
        startTime: "09:00:00"
      }
    },
    mode: "onChange",
    resolver: zodResolver(EventFormSchema)
  });

  const availabilityType = watch("availabilityType");

  // set value of "specificDates" when selectedDates changes
  // only trigger validation of "specificDates" if it has been modified or submit as been attempted
  useEffect(() => {
    setValue("specificDates", selectedDates);
    if (isSpecificDatesTouched.current || isSubmitAttempted.current) trigger("specificDates");
    if (selectedDates.size > 0 && !isSpecificDatesTouched.current) isSpecificDatesTouched.current = true;
  }, [setValue, trigger, selectedDates]);

  // set value of "daysOfTheWeek" when selectedDaysOfTheWeek changes
  // only trigger validation of "daysOfTheWeek" if it has been modified or submit as been attempted
  useEffect(() => {
    setValue("daysOfTheWeek", selectedDaysOfWeek);
    if (isDaysOfTheWeekTouched.current || isSubmitAttempted.current) trigger("daysOfTheWeek");
    if (selectedDaysOfWeek.size > 0 && !isDaysOfTheWeekTouched.current) isDaysOfTheWeekTouched.current = true;
  }, [setValue, trigger, selectedDaysOfWeek]);

  // trigger validation of specificDates and daysOfTheWeek if submit is already attempted
  useEffect(() => {
    switch (availabilityType) {
      case AvailabilityType.SPECIFIC_DATES:
        if (isSubmitAttempted.current) trigger("specificDates");
        break;
      case AvailabilityType.DAYS_OF_WEEK:
        if (isSubmitAttempted.current) trigger("daysOfTheWeek");
        break;
    }
  }, [availabilityType, selectedDates, selectedDaysOfWeek, trigger]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([form]) => {
        setIsFormInView(form.isIntersecting);
      },
      {
        root: null,
        threshold: 0.7
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

  const { toast } = useToast();
  const { isPending, mutate } = useCreateEvent();

  const formRef = useRef<HTMLFormElement>(null);
  const [isFormInView, setIsFormInView] = useState(false);

  function onInvalid(errors: FieldErrors) {
    if (errors.name && nameInputRef.current)
      return nameInputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

    if (errors.timeRange && timeRangeDropdownsRef.current)
      return timeRangeDropdownsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

    if (errors.specificDates && specificDatesPickerRef.current)
      return specificDatesPickerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

    if (errors.daysOfTheWeek && daysOfWeekPickerRef.current)
      return daysOfWeekPickerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSubmit({
    availabilityType,
    daysOfTheWeek,
    name,
    specificDates,
    timeRange: { endTime, startTime }
  }: EventForm) {
    let dates: EventDate[] = [];
    switch (availabilityType) {
      case AvailabilityType.SPECIFIC_DATES:
        dates = Array.from(specificDates);
        break;
      case AvailabilityType.DAYS_OF_WEEK:
        dates = Array.from(daysOfTheWeek);
        break;
    }

    const req: CreateEventRequest = {
      dates,
      endTime,
      isSpecificDates: availabilityType === AvailabilityType.SPECIFIC_DATES,
      name,
      startTime
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

  function FormInfo({ errorMessage }: { errorMessage: string | undefined }) {
    return <div className="ml-3 h-2 text-2xs text-red-600 whitespace-nowrap">{errorMessage}</div>;
  }

  const eventNameInput = (
    <>
      <p className="mb-2 text-xs font-medium text-secondary">{WHAT_EVENT_NAME}</p>
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value }, fieldState: { error, invalid } }) => (
          <>
            <InputWithLabel
              error={invalid}
              id="name"
              label={EVENT_NAME_LABEL}
              onBlur={onBlur}
              onChange={onChange}
              ref={nameInputRef}
              type="text"
              value={value}
            />
            <FormInfo errorMessage={error?.message} />
          </>
        )}
      />
    </>
  );

  const startAndEndTimeInput = (
    <>
      <p className="mb-3 text-xs font-medium text-secondary">{WHAT_TIMES}</p>
      <div className="flex mb-0.5 w-full items-center justify-between scroll-m-24" ref={timeRangeDropdownsRef}>
        <Controller
          control={control}
          name="timeRange.startTime"
          render={({ field: { onBlur, onChange, value } }) => (
            <>
              <TimeDropdown
                error={getFieldState("timeRange").invalid}
                isStartTime={true}
                onBlur={onBlur}
                onChange={(e) => {
                  onChange(e);
                  trigger("timeRange");
                }}
                selected={value}
              />
            </>
          )}
        />
        <p className="mx-6 text-2xs text-secondary"> {TO} </p>
        <Controller
          control={control}
          name="timeRange.endTime"
          render={({ field: { onBlur, onChange, value } }) => (
            <TimeDropdown
              error={getFieldState("timeRange").invalid}
              isStartTime={false}
              onBlur={onBlur}
              onChange={(e) => {
                onChange(e);
                trigger("timeRange");
              }}
              selected={value}
            />
          )}
        />
      </div>
      <FormInfo errorMessage={getFieldState("timeRange").error?.root?.message} />
    </>
  );

  const availabilityTypeInput = (
    <>
      <p className="mb-3 text-xs font-medium text-secondary">{WHAT_AVAILABILITY}</p>
      <fieldset className="flex w-full items-center justify-between">
        <div className="h-full w-full">
          <Input
            className="peer hidden"
            defaultChecked={true}
            id="specific-dates"
            name="availabilityType"
            onChange={() => setValue("availabilityType", AvailabilityType.SPECIFIC_DATES)}
            type="radio"
            value={AvailabilityType.SPECIFIC_DATES}
          />
          <Label
            className="text-secondary cursor-pointer font-medium rounded-md flex items-center py-1.5 justify-center w-full border-[1px] border-primary text-sm peer-checked:bg-primary peer-checked:text-white peer-checked:hover:bg-primary"
            htmlFor="specific-dates"
          >
            <span className="flex flex-col items-center">
              <div>Specific</div>
              <div>Dates</div>
            </span>
          </Label>
        </div>
        <p className="mx-6 text-xs text-secondary"> {OR} </p>
        <div className="h-full w-full">
          <Input
            className="peer hidden"
            id="dow"
            name="availabilityType"
            onChange={() => setValue("availabilityType", AvailabilityType.DAYS_OF_WEEK)}
            type="radio"
            value={AvailabilityType.DAYS_OF_WEEK}
          />
          <Label
            className="text-secondary cursor-pointer font-medium rounded-md flex items-center py-1.5 justify-center w-full border-[1px] border-primary text-sm peer-checked:bg-primary peer-checked:text-white peer-checked:hover:bg-primary"
            htmlFor="dow"
          >
            <span className="flex flex-col items-center">
              <div>Days Of</div>
              <div>The Week</div>
            </span>
          </Label>
        </div>
      </fieldset>
    </>
  );

  const dateSelector =
    availabilityType.toString() === AvailabilityType.SPECIFIC_DATES.toString() ? (
      <>
        <EventDateCalendar
          currentMonthOverride={currentCalendarMonth}
          error={getFieldState("specificDates").invalid}
          forwardedRef={specificDatesPickerRef}
          id="create-event-calendar-sm"
          isViewMode={false}
          key="create-event-calendar-sm"
          selectedDates={selectedDates}
          setCurrentMonthOverride={setCurrentCalendarMonth}
          setSelectedDates={setSelectedDates}
          size="small"
        />
        <FormInfo errorMessage={formState.errors.specificDates?.message} />
      </>
    ) : (
      <>
        <DaysOfWeekPicker
          error={getFieldState("daysOfTheWeek").invalid}
          ref={daysOfWeekPickerRef}
          selectedDaysOfWeek={selectedDaysOfWeek}
          setSelectedDaysOfWeek={setSelectedDaysOfWeek}
        />
        <FormInfo errorMessage={formState.errors.daysOfTheWeek?.message} />
      </>
    );

  const largeDateSelector =
    availabilityType.toString() === AvailabilityType.SPECIFIC_DATES.toString() ? (
      <>
        <EventDateCalendar
          currentMonthOverride={currentCalendarMonth}
          error={getFieldState("specificDates").invalid}
          id="create-event-calendar-lg"
          isViewMode={false}
          key="create-event-calendar-lg"
          selectedDates={selectedDates}
          setCurrentMonthOverride={setCurrentCalendarMonth}
          setSelectedDates={setSelectedDates}
          size="large"
        />
        <FormInfo errorMessage={formState.errors.specificDates?.message} />
      </>
    ) : (
      <>
        <DaysOfWeekPicker
          error={getFieldState("daysOfTheWeek").invalid}
          selectedDaysOfWeek={selectedDaysOfWeek}
          setSelectedDaysOfWeek={setSelectedDaysOfWeek}
          size="large"
        />
        <FormInfo errorMessage={formState.errors.daysOfTheWeek?.message} />
      </>
    );

  const formSubmissionButton = (
    <>
      <AnimatePresence>
        {isFormInView && (
          <motion.div
            animate="shiftUp"
            className={cn(
              "xs:hidden fixed bottom-0 left-0 flex w-full justify-center rounded-t-sm bg-white px-9 pb-6 pt-4 shadow-[0px_2px_2px_4px] shadow-gray-200"
            )}
            exit="shiftDown"
            initial="shiftDown"
            transition={{ ease: "easeInOut" }}
            variants={{
              shiftDown: { opacity: 0, translateY: 70 },
              shiftUp: { opacity: 1, translateY: 0 }
            }}
          >
            <Button
              className="h-12 w-full max-w-[26rem] rounded-xl border-primary text-sm"
              disabled={isSubmitAttempted.current && !formState.isValid}
              form="new-event-form"
              type="submit"
            >
              {isPending ? <Loader2 className="m-auto h-7 w-7 animate-spin text-white" /> : CREATE_EVENT}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        className="hidden xs:block h-12 w-full rounded-xl border-[1px] border-primary align-bottom text-sm"
        disabled={isSubmitAttempted.current && !formState.isValid}
        form="new-event-form"
        type="submit"
      >
        {isPending ? <Loader2 className="m-auto h-7 w-7 animate-spin py-0 text-white" /> : CREATE_EVENT}
      </Button>
    </>
  );

  return (
    <>
      <div className="flex select-none flex-row justify-center">
        <form
          autoComplete="off"
          className="card mx-auto flex h-full w-full min-w-[22rem] max-w-[26rem] flex-col sm:min-h-[36rem] sm:max-w-[30rem] md:mx-[1rem] xl:max-w-[26rem]"
          id="new-event-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            isSubmitAttempted.current = true;
            if (formState.isSubmitting || formState.isSubmitSuccessful) return;
            handleSubmit(onSubmit, onInvalid)();
          }}
          ref={formRef}
        >
          <div className="mb-4 flex flex-col">{eventNameInput}</div>
          <div className="mb-4 flex w-full flex-col">{startAndEndTimeInput}</div>
          <div className="mb-5 flex flex-col">{availabilityTypeInput}</div>
          <div className="mb-4">{dateSelector}</div>
          {/* {console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)}
          {console.log(Intl.supportedValuesOf("timeZone"))} 
          <p className="mb-6 text-xs font-medium text-secondary sm:mb-4">{WHAT_TIMEZONE}</p> */}
          {formSubmissionButton}
        </form>
        <div className="hidden w-[47rem] xl:block">{largeDateSelector}</div>
      </div>
      {/* add spacing on the bottom when button is fixed to bottom of*/}
      <div className={cn(isFormInView && "h-16 xs:h-0")} />
    </>
  );
}
