import { useEffect } from "react";

type useRegisterNonPassiveTouchEventsProps = {
  onTouchCancel?: (event: TouchEvent) => void;
  onTouchEnd?: (event: TouchEvent) => void;
  onTouchMove?: (event: TouchEvent) => void;
  onTouchStart?: (event: TouchEvent) => void;
  ref: React.RefObject<HTMLElement>;
};

export default function useRegisterNonPassiveTouchEvents({
  onTouchCancel,
  onTouchEnd,
  onTouchMove,
  onTouchStart,
  ref
}: useRegisterNonPassiveTouchEventsProps) {
  useEffect(() => {
    if (!ref?.current) return;
    const currentRef = ref.current;

    if (onTouchStart) currentRef.addEventListener("touchstart", onTouchStart, { passive: false });
    if (onTouchMove) currentRef.addEventListener("touchmove", onTouchMove, { passive: false });
    if (onTouchEnd) currentRef.addEventListener("touchend", onTouchEnd, { passive: false });
    if (onTouchCancel) currentRef.addEventListener("touchcancel", onTouchCancel, { passive: false });

    return () => {
      if (onTouchStart) currentRef.removeEventListener("touchstart", onTouchStart);
      if (onTouchMove) currentRef.removeEventListener("touchmove", onTouchMove);
      if (onTouchEnd) currentRef.removeEventListener("touchend", onTouchEnd);
      if (onTouchCancel) currentRef.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd, onTouchCancel]);
}
