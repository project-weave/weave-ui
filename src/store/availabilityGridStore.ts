import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

import { EventDate, TimeSlot } from "@/types/Timeslot";
import { isSupportedTimeZone } from "@/utils/timeZone";

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

export const MAX_DISPLAY_TIME_ZONES = 3;

// TODO: only take event dates that fall within the event date/time range

type AvailabilityGridState = {
  addTimeZone: (timeZone: string) => void;
  cancelEditing: () => void;
  clearUser: () => void;
  // extra time zones shown to the left of the primary one, left to right
  extraTimeZones: string[];
  focusedDate: EventDate | null;
  getEventParticipants: () => string[];
  hoveredTimeSlot: null | TimeSlot;
  isBestTimesEnabled: boolean;
  isSavingAvailability: boolean;
  makeTimeZonePrimary: (timeZone: string) => void;
  mode: AvailabilityGridMode;
  removeTimeZone: (timeZone: string) => void;
  replaceTimeZone: (oldTimeZone: string, newTimeZone: string) => void;
  resetGridState: () => void;
  // the primary time zone (next to the grid); falls back to the event's time zone when empty
  selectedTimeZone: string;
  setFocusedDate: (focusedDate: EventDate | null) => void;
  setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => void;
  setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => void;
  setIsSavingAvailability: (isSavingAvailability: boolean) => void;
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
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...createSelectedTimeSlotsSlice(set, get),
        ...createEventDataSlice(set, get),
        ...createViewWindowSlice(set, get),
        addTimeZone: (timeZone: string) => {
          const zones = getDisplayTimeZones(get());
          if (zones.includes(timeZone) || zones.length >= MAX_DISPLAY_TIME_ZONES) return;
          set({ extraTimeZones: [timeZone, ...zones.slice(0, -1)] });
        },
        cancelEditing: () => set({ hoveredTimeSlot: null, mode: AvailabilityGridMode.VIEW, selectedTimeSlots: [] }),
        clearUser: () => {
          if (get().isSavingAvailability) return;
          set({
            hoveredTimeSlot: null,
            mode: AvailabilityGridMode.VIEW,
            selectedTimeSlots: [],
            user: "",
            userFilter: []
          });
        },
        extraTimeZones: [],
        focusedDate: null,
        getEventParticipants: () => {
          const { eventData, mode, user } = get();
          const allParticipants = eventData.allParticipants;
          if (isViewMode(mode) || allParticipants.includes(user) || user === "") return allParticipants;
          return [user, ...allParticipants];
        },
        hoveredTimeSlot: null,
        isBestTimesEnabled: false,
        isSavingAvailability: false,
        makeTimeZonePrimary: (timeZone: string) => {
          const zones = getDisplayTimeZones(get());
          const primary = zones[zones.length - 1];
          if (timeZone === primary || !zones.includes(timeZone)) return;
          // the old primary takes the new primary's spot
          const extras = zones.slice(0, -1).map((zone) => (zone === timeZone ? primary : zone));
          set({ extraTimeZones: extras, selectedTimeZone: timeZone });
        },
        mode: AvailabilityGridMode.VIEW,
        removeTimeZone: (timeZone: string) => {
          const zones = getDisplayTimeZones(get());
          if (zones.length <= 1 || !zones.includes(timeZone)) return;
          const remaining = zones.filter((zone) => zone !== timeZone);
          set({ extraTimeZones: remaining.slice(0, -1), selectedTimeZone: remaining[remaining.length - 1] });
        },
        replaceTimeZone: (oldTimeZone: string, newTimeZone: string) => {
          const zones = getDisplayTimeZones(get());
          if (oldTimeZone === newTimeZone || !zones.includes(oldTimeZone)) return;
          const replaced = zones
            .filter((zone) => zone !== newTimeZone)
            .map((zone) => (zone === oldTimeZone ? newTimeZone : zone));
          set({ extraTimeZones: replaced.slice(0, -1), selectedTimeZone: replaced[replaced.length - 1] });
        },
        resetGridState: () => {
          set({
            focusedDate: null,
            hoveredTimeSlot: null,
            isBestTimesEnabled: false,
            isSavingAvailability: false,
            leftMostColumnInView: 0,
            mode: AvailabilityGridMode.VIEW,
            selectedTimeSlots: [],
            user: "",
            userFilter: []
          });
        },
        selectedTimeZone: "",
        setFocusedDate: (focusedDate: EventDate | null) => set({ focusedDate }),
        setHoveredTimeSlot: (hoveredTimeSlot: null | TimeSlot) => set({ hoveredTimeSlot }),
        setIsBestTimesEnabled: (isBestTimesEnabled: boolean) => set({ isBestTimesEnabled }),
        setIsSavingAvailability: (isSavingAvailability: boolean) => set({ isSavingAvailability }),
        setMode: (mode: AvailabilityGridMode) => set({ mode }),
        setSelectedTimeZone: (timeZone: string) => set({ selectedTimeZone: timeZone }),
        setUser: (user: string) => set({ user }),
        setUserFilter: (userFilter: string[]) => set({ userFilter }),
        setUserGridState: (user: string) => {
          if (get().isSavingAvailability) return;
          const userResponse = (get().eventData.eventResponses || []).find(({ alias }) => {
            // TODO: use user_id as well when logged in users functionality is implemented
            return user === alias;
          });
          set({
            hoveredTimeSlot: null,
            mode: AvailabilityGridMode.EDIT,
            selectedTimeSlots: [...(userResponse?.availabilities || [])],
            user,
            userFilter: []
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
        name: "timeZone",
        partialize: ({ extraTimeZones, selectedTimeZone }: AvailabilityGridState) => ({
          extraTimeZones,
          timeZone: selectedTimeZone
        }),
        onRehydrateStorage: () => (state) => {
          const storedTimeZone = localStorage.getItem("timeZone");
          if (storedTimeZone) {
            try {
              const parsed = JSON.parse(storedTimeZone);
              if (parsed?.state?.timeZone) {
                state?.setSelectedTimeZone(parsed?.state?.timeZone);
              }
              const extraTimeZones = parsed?.state?.extraTimeZones;
              if (Array.isArray(extraTimeZones)) {
                useAvailabilityGridStore.setState({
                  extraTimeZones: extraTimeZones
                    .filter((zone): zone is string => typeof zone === "string" && isSupportedTimeZone(zone))
                    .slice(0, MAX_DISPLAY_TIME_ZONES - 1)
                });
              }
            } catch {}
          }
        }
      }
    )
  )
);

// Every time zone shown beside the grid, left to right. The last one is the primary.
export function getDisplayTimeZones(
  state: Pick<AvailabilityGridState, "eventData" | "extraTimeZones" | "selectedTimeZone">
): string[] {
  const primary = isSupportedTimeZone(state.selectedTimeZone) ? state.selectedTimeZone : state.eventData.timeZone;
  const extras = state.extraTimeZones.filter((zone) => zone !== primary && isSupportedTimeZone(zone));
  return [...new Set([...extras, primary])].filter(Boolean).slice(-MAX_DISPLAY_TIME_ZONES);
}

export default useAvailabilityGridStore;
