"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridLeftPanel from "@/components/availability-grid/panel/availability-grid-left-panel";
import AvailabilityMobileHeader from "@/components/availability-grid/panel/availability-mobile-header";
import { MediaQueryLG } from "@/components/media-query";
import { SettingsIsland } from "@/components/settings-island";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import useGetEvent from "@/hooks/requests/useGetEvent";
import useAvailabilityGridStore from "@/store/availabilityGridStore";

export default function Event() {
  const params = useParams<{ eventId: string }>();
  const { data, error, isError, isFetching, isPending, refetch } = useGetEvent(params.eventId);

  const setEventData = useAvailabilityGridStore((state) => state.setEventData);
  const loadedEventId = useAvailabilityGridStore((state) => state.eventData.eventId);
  const resetGridState = useAvailabilityGridStore(useShallow((state) => state.resetGridState));

  const { toast } = useToast();

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ variant: "success", description: "Event link copied" });
    } catch {
      toast({ variant: "failure", description: "Unable to copy the link. Copy it from your browser’s address bar." });
    }
  };

  useEffect(() => {
    resetGridState();
    window.scrollTo(0, 0);
    return () => resetGridState();
  }, [params.eventId, resetGridState]);

  useEffect(() => {
    if (data) setEventData(data);
  }, [data, setEventData]);

  if (isPending || (data && loadedEventId !== data.event.id)) {
    return (
      <div className="mx-auto mb-10 mt-9 grid h-fit w-full max-w-[82rem] grid-cols-1 gap-5 px-3 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="hidden h-[85vh] max-h-[50rem] min-h-[28rem] min-w-0 lg:block">
          <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
        </div>
        <div className="h-[85vh] min-w-0">
          <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
        </div>
      </div>
    );
  }

  if (isError && !data) {
    let title = "Unable to load this event";
    let message = "Check your connection and try again.";
    if (isAxiosError(error)) {
      switch (error.response?.status) {
        case 400:
        case 404:
          title = "Event not found";
          message = "The event that you are looking for does not exist.";
          break;
        case 401:
        case 403:
          title = "This event is unavailable";
          message = "You are not authorized to access this event.";
          break;
      }
    }
    return (
      <div className="mx-auto mt-16 w-full max-w-lg px-5">
        <section aria-labelledby="event-error-title" className="card space-y-4" role="alert">
          <h1 className="text-xl font-medium" id="event-error-title">
            {title}
          </h1>
          <p className="text-sm text-text-light">{message}</p>
          <div className="flex flex-wrap gap-3">
            <Button disabled={isFetching} onClick={() => refetch()} type="button">
              {isFetching ? "Trying again…" : "Try again"}
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Create a Weave</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mb-28 flex min-w-0 flex-col px-3 sm:px-5">
      <div className="mx-auto mt-9 grid w-full max-w-[82rem] grid-cols-1 gap-5 pb-4 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)]">
        <MediaQueryLG>
          <div className="sticky top-[4.5rem] hidden h-[85vh] max-h-[50rem] min-h-[28rem] min-w-0 lg:block">
            <AvailabilityGridLeftPanel />
          </div>
        </MediaQueryLG>
        <div className="min-w-0">
          <AvailabilityMobileHeader />
          <AvailabilityGrid />
        </div>
      </div>
      <SettingsIsland onCopyClick={handleCopyClick} />
    </div>
  );
}
