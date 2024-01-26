import { create } from "zustand";

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

type EventData = {
  endTimeUTC: EventTime;
  eventDates: EventDate[];
  eventName: string;
  eventTimeZone: string;
  startTimeUTC: EventTime;
  userAvailability: Record<string, TimeSlot[]>;
};

// assume that when only time is passed in as a parameter, we're only interested in time so we we can use an aribtrary date to parse
export function getTimeSlot(time: EventTime, date: EventDate = "2000-11-29"): TimeSlot {
  return date + "T" + time;
}

export function getTimeFromTimeSlot(timeSlot: null | TimeSlot): EventTime {
  if (timeSlot === null || !timeSlot.includes("T")) return "";
  return timeSlot.split("T")[1];
}

export function isEditMode(mode: AvailabilityGridMode): boolean {
  return mode === AvailabilityGridMode.EDIT;
}

export function isViewMode(mode: AvailabilityGridMode): boolean {
  return mode === AvailabilityGridMode.VIEW;
}

// TODO: only take event dates that fall within the event date/time range

// Temporarily storing user data/event data here
type AvailabilityGridState = {
  availabilityType: AvailabilityType;
  eventDates: EventDate[];
  eventEndTimeUTC: EventTime;
  eventName: string;
  eventStartTimeUTC: EventTime;
  eventUserAvailability: Record<string, string[]>;
  focusedDate: EventDate | null;
  hoveredTimeSlot: null | TimeSlot;
  mode: AvailabilityGridMode;
  saveUserAvailability: (timeSlots: TimeSlot[]) => void;
  setDaysOfTheWeekEvent: (eventName: string, startTime: EventTime, endTime: EventTime) => void;
  setFocusedDate: (focusedDate: EventDate | null) => void;
  setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => void;
  setMode: (mode: AvailabilityGridMode) => void;
  setSpecificDatesEvent: (eventName: string, startTime: EventTime, endTime: EventTime, eventDates: EventDate[]) => void;
  setUser: (user: string) => void;
  setUserFilter: (filteredUsers: string[]) => void;
  setVisibleColumnRange: (start: number, end: number) => void;
  user: string;
  userFilter: string[];
  visibleColumnRange: VisibleColumnRange;
};

const useAvailabilityGridStore = create<AvailabilityGridState>()((set) => ({
  availabilityType: AvailabilityType.SPECIFIC_DATES,
  eventDates: ["2021-01-01", "2021-01-02", "2021-01-03", "2021-01-04", "2021-01-05", "2021-01-06", "2021-01-07"],
  eventEndTimeUTC: "22:00:00",
  eventName: "Weave Team Meeting",
  eventStartTimeUTC: "08:00:00",
  eventUserAvailability: {},
  focusedDate: null,
  hoveredTimeSlot: null,
  mode: AvailabilityGridMode.VIEW,
  saveUserAvailability: (timeSlots: TimeSlot[]) =>
    set((state) => ({
      eventUserAvailability: {
        ...state.eventUserAvailability,
        [state.user]: timeSlots
      }
    })),
  setDaysOfTheWeekEvent(eventName: string, startTime: EventTime, endTime: EventTime) {
    set({
      availabilityType: AvailabilityType.DAYS_OF_WEEK,
      eventDates: DAYS_OF_WEEK_DATES,
      eventEndTimeUTC: endTime,
      eventName,
      eventStartTimeUTC: startTime
    });
  },
  setFocusedDate: (focusedDate: EventDate | null) => set({ focusedDate }),
  setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => set({ hoveredTimeSlot }),
  setMode: (mode: AvailabilityGridMode) => set({ mode }),
  setSpecificDatesEvent(eventName: string, startTime: EventTime, endTime: EventTime, eventDates: EventDate[]) {
    set({
      availabilityType: AvailabilityType.SPECIFIC_DATES,
      eventDates,
      eventEndTimeUTC: endTime,
      eventName,
      eventStartTimeUTC: startTime
    });
  },
  setUser: (user: string) => set({ user }),
  setUserFilter: (userFilter: string[]) => set({ userFilter }),
  setVisibleColumnRange: (start: number, end: number) => set({ visibleColumnRange: { end, start } }),
  user: "",
  userFilter: [],
  visibleColumnRange: {
    end: -1,
    start: -1
  }
}));

export default useAvailabilityGridStore;
