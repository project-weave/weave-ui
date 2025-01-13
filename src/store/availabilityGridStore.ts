import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

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
  resetGridState: () => void;
  selectedTimeZone: string;
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

function getLocalStorageTimeZone() {
  const storedTimeZone = localStorage.getItem("timeZone");
  if (storedTimeZone) {
    try {
      const parsed = JSON.parse(storedTimeZone);
      return parsed?.state?.timeZone || "";
    } catch {
      return "";
    }
  }
  return "";
}

const useAvailabilityGridStore = create<AvailabilityGridState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...createSelectedTimeSlotsSlice(set, get),
        ...createEventDataSlice(set, get),
        ...createViewWindowSlice(set, get),
        focusedDate: null,
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
        selectedTimeZone: getLocalStorageTimeZone(),
        setFocusedDate: (focusedDate: EventDate | null) => set({ focusedDate }),
        setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => set({ hoveredTimeSlot }),
        setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => set({ isBestTimesEnabled }),
        setMode: (mode: AvailabilityGridMode) => set({ mode }),
        setSelectedTimeZone: (timeZone: string) => set({ selectedTimeZone: timeZone }),
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
      }),
      {
        name: "timeZone", // Key in localStorage
        partialize: ({ selectedTimeZone }: AvailabilityGridState) => ({ timeZone: selectedTimeZone }) // Persist only part of the state
      }
    )
  )
);

export default useAvailabilityGridStore;
