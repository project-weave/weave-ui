"use client";
import DaysOfWeekPicker from "@/components/days-of-week-picker";
import Calendar from "@/components/event-date-calendar";
import { MONTH_FORMAT } from "@/components/event-date-calendar";
import EventForm from "@/components/event-form";
import { EventDate } from "@/store/availabilityGridStore";
import { format, startOfToday } from "date-fns";
import { useState } from "react";

export enum EventType {
  DAYS_OF_WEEK,
  SPECIFIC_DATES
}

export default function NewEvent() {
  const today = startOfToday();

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(format(today, MONTH_FORMAT));
  const [selectedDates, setSelectedDates] = useState(new Set<EventDate>());
  const [eventType, setEventType] = useState(EventType.SPECIFIC_DATES);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(new Set<EventDate>());

  return (
    <div className="flex select-none flex-row justify-start gap-4">
      <div className="min-h-[42rem] w-[24rem]">
        <EventForm
          currentCalendarMonth={currentCalendarMonth}
          eventType={eventType}
          selectedDates={selectedDates}
          selectedDaysOfWeek={selectedDaysOfWeek}
          setCurrentCalendarMonth={setCurrentCalendarMonth}
          setEventType={setEventType}
          setSelectedDates={setSelectedDates}
          setSelectedDaysOfWeek={setSelectedDaysOfWeek}
        />
      </div>
      <div className="w-[47rem]">
        {eventType === EventType.SPECIFIC_DATES ? (
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
