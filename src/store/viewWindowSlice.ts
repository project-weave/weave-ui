export type ViewWindowSlice = {
  availabilityGridViewWindowSize: number;
  getMaxLeftMostColumnInView: () => number;
  isPaginationRequired: () => boolean;
  leftMostColumnInView: number;
  nextPage: () => void;
  previousPage: () => void;
  setAvailabilityGridViewWindowSize: (availabilityGridViewWindowSize: number) => void;
  setLeftMostColumnInView: (column: number) => void;
};

export const createViewWindowSlice = (set, get): ViewWindowSlice => ({
  availabilityGridViewWindowSize: 4,
  getMaxLeftMostColumnInView: () =>
    Math.max(0, get().eventData.sortedEventDates.length - get().availabilityGridViewWindowSize),
  isPaginationRequired: () => get().availabilityGridViewWindowSize < get().eventData.sortedEventDates.length,
  leftMostColumnInView: 0,
  nextPage: () =>
    set((state) => {
      return {
        hoveredTimeSlot: null,
        leftMostColumnInView: ensureWithinBounds(
          0,
          get().getMaxLeftMostColumnInView(),
          state.leftMostColumnInView + state.availabilityGridViewWindowSize
        )
      };
    }),
  previousPage: () =>
    set((state) => {
      return {
        hoveredTimeSlot: null,
        leftMostColumnInView: ensureWithinBounds(
          0,
          get().getMaxLeftMostColumnInView(),
          state.leftMostColumnInView - state.availabilityGridViewWindowSize
        )
      };
    }),
  setAvailabilityGridViewWindowSize: (availabilityGridViewWindowSize: number) =>
    set({ availabilityGridViewWindowSize }),
  setLeftMostColumnInView: (size: number) =>
    set({ leftMostColumnInView: ensureWithinBounds(0, get().getMaxLeftMostColumnInView(), size) })
});

function ensureWithinBounds(min: number, max: number, newVal: number): number {
  const withinBound = Math.max(min, newVal);
  return Math.min(withinBound, max);
}
