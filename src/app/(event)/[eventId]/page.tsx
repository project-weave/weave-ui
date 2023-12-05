"use client";
import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridInfoPanel from "@/components/availability-grid/info-panel/availability-grid-info-panel";
import { useRef } from "react";
import { VariableSizeList } from "react-window";

export default function EventPage() {
  const gridContainerRef = useRef<VariableSizeList>(null);

  return (
    <div className="grid h-full grid-flow-col justify-center gap-3 pb-4">
      <div className="w-[20rem]">
        <AvailabilityGridInfoPanel gridContainerRef={gridContainerRef} />
      </div>
      <AvailabilityGrid gridContainerRef={gridContainerRef} />
    </div>
  );
}
