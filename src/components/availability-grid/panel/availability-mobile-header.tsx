"use client";

import Image from "next/image";
import { useId, useState } from "react";

import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { AvailabilityType } from "@/types/Event";
import { cn } from "@/utils/cn";
import { formatEventDateRange } from "@/utils/date";

import AvailabilityParticipantFilters from "./availability-participant-filters";
import AvailabilityResponsesCount from "./availability-responses-count";

export default function AvailabilityMobileHeader() {
  const { availabilityType, eventName, sortedEventDates } = useAvailabilityGridStore((state) => state.eventData);
  // participants are shown by default
  const [expanded, setExpanded] = useState(true);
  const detailsId = useId();

  return (
    <section aria-label="Event details" className="card h-auto overflow-hidden px-4 py-3 lg:hidden">
      <h1 className="break-words text-lg font-medium [overflow-wrap:anywhere]">{eventName}</h1>
      <p className="mt-1 text-sm text-text-light">
        {formatEventDateRange(sortedEventDates, availabilityType === AvailabilityType.SPECIFIC_DATES)}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <AvailabilityResponsesCount />
        <button
          aria-controls={detailsId}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide participants" : "Show participants"}
          className="-mr-1 rounded-sm p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? "Hide participants" : "Show participants"}
          type="button"
        >
          {/* points up while the participants are showing */}
          <Image
            alt=""
            className={cn("shrink-0 transition-transform duration-200", expanded && "rotate-180")}
            height={20}
            src="/icons/weave/chevron.svg"
            width={20}
          />
        </button>
      </div>
      {/* one row of names; swipe sideways to see the rest */}
      <div className="mt-3" hidden={!expanded} id={detailsId}>
        <AvailabilityParticipantFilters layout="row" />
      </div>
    </section>
  );
}
