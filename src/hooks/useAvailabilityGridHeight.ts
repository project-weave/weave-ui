import useAvailabilityGridStore, { AvailabilityType } from "@/store/availabilityGridStore";
import debounce from "lodash.debounce";
import { useEffect, useState } from "react";

export default function useAvailabilityGridHeight() {
  const { sortedEventTimes, availabilityType } = useAvailabilityGridStore((state) => state.eventData);
  const [gridHeightStyle, setGridHeightStyle] = useState("fit-content");

  useEffect(() => {
    function handleResize() {
      const approxGridHeaderHeight = availabilityType === AvailabilityType.SPECIFIC_DATES ? 110 : 85;
      const columnHeaderHeight = availabilityType === AvailabilityType.SPECIFIC_DATES ? 62.4 : 52.8;
      const topBottomCellHeight = 11.2;
      const timeSlotCellHeight = 24;

      const approxGridHeight =
        columnHeaderHeight +
        sortedEventTimes.length * timeSlotCellHeight +
        2 * topBottomCellHeight +
        approxGridHeaderHeight;

      const approxTopSpacing = 72; // approx height of nav and top padding
      const approxBottomSpacing = 0.15 * window.innerHeight + 96; // approx height of bottom panel with accordion open
      const leewaySpace = 60;

      const approxMaxHeight = window.innerHeight - approxTopSpacing - approxBottomSpacing - leewaySpace;

      if (approxGridHeight <= approxMaxHeight) {
        setGridHeightStyle(`${approxMaxHeight}px`);
      } else {
        setGridHeightStyle("fit-content");
      }
    }

    handleResize();

    const debouncedEventListener = debounce(handleResize, 500);

    window.addEventListener("resize", debouncedEventListener);
    return () => {
      window.removeEventListener("resize", debouncedEventListener);
    };
  }, [sortedEventTimes]);

  return gridHeightStyle;
}
