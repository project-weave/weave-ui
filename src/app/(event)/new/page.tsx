"use client";
import DaysOfWeekPicker from "@/components/days-of-week-picker";
import Calendar, { MONTH_FORMAT } from "@/components/event-date-calendar";
import NewEventForm from "@/components/new-event-form";
import useToday from "@/hooks/useToday";
import { AvailabilityType, EventDate } from "@/store/availabilityGridStore";
import { format } from "date-fns";
import { useState } from "react";

export default function NewEvent() {
  const today = useToday();

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(format(today, MONTH_FORMAT));
  const [selectedDates, setSelectedDates] = useState(new Set<EventDate>());
  const [availabilityType, setAvailabilityType] = useState(AvailabilityType.SPECIFIC_DATES);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(new Set<EventDate>());

  return (
    <div className="mt-3 flex select-none flex-row justify-start gap-4">
      <div className="min-h-[42rem] w-[24rem]">
        <NewEventForm
          availabilityType={availabilityType}
          currentCalendarMonth={currentCalendarMonth}
          selectedDates={selectedDates}
          selectedDaysOfWeek={selectedDaysOfWeek}
          setAvailabilityType={setAvailabilityType}
          setCurrentCalendarMonth={setCurrentCalendarMonth}
          setSelectedDates={setSelectedDates}
          setSelectedDaysOfWeek={setSelectedDaysOfWeek}
        />
      </div>
      <div className="w-[47rem]">
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
