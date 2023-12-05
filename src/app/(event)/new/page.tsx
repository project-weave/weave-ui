"use client";
import Calendar from "@/components/event-date-calendar";
import { MONTH_FORMAT } from "@/components/event-date-calendar";
import EventForm from "@/components/event-form";
import { EventDate } from "@/store/availabilityGridStore";
import { format, startOfToday } from "date-fns";
import { useState } from "react";

export default function NewEvent() {
  const today = startOfToday();

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(format(today, MONTH_FORMAT));
  const [selectedDates, setSelectedDates] = useState(new Set<EventDate>());

  return (
    <div className="mt-3 flex select-none flex-row gap-4">
      <EventForm
        currentCalendarMonth={currentCalendarMonth}
        selectedDates={selectedDates}
        setCurrentCalendarMonth={setCurrentCalendarMonth}
        setSelectedDates={setSelectedDates}
      />
      <Calendar
        currentMonthOverride={currentCalendarMonth}
        id="create-event-calendar-lg"
        isViewMode={false}
        selectedDates={selectedDates}
        setCurrentMonthOverride={setCurrentCalendarMonth}
        setSelectedDates={setSelectedDates}
        size="large"
      />
    </div>
  );
}
