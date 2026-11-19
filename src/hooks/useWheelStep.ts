import { RefObject, useEffect, useRef } from "react";

// Pixels of wheel/trackpad travel needed to move one step, so a trackpad flick doesn't skip many options.
const WHEEL_STEP_THRESHOLD = 40;

/**
 * Lets the user scroll over an element to step through values (e.g. times in a closed dropdown).
 * onStep receives +1 when scrolling down and -1 when scrolling up.
 */
export default function useWheelStep<T extends HTMLElement>(
  ref: RefObject<T>,
  onStep: (direction: -1 | 1) => void,
  enabled = true
) {
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    let accumulatedDelta = 0;
    let resetTimeout: ReturnType<typeof setTimeout> | undefined;

    function handleWheel(e: WheelEvent) {
      // stop the page from scrolling while stepping through values
      e.preventDefault();

      const delta = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaY;
      accumulatedDelta += delta;

      clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => (accumulatedDelta = 0), 200);

      while (Math.abs(accumulatedDelta) >= WHEEL_STEP_THRESHOLD) {
        const direction = accumulatedDelta > 0 ? 1 : -1;
        accumulatedDelta -= direction * WHEEL_STEP_THRESHOLD;
        onStepRef.current(direction);
      }
    }

    // passive: false is required to be able to call preventDefault on wheel events
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      clearTimeout(resetTimeout);
      element.removeEventListener("wheel", handleWheel);
    };
  }, [ref, enabled]);
}
