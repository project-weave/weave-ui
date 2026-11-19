import { RefObject, useEffect, useRef } from "react";

// how long after the last scroll event the element counts as "still scrolling"
const SCROLL_IDLE_MS = 700;

/**
 * Adds an `is-scrolling` class to the element while it is being scrolled (used to show the thin
 * scrollbar only while scrolling) and calls `onScrollStart` once at the start of each scroll.
 */
export default function useScrollingClass<T extends HTMLElement>(
  ref: RefObject<T>,
  onScrollStart?: () => void,
  // pass the open state for elements that only exist sometimes (e.g. dropdown lists) so it re-attaches
  active = true
) {
  const onScrollStartRef = useRef(onScrollStart);
  onScrollStartRef.current = onScrollStart;

  useEffect(() => {
    if (!active) return;
    let element: null | T = null;
    let idleTimeout: ReturnType<typeof setTimeout> | undefined;
    let retryFrame = 0;
    let retries = 0;

    function onScroll() {
      if (!element) return;
      if (!element.classList.contains("is-scrolling")) {
        element.classList.add("is-scrolling");
        onScrollStartRef.current?.();
      }
      clearTimeout(idleTimeout);
      const target = element;
      idleTimeout = setTimeout(() => target.classList.remove("is-scrolling"), SCROLL_IDLE_MS);
    }

    // elements inside popovers can appear a frame or two after `active` turns on
    function attach() {
      element = ref.current;
      if (element) {
        element.addEventListener("scroll", onScroll, { passive: true });
      } else if (retries++ < 10) {
        retryFrame = requestAnimationFrame(attach);
      }
    }
    attach();

    return () => {
      cancelAnimationFrame(retryFrame);
      clearTimeout(idleTimeout);
      element?.removeEventListener("scroll", onScroll);
      element?.classList.remove("is-scrolling");
    };
  }, [ref, active]);
}
