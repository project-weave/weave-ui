"use client";
import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import { useState } from "react";

// EventDate is the date portion of a TimeSlot, ie. 2000-11-29
export type EventDate = string;

// EventTime is the time portion of a TimeSlot in 24 hour format, ie. 12:00:00
export type EventTime = string;

// TimeSlot is an ISO formatted date string that represents a time slot for an event, ie. 2000-11-29T12:00:00
export type TimeSlot = string;

const initialSampleData = {
  endTimeUTC: "16:00:00",
  eventDates: [
    "2023-10-01",
    "2023-10-02",
    "2023-10-03",
    "2023-10-04",
    "2023-10-18",
    "2023-10-20",
    "2023-10-21",
    "2023-10-22",
    "2023-10-23",
    "2023-10-24",
    "2023-10-26",
    "2023-11-01",
    "2023-11-15",
    "2023-11-17",
    "2023-11-18",
    "2023-11-20",
    "2023-12-21",
    "2023-12-22",
    "2023-12-23",
    "2023-12-24",
    "2023-12-26"
  ],
  eventName: "test",
  eventTimeZone: "America/Vancouver",
  startTimeUTC: "08:00:00",

  // temporarily using, user names rather than ids
  // assume time slots are parsed based on the correct timeslot length
  userAvailability: {
    "Alessandra Liu": ["2023-10-01T08:00:00"],
    "Alex Ma": ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    "Andrew Fan": [
      "2023-10-01T08:00:00",
      "2023-10-01T08:30:00",
      "2023-10-01T09:00:00",
      "2023-10-01T10:00:00",
      "2023-10-02T08:00:00",
      "2023-10-02T08:30:00",
      "2023-10-02T09:00:00",
      "2023-10-03T10:00:00"
    ],
    "Angie Guo": ["2023-10-01T08:00:00"],
    "Brian Yang": ["2023-10-01T08:00:00"],
    "Jenny Zhang": ["2023-10-01T08:00:00"],
    "Kai Koyama-Wong": [
      "2023-10-01T08:00:00",
      "2023-10-01T08:30:00",
      "2023-10-01T09:00:00",
      "2023-10-03T08:00:00",
      "2023-10-03T08:30:00",
      "2023-10-03T09:00:00",
      "2023-10-03T10:00:00"
    ]
  }
};

export default function EventPage() {
  // TODO: fetch data from backend and use Tanstack Query
  const [sampleData, setSampleData] = useState(initialSampleData);

  function saveUserAvailability(user: string, timeSlots: TimeSlot[]) {
    setSampleData((prevSampleData) => ({
      ...prevSampleData,
      userAvailability: {
        ...prevSampleData.userAvailability,
        [user]: timeSlots
      }
    }));
  }

  return (
    <div className="h-full">
      <div>
        <AvailabilityGrid
          eventDates={sampleData.eventDates}
          eventTimeEnd={sampleData.endTimeUTC}
          eventTimeStart={sampleData.startTimeUTC}
          eventTimeZone={sampleData.eventTimeZone}
          participantsToTimeSlots={sampleData.userAvailability}
          saveUserAvailability={saveUserAvailability}
        />
      </div>
    </div>
  );
}
