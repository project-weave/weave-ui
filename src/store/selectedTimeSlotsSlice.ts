import { TimeSlot } from "@/types/Event";

export type SelectedTimeSlotsSlice = {
  addSelectedTimeSlots: (toAdd: TimeSlot[]) => void;
  removeSelectedTimeSlots: (toRemove: TimeSlot[]) => void;
  selectedTimeSlots: TimeSlot[];
  setSelectedTimeSlots: (selectedTimeSlots: TimeSlot[]) => void;
};

export const createSelectedTimeSlotsSlice = (set, get): SelectedTimeSlotsSlice => ({
  addSelectedTimeSlots: (toAdd: TimeSlot[]) => {
    set((state) => {
      const newSelectedTimeSlots = [...state.selectedTimeSlots];
      toAdd.forEach((timeSlot) => {
        if (!newSelectedTimeSlots.includes(timeSlot)) {
          newSelectedTimeSlots.push(timeSlot);
        }
      });
      return { selectedTimeSlots: newSelectedTimeSlots };
    });
  },
  removeSelectedTimeSlots: (toRemove: TimeSlot[]) => {
    set((state) => {
      const newSelectedTimeSlots: TimeSlot[] = [];
      state.selectedTimeSlots.forEach((timeSlot) => {
        if (!toRemove.includes(timeSlot)) {
          newSelectedTimeSlots.push(timeSlot);
        }
      });
      return { selectedTimeSlots: newSelectedTimeSlots };
    });
  },
  selectedTimeSlots: [],
  setSelectedTimeSlots: (selectedTimeSlots: TimeSlot[]) => set({ selectedTimeSlots })
});
