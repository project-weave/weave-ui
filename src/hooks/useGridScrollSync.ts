import { RefObject, useEffect, useRef } from "react";

import useAvailabilityGridStore from "@/store/availabilityGridStore";

/**
 * Keeps the availability grid's scroll position and the store's `leftMostColumnInView` in sync:
 * - scrolling sideways (trackpad, shift + wheel, scrollbar) updates which dates count as "in view"
 * - changing the column from elsewhere (arrows, mini calendar, best times) smoothly scrolls the grid there
 */
export default function useGridScrollSync(scrollerRef: RefObject<HTMLElement>, columnWidth: number) {
  const leftMostColumnInView = useAvailabilityGridStore((state) => state.leftMostColumnInView);
  // the column index most recently derived from the scroll position itself
  const columnFromScrollRef = useRef(leftMostColumnInView);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || columnWidth <= 0) return;

    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!scroller) return;
        const state = useAvailabilityGridStore.getState();
        const column = Math.min(
          Math.max(Math.round(scroller.scrollLeft / columnWidth), 0),
          state.getMaxLeftMostColumnInView()
        );
        columnFromScrollRef.current = column;
        if (column !== state.leftMostColumnInView) useAvailabilityGridStore.setState({ leftMostColumnInView: column });
      });
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [columnWidth, scrollerRef]);

  // when the columns resize (window resize, rotation) keep the same first column in view
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || columnWidth <= 0) return;
    scroller.scrollLeft = useAvailabilityGridStore.getState().leftMostColumnInView * columnWidth;
  }, [columnWidth, scrollerRef]);

  // the column was changed by something other than scrolling: glide there
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || columnWidth <= 0) return;
    if (leftMostColumnInView === columnFromScrollRef.current) return;
    columnFromScrollRef.current = leftMostColumnInView;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ behavior: reduceMotion ? "auto" : "smooth", left: leftMostColumnInView * columnWidth });
  }, [columnWidth, leftMostColumnInView, scrollerRef]);
}
