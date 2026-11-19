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
      toast({ description: "Link copied", duration: 3000, variant: "success" });
      return true;
    } catch {
      toast({ description: "Couldn't copy the link. Copy it from your browser's address bar.", variant: "failure" });
      return false;
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
    // The page is locked to the viewport on every screen size: the containers never move and only the
    // calendar scrolls inside its card. On desktop the control bar sits 50px below the containers;
    // on mobile it floats at the bottom, so the containers stop just above it.
    <div className="flex h-[calc(100dvh-3.25rem)] min-w-0 flex-col overflow-hidden px-3 pb-[calc(1rem+54px+0.75rem+env(safe-area-inset-bottom))] sm:px-5 sm:pb-[calc(1.5rem+54px+0.75rem+env(safe-area-inset-bottom))] md:h-[calc(100dvh-3.75rem)] lg:min-h-[38rem] lg:pb-6">
      <div className="mx-auto mt-9 flex min-h-0 w-full max-w-[82rem] flex-1 flex-col gap-3 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <MediaQueryLG>
          <div className="hidden h-full min-h-0 min-w-0 lg:block">
            <AvailabilityGridLeftPanel />
          </div>
        </MediaQueryLG>
        <div className="shrink-0 lg:hidden">
          <AvailabilityMobileHeader />
        </div>
        <div className="min-h-0 min-w-0 flex-1 lg:h-full">
          <AvailabilityGrid />
        </div>
      </div>
      <SettingsIsland onCopyClick={handleCopyClick} />
    </div>
  );
}
