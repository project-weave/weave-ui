"use client";

import { isAxiosError } from "axios";
import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridBottomPanel from "@/components/availability-grid/panel/availability-grid-bottom-panel";
import AvailabilityGridLeftPanel from "@/components/availability-grid/panel/availability-grid-left-panel";
import { MediaQueryLG, MediaQueryXXS } from "@/components/media-query";
import { SettingsIsland } from "@/components/settings-island";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import useGetEvent, { GetEventResponse } from "@/hooks/requests/useGetEvent";
import { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore from "@/store/availabilityGridStore";

export default function Event() {
  const params = useParams<{ eventId: string }>();
  const { data, error, isError, isPending } = useGetEvent(params.eventId);

  const setEventData = useAvailabilityGridStore((state) => state.setEventData);
  const resetGridState = useAvailabilityGridStore(useShallow((state) => state.resetGridState));

  const { toast } = useToast();

  const handleCopyClick = () => {
    // Add your copy link logic here
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Event link has been copied to clipboard"
    });
  };

  useEffect(() => {
    resetGridState();
    window.scrollTo(0, 0);
    return resetGridState();
  }, [resetGridState]);

  useEffect(() => {
    setEventData(data as GetEventResponse);
  }, [data, setEventData]);

  if (isPending) {
    return (
      <div className="mb-10 mt-4 grid h-fit w-full grid-flow-col justify-center gap-5">
        <div className="hidden h-[85vh] max-h-[50rem] min-h-[28rem] w-[22rem] lg:block xl:w-[24rem]">
          <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
        </div>
        <div className="h-full w-[25rem] xs:w-[95vw] lg:w-[44rem] xl:w-[56rem]">
          <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
        </div>
      </div>
    );
  }

  if (isError) {
    let message = "Please try again later.";
    if (isAxiosError(error)) {
      switch (error.response?.status) {
        case 400:
        case 404:
          message = "The event that you are looking for does not exist.";
          break;
        case 401:
        case 403:
          message = "You are not authorized to access this event.";
          break;
      }
    }
    toast({
      description: message,
      title: "Uh Oh! Something went wrong.",
      variant: "failure"
    });
    redirect("/");
  }

  return (
    <div className="mb-24 flex flex-col">
      <div className="mt-9 grid w-full grid-flow-col justify-center gap-6 pb-4">
        <MediaQueryLG>
          <div className="sticky top-[4.5rem] h-[85vh] max-h-[50rem] min-h-[28rem] w-[22rem] xl:w-[24rem]">
            <AvailabilityGridLeftPanel />
          </div>
        </MediaQueryLG>
        <div className="h-full w-[25rem] xs:w-[95vw] md:w-[45rem] lg:w-[44rem] xl:w-[56rem]">
          <AvailabilityGrid />
        </div>
      </div>
      <MediaQueryXXS maxScreenSize={ScreenSize.LG}>
        <AvailabilityGridBottomPanel />
      </MediaQueryXXS>

      <SettingsIsland onCopyClick={handleCopyClick} />
    </div>
  );
}
