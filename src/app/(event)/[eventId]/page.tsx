"use client";
import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridInfoPanel from "@/components/availability-grid/info-panel/availability-grid-info-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import useGetEvent, { GetEventResponse } from "@/hooks/requests/useGetEvent";
import { MediaQueryLG } from "@/hooks/useScreenSize";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { isAxiosError } from "axios";
import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";

export default function Event() {
  const params = useParams<{ eventId: string }>();
  const { data, error, isError, isPending } = useGetEvent(params.eventId);
  const { toast } = useToast();
  const setEventData = useAvailabilityGridStore((state) => state.setEventData);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setEventData(data as GetEventResponse);
  }, [data, setEventData]);

  if (isPending) {
    return (
      <div className="mt-4 grid h-fit w-full grid-flow-col justify-center gap-3 pb-10">
        <MediaQueryLG>
          <div className="w-[20rem]">
            <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
          </div>
        </MediaQueryLG>
        <div className="min-h-[40rem] w-[24rem] xs:w-[28rem] sm:min-h-[44rem] sm:w-[36rem] md:w-[40rem] lg:w-[44rem] xl:w-[56rem]">
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
    <div className="mt-4 grid h-fit w-full grid-flow-col justify-center gap-3 pb-10">
      <MediaQueryLG>
        <div className="w-[18rem] xl:w-[20rem]">
          <AvailabilityGridInfoPanel />
        </div>
      </MediaQueryLG>
      <div className="h-fit min-h-[40rem] w-[24rem] xs:w-[28rem] sm:min-h-[44rem] sm:w-[36rem] md:w-[40rem] lg:w-[40rem] xl:w-[56rem]">
        <AvailabilityGrid />
      </div>
      {/* <div className="fixed bottom-0 h-40">Herelajs</div>
      <div className="bottom-40 h-40"></div> */}
    </div>
  );
}
