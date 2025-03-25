"use client";

import { useChat } from "@ai-sdk/react";
import { isAxiosError } from "axios";
import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridBottomPanel from "@/components/availability-grid/panel/availability-grid-bottom-panel";
import AvailabilityGridLeftPanel from "@/components/availability-grid/panel/availability-grid-left-panel";
import Chat from "@/components/chat";
import { MediaQueryLG, MediaQueryXXS } from "@/components/media-query";
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
      <div className="mb-10 mt-4 grid h-fit w-full grid-flow-col justify-center gap-3">
        <div className="hidden h-[85vh] max-h-[50rem] min-h-[28rem] w-[18rem] lg:block xl:w-[20rem]">
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
    <div className="flex flex-col">
      <Chat />
      <div className="mt-4 grid w-full grid-flow-col justify-center gap-3 pb-4">
        <MediaQueryLG>
          <div className="sticky top-[4.3rem] h-[85vh] max-h-[50rem] min-h-[28rem] w-[18rem] xl:w-[20rem]">
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
    </div>
  );
}
