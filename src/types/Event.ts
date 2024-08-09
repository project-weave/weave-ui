import { isBefore, parse } from "date-fns";
import { z } from "zod";

import {
  EVENT_TIME_FORMAT,
  EventDate,
  EventDateSchema,
  EventTime,
  EventTimeSchema,
  TimeSlot,
  TimeSlotSchema
} from "./Timeslot";

export enum AvailabilityType {
  SPECIFIC_DATES,
  DAYS_OF_WEEK
}
const AvailbilityTypeSchema = z.nativeEnum(AvailabilityType);

export interface Event {
  dates: EventDate[];
  endTime: EventTime;
  id: string;
  isSpecificDates: boolean;
  name: string;
  startTime: EventTime;
}

export interface EventForm {
  availabilityType: AvailabilityType;
  daysOfTheWeek: Set<EventDate>;
  name: string;
  specificDates: Set<EventDate>;
  startTime: EventTime;
  timeRange: {
    endTime: EventTime;
    startTime: EventTime;
  };
}

export const EventFormSchema = z
  .object({
    availabilityType: AvailbilityTypeSchema,
    daysOfTheWeek: z.set(EventDateSchema),
    name: z
      .string()
      .transform((str) => str.trim())
      .pipe(z.string().min(1, { message: "Event name must be at least 1 character long" })),
    specificDates: z.set(EventDateSchema),
    timeRange: z
      .object({
        endTime: z.string(EventTimeSchema),
        startTime: z.string(EventTimeSchema)
      })
      .refine(
        (data) => {
          const parsedStartTime = parse(data.startTime, EVENT_TIME_FORMAT, new Date());
          const parsedEndTime = parse(data.endTime, EVENT_TIME_FORMAT, new Date());
          return data.endTime === "00:00:00" || isBefore(parsedStartTime, parsedEndTime);
        },
        {
          message: "Start time must be before end time",
          path: ["root"]
        }
      )
  })
  .superRefine((data, ctx) => {
    if (data.availabilityType === AvailabilityType.SPECIFIC_DATES) {
      if (data.specificDates.size === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You must select at least one date",
          path: ["specificDates"]
        });
      }
    } else if (data.availabilityType === AvailabilityType.DAYS_OF_WEEK) {
      if (data.daysOfTheWeek.size === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You must select at least one day of the week",
          path: ["daysOfTheWeek"]
        });
      }
    }
  });

export interface EventResponse {
  alias: string;
  availabilities: TimeSlot[];
  userId: string;
}

export const EventResponseSchema = z.object({
  alias: z.string(),
  availabilities: z.array(TimeSlotSchema),
  userId: z.string()
});
