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
const testEventData: EventData = {
  endTimeUTC: "22:00:00",
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
    "2023-12-26",
    "2024-01-01",
    "2024-01-12",
    "2024-01-03"
  ],
  // eventDates: ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05", "2023-01-06", "2023-01-07"],
  eventName: "Weave Team Meeting",
  eventTimeZone: "America/Vancouver",
  startTimeUTC: "08:00:00",

  // temporarily using, user names rather than ids
  // assume time slots are parsed based on the correct timeslot length
  userAvailability: {}
};

// Temporarily storing user data/event data here
type AvailabilityGridState = {
  availabilityType: AvailabilityType;
  eventData: EventData;
  focusedDate: EventDate | null;
  hoveredTimeSlot: null | TimeSlot;
  mode: AvailabilityGridMode;
  saveUserAvailability: (timeSlots: TimeSlot[]) => void;
  setFocusedDate: (focusedDate: EventDate | null) => void;
  setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => void;
  setMode: (mode: AvailabilityGridMode) => void;
  setUser: (user: string) => void;
  setUserFilter: (filteredUsers: string[]) => void;
  setVisibleColumnRange: (start: number, end: number) => void;
  user: string;
  userFilter: string[];
  visibleColumnRange: VisibleColumnRange;
};

const useAvailabilityGridStore = create<AvailabilityGridState>()((set) => ({
  availabilityType: AvailabilityType.SPECIFIC_DATES,
  eventData: testEventData,
  focusedDate: null,
  hoveredTimeSlot: null,
  mode: AvailabilityGridMode.VIEW,
  saveUserAvailability: (timeSlots: TimeSlot[]) =>
    set((state) => ({
      eventData: {
        ...state.eventData,
        userAvailability: {
          ...state.eventData.userAvailability,
          [state.user]: timeSlots
        }
      }
    })),
  setFocusedDate: (focusedDate: EventDate | null) => set({ focusedDate }),
  setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => set({ hoveredTimeSlot }),
  setMode: (mode: AvailabilityGridMode) => set({ mode }),
  setUser: (user: string) => set({ user }),
  setUserFilter: (userFilter: string[]) => set({ userFilter }),
  setVisibleColumnRange: (start: number, end: number) => set({ visibleColumnRange: { end, start } }),
  user: "Alex Ma",
  userFilter: [],
  visibleColumnRange: {
    end: -1,
    start: -1
  }
}));

export default useAvailabilityGridStore;
