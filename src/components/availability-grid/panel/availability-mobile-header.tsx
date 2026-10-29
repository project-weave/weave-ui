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
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  return (
    <section className="card mb-4 h-auto px-4 py-3 lg:hidden">
      <h1>
        <button
          aria-controls={detailsId}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-3 rounded-sm text-left text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setExpanded(!expanded)}
          type="button"
        >
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{eventName}</span>
          <Image
            alt=""
            className={cn("shrink-0 transition-transform", expanded && "rotate-180")}
            height={24}
            src="/icons/weave/chevron.svg"
            width={24}
          />
        </button>
      </h1>
      <p className="mt-1 text-xs text-text-light">
        {formatEventDateRange(sortedEventDates, availabilityType === AvailabilityType.SPECIFIC_DATES)}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <AvailabilityResponsesCount />
        <button
          aria-controls={detailsId}
          aria-expanded={expanded}
          className="rounded-sm text-xs text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setExpanded(!expanded)}
          type="button"
        >
          {expanded ? "Hide participants" : "Show participants"}
        </button>
      </div>
      <div className="mt-4 border-t pt-3" hidden={!expanded} id={detailsId}>
        <AvailabilityParticipantFilters />
      </div>
    </section>
  );
}
