"use client";
import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridBottomPanel from "@/components/availability-grid/panel/availability-grid-bottom-panel";
import AvailabilityGridLeftPanel from "@/components/availability-grid/panel/availability-grid-left-panel";
import { MediaQueryLG, MediaQueryXXS } from "@/components/media-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import useGetEvent, { GetEventResponse } from "@/hooks/requests/useGetEvent";
import useUpdateAvailability, { UpdateAvailabilityRequest } from "@/hooks/requests/useUpdateAvailability";
import { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { AvailabilityGridMode } from "@/store/availabilityGridStore";
import { isAxiosError } from "axios";
import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export default function Event() {
  const params = useParams<{ eventId: string }>();
  const { data, error, isError, isPending } = useGetEvent(params.eventId);

  const { eventId } = useAvailabilityGridStore((state) => state.eventData);
  const setEventData = useAvailabilityGridStore((state) => state.setEventData);
  const resetGridState = useAvailabilityGridStore(useShallow((state) => state.resetGridState));
  const setMode = useAvailabilityGridStore(useShallow((state) => state.setMode));
  const selectedTimeSlots = useAvailabilityGridStore(useShallow((state) => state.selectedTimeSlots));

  const { mutate } = useUpdateAvailability();
  const { toast } = useToast();

  useEffect(() => {
    resetGridState();
    window.scrollTo(0, 0);
    return resetGridState();
  }, []);

  useEffect(() => {
    setEventData(data as GetEventResponse);
  }, [data, setEventData]);

  if (isPending) {
    return (
      <div className="mb-10 mt-4 grid h-fit w-full grid-flow-col justify-center gap-3">
        <div className="hidden h-[85vh] max-h-[50rem] min-h-[28rem] w-[18rem] lg:block xl:w-[20rem]">
          <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
        </div>
        <div className="h-full w-[24rem] xs:w-[28rem] sm:w-[36rem] md:w-[40rem] lg:w-[44rem] xl:w-[56rem]">
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

  function handleSaveUserAvailability(user: string) {
    const req: UpdateAvailabilityRequest = {
      alias: user,
      availabilities: Array.from(selectedTimeSlots),
      eventId: eventId
    };

    mutate(req, {
      onError: () => {
        toast({
          description: "An error occurred while saving your availability. Please try again later.",
          title: "Oh no! Something went wrong",
          variant: "failure"
        });
      },
      onSuccess: () => {
        toast({
          description: "Your availability has been successfully recorded.",
          title: "Congrats!",
          variant: "success"
        });
      }
    });

    setMode(AvailabilityGridMode.VIEW);
    resetGridState();
  }

  return (
    <div className="flex flex-col">
      <div className="mt-4 grid w-full grid-flow-col justify-center gap-3 pb-4">
        <MediaQueryLG>
          <div className="sticky top-[4.3rem] h-[85vh] max-h-[50rem] min-h-[28rem] w-[18rem] xl:w-[20rem]">
            <AvailabilityGridLeftPanel />
          </div>
        </MediaQueryLG>
        <div className="h-full w-[24rem] xs:w-[28rem] sm:w-[36rem] md:w-[40rem] lg:w-[44rem] xl:w-[56rem]">
          <AvailabilityGrid handleSaveUserAvailability={handleSaveUserAvailability} />
        </div>
      </div>
      <MediaQueryXXS maxScreenSize={ScreenSize.LG}>
        <AvailabilityGridBottomPanel handleSaveUserAvailability={handleSaveUserAvailability} />
      </MediaQueryXXS>
    </div>
  );
}
