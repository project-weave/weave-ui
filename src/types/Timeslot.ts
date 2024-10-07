import { isValid, parse } from "date-fns";
import { z } from "zod";

// EventDate is the date portion of a TimeSlot, ie. 2000-11-29
export type EventDate = string;
export const EVENT_DATE_FORMAT = "yyyy-MM-dd";
export const EventDateSchema = z.string().refine(
  (value) => {
    const parsedTime = parse(value, EVENT_DATE_FORMAT, new Date());
    return isValid(parsedTime);
  },
  {
    message: `Invalid date format. Expacted format is ${EVENT_DATE_FORMAT}`
  }
);

// date representation of days of week from sunday to saturday
export const DAYS_OF_WEEK_DATES: EventDate[] = [
  "2023-01-01",
  "2023-01-02",
  "2023-01-03",
  "2023-01-04",
  "2023-01-05",
  "2023-01-06",
  "2023-01-07"
];

// EventTime is the time portion of a TimeSlot in 24 hour format, ie. 12:00:00
export type EventTime = string;
export const EVENT_TIME_FORMAT = "HH:mm:ss";
export const EventTimeSchema = z.string().refine(
  (value) => {
    const parsedTime = parse(value, EVENT_TIME_FORMAT, new Date());
    return isValid(parsedTime);
  },
  {
    message: `Invalid date format. Expacted format is ${EVENT_DATE_FORMAT}`
  }
);

// TimeSlot is an ISO formatted date string that represents a time slot for an event, ie. 2000-11-29 12:00:00
export type TimeSlot = string;
export const TIME_SLOT_FORMAT = `${EVENT_DATE_FORMAT} ${EVENT_TIME_FORMAT}`;

export const TimeSlotSchema = z.string().refine(
  (value) => {
    const parsedTime = parse(value, TIME_SLOT_FORMAT, new Date());
    return isValid(parsedTime);
  },
  {
    message: `Invalid timeslot format. Expacted format is ${TIME_SLOT_FORMAT}`
  }
);

// assume that when only time is passed in as a parameter, we're only interested in time so we we can use an aribtrary date to parse
export function getTimeSlot(time: EventTime, date: EventDate = "2000-11-29"): TimeSlot {
  return date + " " + time;
}

export function getTimeFromTimeSlot(timeSlot: null | TimeSlot): EventTime {
  if (timeSlot === null || !timeSlot.includes(" ")) return "";
  return timeSlot.split(" ")[1];
}

export function getDateFromTimeSlot(timeSlot: null | TimeSlot): EventDate {
  if (timeSlot === null || !timeSlot.includes(" ")) return "";
  return timeSlot.split(" ")[0];
}
