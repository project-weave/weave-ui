import { useShallow } from "zustand/react/shallow";

import TimeZoneDropdown from "@/components/timezone-dropdown";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { isSupportedTimeZone } from "@/utils/timeZone";

// Small time zone picker that sits in the grid's top-left corner, directly above the time labels.
// TODO: allow adding a second time zone column
export default function AvailabilityGridTimeZoneSelect() {
  const eventTimeZone = useAvailabilityGridStore((state) => state.eventData.timeZone);
  const [selectedTimeZone, setSelectedTimeZone] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeZone, state.setSelectedTimeZone])
  );

  return (
    <div className="flex h-full w-full items-end justify-end bg-white pb-2 pr-2">
      <TimeZoneDropdown
        compact
        error={false}
        gridDropdown
        onChange={setSelectedTimeZone}
        originalTimeZone={eventTimeZone}
        selected={isSupportedTimeZone(selectedTimeZone) ? selectedTimeZone : eventTimeZone}
      />
    </div>
  );
}
