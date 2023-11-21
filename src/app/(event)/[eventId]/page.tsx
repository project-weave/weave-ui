"use client";
import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridInfoPanel from "@/components/availability-grid/info-panel/availability-grid-info-panel";

export default function EventPage() {
  return (
    <div className="grid h-full grid-flow-col justify-center gap-3 pb-4">
      <div className="min-w-[20rem]">
        <AvailabilityGridInfoPanel />
      </div>
      <div className="h-full">
        <AvailabilityGrid />
      </div>
    </div>
  );
}
