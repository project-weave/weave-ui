"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

// how long the hint lingers after the mouse is released
const HIDE_DELAY_MS = 900;

/**
 * When someone presses or drags on the grid while viewing, a toast-style note follows the cursor
 * pointing them to the control bar, since the grid can only be edited in edit mode.
 */
export default function ViewModeDragHint() {
  const mode = useAvailabilityGridStore((state) => state.mode);
  const hasSavedAvailability = useAvailabilityGridStore((state) =>
    state.eventData.eventResponses.some(({ alias }) => state.user !== "" && alias === state.user)
  );
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isViewMode(mode)) {
      setVisible(false);
      return;
    }
    const grid = document.getElementById("availability-grid-dates");
    if (!grid) return;

    let dragging = false;
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      dragging = true;
      clearTimeout(hideTimeout);
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    }
    function onMouseMove(e: MouseEvent) {
      if (dragging) setPosition({ x: e.clientX, y: e.clientY });
    }
    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      hideTimeout = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
    }

    grid.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      clearTimeout(hideTimeout);
      grid.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [mode]);

  if (!position || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed z-[1000] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-light-gray bg-input px-3 py-1.5 text-xs font-normal text-black shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{ left: position.x, top: position.y - 14 }}
    >
      {hasSavedAvailability ? "Want to edit? Switch to Edit below" : "Add your availability below"}
    </div>,
    document.body
  );
}
