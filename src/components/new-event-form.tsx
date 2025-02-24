"use-client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfToday } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";

import DaysOfWeekPicker from "@/components/days-of-week-picker";
import { MONTH_FORMAT } from "@/components/event-date-calendar";
import TimeDropdown from "@/components/new-event-from-time-dropdown";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputWithLabel from "@/components/ui/input-with-label";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import useCreateEvent, { CreateEventRequest } from "@/hooks/requests/useCreateEvent";
import useElementInView from "@/hooks/useElementInView";
import { AvailabilityType, EventForm, EventFormSchema } from "@/types/Event";
import { EventDate } from "@/types/Timeslot";
import { cn } from "@/utils/cn";

import EventDateCalendar from "./no-ssr-event-date-calendar";
import TimeZoneDropdown from "./timezone-dropdown";

const EVENT_NAME_LABEL = "Event Name";

const EVENT_NAME = "What is the name of your event?";
const WHAT_TIMES = "What times work for you?";
const WHAT_AVAILABILITY = "What availability do you want to know?";
const WHAT_TIME_ZONE = "What time zone works for you?";
const I_WANT_TO_BE_NOTIFIED = "I want to be notified when there is a new availability inputted.";
const CREATE_EVENT = "Create Event";
const TO = "to";
const OR = "or";

