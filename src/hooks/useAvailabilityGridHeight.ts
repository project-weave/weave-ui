import debounce from "lodash.debounce";
import { useEffect, useState } from "react";

import useScreenSize, { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";

// NOTE: this height is only applied to screen sizes that are less than ScreenSize.MD
export default function useAvailabilityGridHeight() {
  const { availabilityType, sortedEventTimes } = useAvailabilityGridStore((state) => state.eventData);
  const [gridHeightStyle, setGridHeightStyle] = useState("fit-content");

  const screenSize = useScreenSize();

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

      const approxTopSpacing = 72;
      const approxBottomPanelSpacing =
        screenSize <= ScreenSize.SM ? 116 + 0.14 * window.innerHeight : 135 + 0.18 * window.innerHeight;
      const leewaySpace = 50;

      const approxMaxHeight = window.innerHeight - approxTopSpacing - approxBottomPanelSpacing - leewaySpace;

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
  }, [sortedEventTimes, screenSize]);

  return gridHeightStyle;
}
