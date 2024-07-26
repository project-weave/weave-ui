import { EventDate, TimeSlot } from "@/types/Event";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { createEventDataSlice, EventDataSlice } from "./eventDataSlice";
import { createSelectedTimeSlotsSlice, SelectedTimeSlotsSlice } from "./selectedTimeSlotsSlice";
import { createViewWindowSlice, ViewWindowSlice } from "./viewWindowSlice";

export enum AvailabilityGridMode {
  VIEW,
  EDIT
}

export enum AvailabilityType {
  SPECIFIC_DATES,
  DAYS_OF_WEEK
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
  hoveredTimeSlot: null | TimeSlot;
  isBestTimesEnabled: boolean;
  mode: AvailabilityGridMode;
  setFocusedDate: (focusedDate: EventDate | null) => void;
  setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => void;
  setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => void;
  setMode: (mode: AvailabilityGridMode) => void;
  setUser: (user: string) => void;
  setUserFilter: (filteredUsers: string[]) => void;
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
    hoveredTimeSlot: null,
    isBestTimesEnabled: false,
    mode: AvailabilityGridMode.VIEW,
    setFocusedDate: (focusedDate: EventDate | null) => set({ focusedDate }),
    setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => set({ hoveredTimeSlot }),
    setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => set({ isBestTimesEnabled }),
    setMode: (mode: AvailabilityGridMode) => set({ mode }),
    setUser: (user: string) => set({ user }),
    setUserFilter: (userFilter: string[]) => set({ userFilter }),
    toggleIsBestTimesEnabled: () =>
      set((prev) => {
        return { ...prev, isBestTimesEnabled: !prev.isBestTimesEnabled };
      }),
    user: "",
    userFilter: []
  }))
);

export default useAvailabilityGridStore;
