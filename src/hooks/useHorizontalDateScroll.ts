import { RefObject, useEffect } from "react";

import useAvailabilityGridStore from "@/store/availabilityGridStore";

// Pixels of horizontal wheel/trackpad travel needed to move the grid by one date column
const PIXELS_PER_COLUMN = 60;

/**
 * Lets people scroll sideways through the event dates on the availability grid: a horizontal
 * trackpad swipe, a tilting mouse wheel, or shift + scroll moves the visible dates one column at a time.
 */
export default function useHorizontalDateScroll<T extends HTMLElement>(ref: RefObject<T>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let accumulated = 0;
    let resetTimeout: ReturnType<typeof setTimeout> | undefined;

    function handleWheel(e: WheelEvent) {
      const lineMultiplier = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1;
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = (isHorizontal ? e.deltaX : e.shiftKey ? e.deltaY : 0) * lineMultiplier;
      if (delta === 0) return;

      const state = useAvailabilityGridStore.getState();
      if (!state.isPaginationRequired()) return;
      // keep the browser from treating the swipe as back/forward navigation
      e.preventDefault();

      accumulated += delta;
      clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => (accumulated = 0), 150);

      const columns = Math.trunc(accumulated / PIXELS_PER_COLUMN);
      if (columns === 0) return;
      accumulated -= columns * PIXELS_PER_COLUMN;
      state.setLeftMostColumnInView(state.leftMostColumnInView + columns);
    }

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      clearTimeout(resetTimeout);
      element.removeEventListener("wheel", handleWheel);
    };
  }, [ref]);
}
