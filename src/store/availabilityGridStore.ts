import { GetEventResponse } from "@/hooks/requests/useGetEvent";
import { EventResponse } from "@/types/Event";
import { addMinutes, format, parseISO } from "date-fns";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// EventDate is the date portion of a TimeSlot, ie. 2000-11-29
export type EventDate = string;
export const EVENT_DATE_FORMAT = "yyyy-MM-dd";
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

export const TIME_SLOT_INTERVAL_MINUTES = 30;

// TimeSlot is an ISO formatted date string that represents a time slot for an event, ie. 2000-11-29T12:00:00
export type TimeSlot = string;

export enum AvailabilityGridMode {
  VIEW,
  EDIT
}

export enum AvailabilityType {
  SPECIFIC_DATES,
  DAYS_OF_WEEK
}

type VisibleColumnRange = {
  end: number;
  start: number;
};

// assume that when only time is passed in as a parameter, we're only interested in time so we we can use an aribtrary date to parse
export function getTimeSlot(time: EventTime, date: EventDate = "2000-11-29"): TimeSlot {
  return date + " " + time;
}

export function getTimeFromTimeSlot(timeSlot: null | TimeSlot): EventTime {
  if (timeSlot === null || !timeSlot.includes(" ")) return "";
  return timeSlot.split(" ")[1];
}

export function isEditMode(mode: AvailabilityGridMode): boolean {
  return mode === AvailabilityGridMode.EDIT;
}

export function isViewMode(mode: AvailabilityGridMode): boolean {
  return mode === AvailabilityGridMode.VIEW;
}

type EventData = {
  allParticipants: string[];
  availabilityType: AvailabilityType;
  eventId: string;
  eventName: string;
  eventResponses: EventResponse[];
  sortedEventDates: EventDate[];
  sortedEventTimes: EventTime[];
  timeSlotsToParticipants: Record<TimeSlot, string[]>;
};

// TODO: only take event dates that fall within the event date/time range

// Temporarily storing user data/event data here
type AvailabilityGridState = {
  addSelectedTimeSlots: (timeSlot: TimeSlot[]) => void;
  eventData: EventData;
  focusedDate: EventDate | null;
  hoveredTimeSlot: null | TimeSlot;
  isBestTimesEnabled: boolean;
  mode: AvailabilityGridMode;
  removeSelectedTimeSlots: (timeSlot: TimeSlot[]) => void;
  selectedTimeSlots: TimeSlot[];
  setEventData: (data: GetEventResponse) => void;
  setFocusedDate: (focusedDate: EventDate | null) => void;
  setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => void;
  setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => void;
  setMode: (mode: AvailabilityGridMode) => void;
  setSelectedTimeSlots: (timeSlot: TimeSlot[]) => void;
  setUser: (user: string) => void;
  setUserFilter: (filteredUsers: string[]) => void;
  setVisibleColumnRange: (start: number, end: number) => void;
  toggleIsBestTimesEnabled: () => void;
  user: string;
  userFilter: string[];
  visibleColumnRange: VisibleColumnRange;
};

const useAvailabilityGridStore = create<AvailabilityGridState>()(
  subscribeWithSelector((set) => ({
    addSelectedTimeSlots: (toAdd: TimeSlot[]) => {
      set((state) => {
        const newSelectedTimeSlots = [...state.selectedTimeSlots];
        toAdd.forEach((timeSlot) => {
          if (!newSelectedTimeSlots.includes(timeSlot)) {
            newSelectedTimeSlots.push(timeSlot);
          }
        });
        return { ...state, selectedTimeSlots: newSelectedTimeSlots };
      });
    },
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
    focusedDate: null,
    hoveredTimeSlot: null,
    isBestTimesEnabled: false,

    mode: AvailabilityGridMode.VIEW,
    removeSelectedTimeSlots: (toRemove: TimeSlot[]) => {
      set((state) => {
        const newSelectedTimeSlots: TimeSlot[] = [];
        state.selectedTimeSlots.forEach((timeSlot) => {
          if (!toRemove.includes(timeSlot)) {
            newSelectedTimeSlots.push(timeSlot);
          }
        });
        return { ...state, selectedTimeSlots: newSelectedTimeSlots };
      });
    },
    selectedTimeSlots: [],

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

      console.log(eventData);

      return set({
        eventData
      });
    },

    setFocusedDate: (focusedDate: EventDate | null) => set({ focusedDate }),
    setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => set({ hoveredTimeSlot }),
    setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => set({ isBestTimesEnabled }),
    setMode: (mode: AvailabilityGridMode) => set({ mode }),
    setSelectedTimeSlots: (selectedTimeSlots: TimeSlot[]) => set({ selectedTimeSlots }),
    setUser: (user: string) => set({ user }),
    setUserFilter: (userFilter: string[]) => set({ userFilter }),
    setVisibleColumnRange: (start: number, end: number) => set({ visibleColumnRange: { end, start } }),
    sortedEventDates: [],
    sortedEventTimes: [],
    timeSlotsToParticipants: {},
    toggleIsBestTimesEnabled: () =>
      set((prev) => {
        return { ...prev, isBestTimesEnabled: !prev.isBestTimesEnabled };
      }),
    user: "",
    userFilter: [],
    visibleColumnRange: {
      end: -1,
      start: -1
    }
  }))
);

export default useAvailabilityGridStore;