export default function NewEventForm() {
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(format(startOfToday(), MONTH_FORMAT));
  const [selectedDates, setSelectedDates] = useState(new Set<EventDate>());
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(new Set<EventDate>());

  const isSubmitAttempted = useRef(false);
  const nameInputRef = useRef<HTMLDivElement>(null);
  const timeRangeDropdownsRef = useRef<HTMLDivElement>(null);
  const specificDatesPickerRef = useRef<HTMLDivElement>(null);
  const daysOfWeekPickerRef = useRef<HTMLDivElement>(null);

  const form = useForm<EventForm>({
    defaultValues: {
      availabilityType: AvailabilityType.SPECIFIC_DATES,
      daysOfTheWeek: new Set<EventDate>(),
      name: "",
      specificDates: new Set<EventDate>(),
      timeRange: {
        endTime: "21:00:00",
        startTime: "09:00:00"
      },
      timeZone: "America/Vancouver"
    },
    mode: "onSubmit",
    resolver: zodResolver(EventFormSchema)
  });

  const availabilityType = form.watch("availabilityType");

  // set value of "specificDates" when selectedDates changes
  // only trigger validation of "specificDates" if it has been modified or submit as been attempted
  useEffect(() => {
    form.setValue("specificDates", selectedDates);
    if (isSubmitAttempted.current) form.trigger("specificDates");
  }, [selectedDates]);

  // set value of "daysOfTheWeek" when selectedDaysOfTheWeek changes
  // only trigger validation of "daysOfTheWeek" if it has been modified or submit as been attempted
  useEffect(() => {
    form.setValue("daysOfTheWeek", selectedDaysOfWeek);
    if (isSubmitAttempted.current) form.trigger("daysOfTheWeek");
  }, [selectedDaysOfWeek]);

  // trigger validation of specificDates and daysOfTheWeek if submit is already attempted
  useEffect(() => {
    switch (availabilityType) {
      case AvailabilityType.SPECIFIC_DATES:
        if (isSubmitAttempted.current) form.trigger("specificDates");
        break;
      case AvailabilityType.DAYS_OF_WEEK:
        if (isSubmitAttempted.current) form.trigger("daysOfTheWeek");
        break;
    }
  }, [availabilityType]);

  const formRef = useRef<HTMLFormElement>(null);
  const isFormInView = useElementInView(formRef);

  const { toast } = useToast();
  const { isPending, mutate } = useCreateEvent();

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
    timeRange: { endTime, startTime },
    timeZone
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
      startTime,
      timeZone
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
            description: (
              <span>
                Your event has been successfully created. We&apos;d love to hear your feedback! Please{" "}
                <a
                  href="https://forms.gle/m6vyA7ifEcgtA1vL6"
                  rel="noopener noreferrer"
                  style={{ color: "#9747ff", textDecoration: "underline" }}
                  target="_blank"
                >
                  fill out this form
                </a>
                .
              </span>
            ),
            title: "Congrats!",
            variant: "success"
          });
        }, 1000);
      }
    });
  }

  const eventNameInput = (
    <FormField
      control={form.control}
      name="name"
      render={({ field, fieldState: { invalid } }) => (
        <FormItem>
          <FormLabel>{EVENT_NAME}</FormLabel>
          <div className="mt-1.5">
            <InputWithLabel
              {...field}
              error={invalid}
              id="name"
              label={EVENT_NAME_LABEL}
              ref={nameInputRef}
              type="text"
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const startAndEndTimeInput = (
    <FormField
      control={form.control}
      name="timeRange"
      render={() => (
        <FormItem>
          <FormLabel>{WHAT_TIMES}</FormLabel>
          <div
            className="flex mb-0.5 w-full mt-2 items-center justify-between scroll-m-24 space-y-1"
            ref={timeRangeDropdownsRef}
          >
            <FormField
              control={form.control}
              name="timeRange.startTime"
              render={({ field: { onBlur, onChange, value } }) => (
                <FormItem className="w-full">
                  <TimeDropdown
                    error={form.getFieldState("timeRange").invalid}
                    isStartTime={true}
                    onBlur={onBlur}
                    onChange={(e) => {
                      onChange(e);
                      if (isSubmitAttempted.current) form.trigger("timeRange");
                    }}
                    selected={value}
                  />
                </FormItem>
              )}
            />
            <p className="mx-6 text-2xs text-secondary"> {TO} </p>
            <FormField
              control={form.control}
              name="timeRange.endTime"
              render={({ field: { onBlur, onChange, value } }) => (
                <FormItem className="w-full">
                  <TimeDropdown
                    error={form.getFieldState("timeRange").invalid}
                    isStartTime={false}
                    onBlur={onBlur}
                    onChange={(e) => {
                      onChange(e);
                      if (isSubmitAttempted.current) form.trigger("timeRange");
                    }}
                    selected={value}
                  />
                </FormItem>
              )}
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const availabilityTypeInput = (
    <>
      <p className="mb-3 text-xs font-medium text-text-light">{WHAT_AVAILABILITY}</p>
      <fieldset className="flex p-1 rounded-xl w-full items-center justify-between bg-input">
        <div className="h-full w-full">
          <Input
            className="peer hidden"
            defaultChecked={true}
            id="specific-dates"
            name="availabilityType"
            onChange={() => form.setValue("availabilityType", AvailabilityType.SPECIFIC_DATES)}
            type="radio"
            value={AvailabilityType.SPECIFIC_DATES}
          />
          <Label
            className="text-text-light cursor-pointer font-medium rounded-sm flex items-center py-1.5 justify-center w-full text-sm peer-checked:bg-primary peer-checked:text-white peer-checked:hover:bg-primary"
            htmlFor="specific-dates"
          >
            <span className="flex flex-col items-center">
              <div>Specific dates</div>
            </span>
          </Label>
        </div>
        {/* <p className="mx-6 text-xs text-secondary"> {OR} </p> */}
        <div className="h-full w-full">
          <Input
            className="peer hidden"
            id="dow"
            name="availabilityType"
            onChange={() => {
              form.setValue("availabilityType", AvailabilityType.DAYS_OF_WEEK);
            }}
            type="radio"
            value={AvailabilityType.DAYS_OF_WEEK}
          />
          <Label
            className="text-text-light cursor-pointer font-medium rounded-sm flex items-center py-1.5 justify-center w-full text-sm peer-checked:bg-primary peer-checked:text-white peer-checked:hover:bg-primary"
            htmlFor="dow"
          >
            <span className="flex flex-col items-center">
              <div>Days of the week</div>
            </span>
          </Label>
        </div>
      </fieldset>
    </>
  );

  const dateSelector =
    availabilityType.toString() === AvailabilityType.SPECIFIC_DATES.toString() ? (
      <FormField
        control={form.control}
        name="specificDates"
        render={({ fieldState: { invalid } }) => (
          <FormItem>
            <EventDateCalendar
              currentMonthOverride={currentCalendarMonth}
              error={invalid}
              forwardedRef={specificDatesPickerRef}
              id="create-event-calendar-sm"
              isViewMode={false}
              key="create-event-calendar-sm"
              selectedDates={selectedDates}
              setCurrentMonthOverride={setCurrentCalendarMonth}
              setSelectedDates={setSelectedDates}
              size="small"
            />
            <FormMessage />
          </FormItem>
        )}
      />
    ) : (
      <FormField
        control={form.control}
        name="daysOfTheWeek"
        render={({ fieldState: { invalid } }) => (
          <FormItem>
            <DaysOfWeekPicker
              error={invalid}
              ref={daysOfWeekPickerRef}
              selectedDaysOfWeek={selectedDaysOfWeek}
              setSelectedDaysOfWeek={setSelectedDaysOfWeek}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    );

  const largeDateSelector =
    availabilityType.toString() === AvailabilityType.SPECIFIC_DATES.toString() ? (
      <>
        <EventDateCalendar
          currentMonthOverride={currentCalendarMonth}
          error={form.getFieldState("specificDates").invalid}
          id="create-event-calendar-lg"
          isViewMode={false}
          key="create-event-calendar-lg"
          selectedDates={selectedDates}
          setCurrentMonthOverride={setCurrentCalendarMonth}
          setSelectedDates={setSelectedDates}
          size="large"
        />
        <div className="ml-3 h-2 text-2xs font-medium text-red-600 whitespace-nowrap">
          {form.formState.errors.specificDates?.message}
        </div>
      </>
    ) : (
      <>
        <DaysOfWeekPicker
          error={form.getFieldState("daysOfTheWeek").invalid}
          selectedDaysOfWeek={selectedDaysOfWeek}
          setSelectedDaysOfWeek={setSelectedDaysOfWeek}
          size="large"
        />
        <div className="ml-3 h-2 text-2xs font-medium text-red-600 whitespace-nowrap">
          {form.formState.errors.specificDates?.message}
        </div>
      </>
    );

  const timeZoneDropdown = (
    <FormField
      control={form.control}
      name="timeZone"
      render={({ field: { onChange, value } }) => (
        <FormItem>
          <FormLabel>{WHAT_TIME_ZONE}</FormLabel>
          <div className="mt-2">
            <TimeZoneDropdown error={form.getFieldState("timeZone").invalid} onChange={onChange} selected={value} />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const formSubmissionButton = (
    <>
      <AnimatePresence>
        {isFormInView && (
          <motion.div
            animate="shiftUp"
            className={cn(
              "xs:hidden z-[999] fixed bottom-0 left-0 flex w-full justify-center rounded-t-sm bg-white px-9 pb-6 pt-4 shadow-[0px_2px_2px_4px] shadow-gray-200"
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
              disabled={isSubmitAttempted.current && !form.formState.isValid}
              form="new-event-form"
              type="submit"
            >
              {isPending ? <Loader2 className="m-auto h-7 w-7 animate-spin text-white" /> : CREATE_EVENT}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        className="hidden z-[999] xs:block h-12 w-full rounded-xl border-[1px] border-primary align-bottom text-sm"
        disabled={isSubmitAttempted.current && !form.formState.isValid}
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
        <FormProvider {...form}>
          <form
            autoComplete="off"
            className="card mx-auto flex h-full w-full min-w-[22rem] max-w-[26rem] flex-col sm:min-h-[36rem] sm:max-w-[30rem] md:mx-[1rem] xl:max-w-[26rem]"
            id="new-event-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isSubmitAttempted.current = true;
              if (form.formState.isSubmitting || form.formState.isSubmitSuccessful) return;
              form.handleSubmit(onSubmit, onInvalid)();
            }}
            ref={formRef}
          >
            <div className="mb-5 flex flex-col">{eventNameInput}</div>
            <div className="mb-6 flex w-full flex-col">{startAndEndTimeInput}</div>
            <div className="mb-6"> {timeZoneDropdown}</div>
            <div className="mb-5 flex flex-col">{availabilityTypeInput}</div>
            <div className="mb-6">{dateSelector}</div>
            {formSubmissionButton}
          </form>
        </FormProvider>
        <div className="hidden w-[47rem] xl:block">{largeDateSelector}</div>
      </div>
      {/* add spacing on the bottom when button is fixed to bottom of*/}
      <div className={cn(isFormInView && "h-16 xs:h-0")} />
    </>
  );
}
