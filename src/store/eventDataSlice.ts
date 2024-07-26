import { GetEventResponse } from "@/hooks/requests/useGetEvent";
import {
  EVENT_TIME_FORMAT,
  EventDate,
  EventResponse,
  EventTime,
  getTimeSlot,
  TIME_SLOT_INTERVAL_MINUTES,
  TimeSlot
} from "@/types/Event";
import { addMinutes, format, parseISO } from "date-fns";

import { AvailabilityType } from "./availabilityGridStore";

export type EventData = {
  allParticipants: string[];
  availabilityType: AvailabilityType;
  eventId: string;
  eventName: string;
  eventResponses: EventResponse[];
  sortedEventDates: EventDate[];
  sortedEventTimes: EventTime[];
  timeSlotsToParticipants: Record<TimeSlot, string[]>;
};

export type EventDataSlice = {
  eventData: EventData;
  setEventData: (data: GetEventResponse) => void;
};

export const createEventDataSlice = (set, get): EventDataSlice => ({
  eventData: {
    allParticipants: [],
    availabilityType: AvailabilityType.DAYS_OF_WEEK,
    eventId: "",
    eventName: "",
    eventResponses: [],
    sortedEventDates: [],
    sortedEventTimes: [],
    timeSlotsToParticipants: {}
  },
  setEventData: (data: GetEventResponse) => {
    if (!data) return;
    const { event, responses } = data;
    const availabilityType = event.isSpecificDates ? AvailabilityType.SPECIFIC_DATES : AvailabilityType.DAYS_OF_WEEK;

    const sortedEventTimes: EventTime[] = [];
    let currentTime = parseISO(getTimeSlot(event.startTime));
    const endTime = addMinutes(parseISO(getTimeSlot(event.endTime)), TIME_SLOT_INTERVAL_MINUTES);
    while (currentTime <= endTime) {
      const formattedTime = format(currentTime, EVENT_TIME_FORMAT);
      sortedEventTimes.push(formattedTime);
      currentTime = addMinutes(currentTime, TIME_SLOT_INTERVAL_MINUTES);
    }

    const sortedEventDates = event.dates.sort((date1: EventDate, date2: EventDate) => {
      return parseISO(date1).getTime() - parseISO(date2).getTime();
    });

    // TODO: use user_id as well when logged in users functionality is implemented

    const allParticipants = responses
      .map((response) => response.alias)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    const timeSlotsToParticipants: Record<TimeSlot, string[]> = {};
    // TODO: use user_id as well when logged in users functionality is implemented
    responses.forEach(({ alias, availabilities }) => {
      (availabilities || []).forEach((timeSlot) => {
        if (timeSlotsToParticipants[timeSlot] === undefined) {
          timeSlotsToParticipants[timeSlot] = [];
        }
        timeSlotsToParticipants[timeSlot].push(alias);
      });
    });

    const eventData = {
      allParticipants,
      availabilityType,
      eventId: event.id,
      eventName: event.name,
      eventResponses: responses,
      sortedEventDates,
      sortedEventTimes,
      timeSlotsToParticipants
    } as EventData;

    return set({
      eventData
    });
  }
});
