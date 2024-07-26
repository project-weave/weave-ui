"use client";
import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridInfoPanel from "@/components/availability-grid/info-panel/availability-grid-info-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import useGetEvent, { GetEventResponse } from "@/hooks/requests/useGetEvent";
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
    setEventData(data as GetEventResponse);
  }, [data, setEventData]);

  if (isPending) {
    return (
      <div className="grid h-[46rem] w-full grid-flow-col justify-center gap-3 pb-4">
        <div className="w-[20rem]">
          <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
        </div>
        <div className="w-[56rem]">
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
    <div className="mt-4 grid h-fit w-full grid-flow-col justify-center gap-3 pb-4">
      <div className="hidden w-[20rem] lg:block">
        <AvailabilityGridInfoPanel />
      </div>
      <div className="min-h-[40rem] w-[56rem] sm:min-h-[44rem]">
        <AvailabilityGrid />
      </div>
    </div>
  );
}
