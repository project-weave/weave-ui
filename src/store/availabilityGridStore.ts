import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { EventDate, TimeSlot } from "@/types/Timeslot";

import { createEventDataSlice, EventDataSlice } from "./eventDataSlice";
import { createSelectedTimeSlotsSlice, SelectedTimeSlotsSlice } from "./selectedTimeSlotsSlice";
import { createViewWindowSlice, ViewWindowSlice } from "./viewWindowSlice";

export enum AvailabilityGridMode {
  VIEW,
  EDIT
}

export function isEditMode(mode: AvailabilityGridMode): boolean {
  return mode === AvailabilityGridMode.EDIT;
}

export function isViewMode(mode: AvailabilityGridMode): boolean {
  return mode === AvailabilityGridMode.VIEW;
}

// TODO: only take event dates that fall within the event date/time range

type AvailabilityGridState = {
  focusedDate: EventDate | null;
  getEventParticipants: () => string[];
  hoveredTimeSlot: null | TimeSlot;
  isBestTimesEnabled: boolean;
  mode: AvailabilityGridMode;
  selectedTimeZone: string;
  resetGridState: () => void;
  setFocusedDate: (focusedDate: EventDate | null) => void;
  setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => void;
  setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => void;
  setMode: (mode: AvailabilityGridMode) => void;
  setSelectedTimeZone: (timeZone: string) => void;
  setUser: (user: string) => void;
  setUserFilter: (filteredUsers: string[]) => void;
  setUserGridState: (user: string) => void;
  toggleIsBestTimesEnabled: () => void;
  user: string;
  userFilter: string[];
} & EventDataSlice &
  SelectedTimeSlotsSlice &
  ViewWindowSlice;

const useAvailabilityGridStore = create<AvailabilityGridState>()(
  subscribeWithSelector((set, get) => ({
    ...createSelectedTimeSlotsSlice(set, get),
    ...createEventDataSlice(set, get),
    ...createViewWindowSlice(set, get),
    focusedDate: null,
    selectedTimeZone: "",
    getEventParticipants: () => {
      const { eventData, user } = get();
      const allParticipants = eventData.allParticipants;
      if (allParticipants.includes(user) || user === "") return allParticipants;
      return [user, ...allParticipants];
    },
    hoveredTimeSlot: null,
    isBestTimesEnabled: false,
    mode: AvailabilityGridMode.VIEW,
    resetGridState: () => {
      set({
        focusedDate: null,
        hoveredTimeSlot: null,
        isBestTimesEnabled: false,
        leftMostColumnInView: 0,
        mode: AvailabilityGridMode.VIEW,
        selectedTimeSlots: [],
        user: "",
        userFilter: []
      });
    },
    setSelectedTimeZone: (timeZone: string) => set({ selectedTimeZone: timeZone }),
    setFocusedDate: (focusedDate: EventDate | null) => set({ focusedDate }),
    setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => set({ hoveredTimeSlot }),
    setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => set({ isBestTimesEnabled }),
    setMode: (mode: AvailabilityGridMode) => set({ mode }),
    setUser: (user: string) => set({ user }),
    setUserFilter: (userFilter: string[]) => set({ userFilter }),
    setUserGridState: (user: string) => {
      const userResponse = (get().eventData.eventResponses || []).find(({ alias }) => {
        // TODO: use user_id as well when logged in users functionality is implemented
        return user === alias;
      });
      set({
        selectedTimeSlots: userResponse?.availabilities || [],
        user
      });
    },
    toggleIsBestTimesEnabled: () =>
      set((prev) => {
        return { ...prev, hoveredTimeSlot: null, isBestTimesEnabled: !prev.isBestTimesEnabled };
      }),
    user: "",
    userFilter: []
  }))
);

export default useAvailabilityGridStore;
