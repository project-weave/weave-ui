import { create } from "zustand";

// EventDate is the date portion of a TimeSlot, ie. 2000-11-29
export type EventDate = string;
export const EVENT_DATE_FORMAT = "yyyy-MM-dd";

// EventTime is the time portion of a TimeSlot in 24 hour format, ie. 12:00:00
export type EventTime = string;

// TimeSlot is an ISO formatted date string that represents a time slot for an event, ie. 2000-11-29T12:00:00
export type TimeSlot = string;

export enum AvailabilityGridMode {
  VIEW,
  EDIT
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

// assuming that when only time is passed in as a parameter, we're only interested in time so we we can use an aribtrary date to parse
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
  eventName: "Weave Team Meeting",
  eventTimeZone: "America/Vancouver",
  startTimeUTC: "08:00:00",

  // temporarily using, user names rather than ids
  // assume time slots are parsed based on the correct timeslot length
  userAvailability: {
    "A SUPER LONG USERNAMEEEEEEEEEE": [
      "2023-10-01T08:00:00",
      "2023-10-01T08:30:00",
      "2023-10-01T09:00:00",
      "2023-10-01T09:30:00"
    ],
    "Alessandra Liu": [
      "2023-10-01T08:00:00",
      "2023-10-03T14:00:00",
      "2023-10-04T08:30:00",
      "2023-10-04T09:00:00",
      "2023-10-04T10:00:00",
      "2023-10-04T11:00:00",
      "2023-10-04T11:30:00",
      "2023-10-04T13:00:00",
      "2023-10-04T14:00:00",
      "2023-10-04T16:30:00",
      "2023-10-04T18:00:00",
      "2023-10-04T18:30:00",
      "2023-10-18T15:30:00",
      "2023-10-18T16:00:00",
      "2023-10-18T16:30:00",
      "2023-10-18T17:00:00",
      "2023-10-18T17:30:00",
      "2023-10-18T18:00:00",
      "2023-10-18T18:30:00"
    ],
    "Alex Ma": ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Alexander: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Alvin: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Amelia: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],

