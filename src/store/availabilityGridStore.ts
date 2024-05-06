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

// TODO: only take event dates that fall within the event date/time range

// Temporarily storing user data/event data here
type AvailabilityGridState = {
  addSelectedTimeSlots: (timeSlot: TimeSlot[]) => void;
  focusedDate: EventDate | null;
  hoveredTimeSlot: null | TimeSlot;
  isBestTimesEnabled: boolean;
  mode: AvailabilityGridMode;
  removeSelectedTimeSlots: (timeSlot: TimeSlot[]) => void;
  selectedTimeSlots: TimeSlot[];
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
    eventDates: [],
    eventEndTimeUTC: "24:00:00",
    eventName: "",
    eventStartTimeUTC: "00:00:00",
    eventUserAvailability: {},
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
    setFocusedDate: (focusedDate: EventDate | null) => set({ focusedDate }),
    setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => set({ hoveredTimeSlot }),
    setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => set({ isBestTimesEnabled }),
    setMode: (mode: AvailabilityGridMode) => set({ mode }),
    setSelectedTimeSlots: (selectedTimeSlots: TimeSlot[]) => set({ selectedTimeSlots }),
    setUser: (user: string) => set({ user }),
    setUserFilter: (userFilter: string[]) => set({ userFilter }),
    setVisibleColumnRange: (start: number, end: number) => set({ visibleColumnRange: { end, start } }),
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
