export type ViewWindowSlice = {
  availabilityGridViewWindowSize: number;
  // the right-most date column the person has had on screen this visit (-1 until the grid has laid out)
  furthestColumnSeen: number;
  // the first date column the person hasn't had on screen yet, or null once every date has been seen
  getFirstUnseenColumn: () => null | number;
  getMaxLeftMostColumnInView: () => number;
  isPaginationRequired: () => boolean;
  leftMostColumnInView: number;
  markColumnsInViewSeen: () => void;
  nextPage: () => void;
  previousPage: () => void;
  setAvailabilityGridViewWindowSize: (availabilityGridViewWindowSize: number) => void;
  setLeftMostColumnInView: (column: number) => void;
};

export const createViewWindowSlice = (set, get): ViewWindowSlice => ({
  availabilityGridViewWindowSize: 4,
  furthestColumnSeen: -1,
  getFirstUnseenColumn: () => {
    if (!get().isPaginationRequired()) return null;
    const firstUnseen = get().furthestColumnSeen + 1;
    return firstUnseen < get().eventData.sortedEventDates.length ? firstUnseen : null;
  },
  getMaxLeftMostColumnInView: () =>
    Math.max(0, get().eventData.sortedEventDates.length - get().availabilityGridViewWindowSize),
  isPaginationRequired: () => get().availabilityGridViewWindowSize < get().eventData.sortedEventDates.length,
  leftMostColumnInView: 0,
  markColumnsInViewSeen: () => {
    const { availabilityGridViewWindowSize, eventData, furthestColumnSeen, leftMostColumnInView } = get();
    const lastColumnInView = Math.min(
      leftMostColumnInView + availabilityGridViewWindowSize - 1,
      eventData.sortedEventDates.length - 1
    );
    if (lastColumnInView > furthestColumnSeen) set({ furthestColumnSeen: lastColumnInView });
  },
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
    set((state) => ({
      availabilityGridViewWindowSize,
      hoveredTimeSlot: null,
      leftMostColumnInView: ensureWithinBounds(
        0,
        Math.max(0, state.eventData.sortedEventDates.length - availabilityGridViewWindowSize),
        state.leftMostColumnInView
      )
    })),
  setLeftMostColumnInView: (size: number) =>
    set({ leftMostColumnInView: ensureWithinBounds(0, get().getMaxLeftMostColumnInView(), size) })
});

function ensureWithinBounds(min: number, max: number, newVal: number): number {
  const withinBound = Math.max(min, newVal);
  return Math.min(withinBound, max);
}
