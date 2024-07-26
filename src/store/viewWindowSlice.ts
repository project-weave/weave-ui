export type ViewWindowSlice = {
  availabilityGridViewWindowSize: number;
  getMaxLeftMostColumnInView: () => number;
  isPaginationRequired: () => boolean;
  leftMostColumnInView: number;
  nextPage: () => void;
  previousPage: () => void;
  setAvailabilityGridViewWindowSize: (viewWindowSize: number) => void;
  setLeftMostColumnInView: (column: number) => void;
};

export const createViewWindowSlice = (set, get): ViewWindowSlice => ({
  availabilityGridViewWindowSize: 8,
  getMaxLeftMostColumnInView: () => get().eventData.sortedEventDates.length - get().availabilityGridViewWindowSize,
  isPaginationRequired: () => get().availabilityGridViewWindowSize < get().eventData.sortedEventDates.length,
  leftMostColumnInView: 0,
  nextPage: () =>
    set((state) => {
      return {
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
        leftMostColumnInView: ensureWithinBounds(
          0,
          get().getMaxLeftMostColumnInView(),
          state.leftMostColumnInView - state.availabilityGridViewWindowSize
        )
      };
    }),
  setAvailabilityGridViewWindowSize: (viewWindowSize: number) => set({ viewWindowSize }),
  setLeftMostColumnInView: (size: number) =>
    set({ leftMostColumnInView: ensureWithinBounds(0, get().getMaxLeftMostColumnInView(), size) })
});

function ensureWithinBounds(min: number, max: number, newVal: number): number {
  const withinBound = Math.max(min, newVal);
  return Math.min(withinBound, max);
}
