import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import useAvailabilityGridStore from "@/store/availabilityGridStore";

export type ScrollEdges = {
  bottom: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
};

const NO_EDGES: ScrollEdges = { bottom: false, left: false, right: false, top: false };

/**
 * Keeps the availability grid's scroll position and the store's `leftMostColumnInView` in sync:
 * - scrolling sideways (trackpad, shift + wheel, scrollbar) updates which dates count as "in view"
 * - changing the column from elsewhere (arrows, mini calendar, best times) smoothly scrolls the grid there
 * Also reports which edges still have more content beyond them, for the edge blurs.
 */
export default function useGridScrollSync(scrollerRef: RefObject<HTMLElement>, columnWidth: number) {
  const leftMostColumnInView = useAvailabilityGridStore((state) => state.leftMostColumnInView);
  // the column index most recently derived from the scroll position itself
  const columnFromScrollRef = useRef(leftMostColumnInView);
  const [edges, setEdges] = useState<ScrollEdges>(NO_EDGES);

  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const { clientHeight, clientWidth, scrollHeight, scrollLeft, scrollTop, scrollWidth } = scroller;
    const next = {
      bottom: scrollTop + clientHeight < scrollHeight - 1,
      left: scrollLeft > 1,
      right: scrollLeft + clientWidth < scrollWidth - 1,
      top: scrollTop > 1
    };
    setEdges((prev) =>
      prev.bottom === next.bottom && prev.left === next.left && prev.right === next.right && prev.top === next.top
        ? prev
        : next
    );
  }, [scrollerRef]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || columnWidth <= 0) return;

    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!scroller) return;
        measure();
        const state = useAvailabilityGridStore.getState();
        const column = Math.min(
          Math.max(Math.round(scroller.scrollLeft / columnWidth), 0),
          state.getMaxLeftMostColumnInView()
        );
        columnFromScrollRef.current = column;
        if (column !== state.leftMostColumnInView) useAvailabilityGridStore.setState({ leftMostColumnInView: column });
      });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [columnWidth, measure, scrollerRef]);

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

  return { edges, measure };
}