    Amy: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    "Andrew Fan": [
      "2023-10-01T08:00:00",
      "2023-10-03T14:00:00",
      "2023-10-04T08:30:00",
      "2023-10-04T09:00:00",
      "2023-10-04T10:00:00",
      "2023-10-04T11:00:00",
      "2023-10-04T11:30:00",
      "2023-10-04T13:00:00",
      "2023-10-04T14:00:00",
      "2023-10-04T16:30:00",
      "2023-10-04T18:00:00",
      "2023-10-04T18:30:00",
      "2023-10-18T15:30:00",
      "2023-10-18T16:00:00",
      "2023-10-18T16:30:00",
      "2023-10-18T17:00:00",
      "2023-10-18T17:30:00",
      "2023-10-18T18:00:00",
      "2023-10-18T18:30:00",
      "2023-10-01T08:30:00",
      "2023-10-01T09:00:00",
      "2023-10-01T10:00:00",
      "2023-10-02T08:00:00",
      "2023-10-02T08:30:00",
      "2023-10-02T09:00:00",
      "2023-10-03T10:00:00"
    ],
    "Angie Guo": [
      "2023-10-01T08:00:00",
      "2023-10-03T14:00:00",
      "2023-10-04T08:30:00",
      "2023-10-04T09:00:00",
      "2023-10-04T10:00:00",
      "2023-10-04T11:00:00",
      "2023-10-04T11:30:00",
      "2023-10-04T13:00:00",
      "2023-10-04T14:00:00",
      "2023-10-04T16:30:00",
      "2023-10-04T18:00:00",
      "2023-10-04T18:30:00",
      "2023-10-18T15:30:00",
      "2023-10-18T16:00:00",
      "2023-10-18T16:30:00",
      "2023-10-18T17:00:00",
      "2023-10-18T17:30:00",
      "2023-10-18T18:00:00",
      "2023-10-18T18:30:00"
    ],
    Ava: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    "Brian Yang": [
      "2023-10-01T08:00:00",
      "2023-10-03T14:00:00",
      "2023-10-04T08:30:00",
      "2023-10-04T09:00:00",
      "2023-10-04T10:00:00",
      "2023-10-04T11:00:00",
      "2023-10-04T11:30:00",
      "2023-10-04T13:00:00",
      "2023-10-04T14:00:00",
      "2023-10-04T16:30:00",
      "2023-10-04T18:00:00",
      "2023-10-04T18:30:00",
      "2023-10-18T15:30:00",
      "2023-10-18T16:00:00",
      "2023-10-18T16:30:00",
      "2023-10-18T17:00:00",
      "2023-10-18T17:30:00",
      "2023-10-18T18:00:00",
      "2023-10-18T18:30:00",
      "2023-10-18T19:00:00",
      "2023-10-21T09:00:00",
      "2023-10-21T11:00:00",
      "2023-10-21T11:30:00",
      "2023-10-21T15:30:00",
      "2023-10-21T16:00:00",
      "2023-10-21T16:30:00",
      "2023-10-21T17:00:00",
      "2023-10-21T20:30:00",
      "2023-10-22T08:30:00",
      "2023-10-22T09:30:00",
      "2023-10-22T12:00:00",
      "2023-10-22T12:30:00",
      "2023-10-22T15:00:00",
      "2023-10-22T16:00:00",
      "2023-10-22T17:00:00",
      "2023-10-22T19:30:00",
      "2023-10-23T08:00:00",
      "2023-10-23T09:00:00",
      "2023-10-23T09:30:00",
      "2023-10-23T10:00:00",
      "2023-10-23T10:30:00",
      "2023-10-23T11:00:00",
      "2023-10-23T11:30:00",
      "2023-10-23T12:00:00",
      "2023-10-23T12:30:00",
      "2023-10-23T13:00:00"
    ],
    Charlotte: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Daniel: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    David: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Derek: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Emily: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Ethan: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Harper: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Jacob: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],

    James: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    "Jenny Zhang": [
      "2023-10-01T08:00:00",
      "2023-10-01T09:00:00",
      "2023-10-01T09:30:00",
      "2023-10-01T10:30:00",
      "2023-10-01T13:00:00",
      "2023-10-01T13:30:00",
      "2023-10-01T14:30:00",
      "2023-10-01T15:00:00",
      "2023-10-01T16:00:00",
      "2023-10-01T16:30:00",
      "2023-10-01T17:00:00",
      "2023-10-01T18:00:00",
      "2023-10-01T18:30:00",
      "2023-10-01T19:00:00",
      "2023-10-01T19:30:00",
      "2023-10-01T20:00:00",
      "2023-10-01T20:30:00",
      "2023-10-02T08:30:00",
      "2023-10-02T11:30:00",
      "2023-10-02T14:30:00",
      "2023-10-02T15:00:00",
      "2023-10-03T08:00:00",
      "2023-10-03T08:30:00",
      "2023-10-03T09:00:00"
    ],
    Jessica: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    John: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    "Kai Koyama-Wong": [
      "2023-10-01T08:00:00",
      "2023-10-01T08:30:00",
      "2023-10-01T09:00:00",
      "2023-10-01T10:00:00",
      "2023-10-01T13:00:00",
      "2023-10-01T13:30:00",
      "2023-10-01T16:30:00",
      "2023-10-01T17:00:00",
      "2023-10-01T18:00:00",
      "2023-10-01T18:30:00",
      "2023-10-01T20:30:00",
      "2023-10-02T08:30:00",
      "2023-10-02T10:00:00",
      "2023-10-02T12:00:00",
      "2023-10-02T13:00:00",
      "2023-10-02T14:00:00",
      "2023-10-02T15:00:00",
      "2023-10-02T18:00:00",
      "2023-10-02T18:30:00",
      "2023-10-02T19:30:00",
      "2023-10-02T20:00:00"
    ],
    Mia: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Michael: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Olivia: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Robert: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"],
    Sarah: ["2023-10-01T08:00:00", "2023-10-01T08:30:00", "2023-10-01T09:00:00", "2023-10-01T09:30:00"]
  }
};

// Temporarily storing user data/event data here
type AvailabilityGridState = {
  eventData: EventData;
  focusedDate: EventDate | null;
  hoveredTimeSlot: null | TimeSlot;
  mode: AvailabilityGridMode;
  saveUserAvailability: (timeSlots: TimeSlot[]) => void;
  setFocusedDate: (focusedDate: EventDate | null) => void;
  setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => void;
  setMode: (mode: AvailabilityGridMode) => void;
  setUserFilter: (filteredUsers: string[]) => void;
  setVisibleColumnRange: (start: number, end: number) => void;
  user: string;
  userFilter: string[];
  visibleColumnRange: VisibleColumnRange;
};

const useAvailabilityGridStore = create<AvailabilityGridState>()((set) => ({
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
