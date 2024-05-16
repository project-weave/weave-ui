"use client";
import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridInfoPanel from "@/components/availability-grid/info-panel/availability-grid-info-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import useGetEvent, { GetEventResponse } from "@/hooks/requests/useGetEvent";
import {
  AvailabilityType,
  EVENT_TIME_FORMAT,
  EventDate,
  EventTime,
  getTimeSlot,
  TIME_SLOT_INTERVAL_MINUTES,
  TimeSlot
} from "@/store/availabilityGridStore";
import { isAxiosError } from "axios";
import { addMinutes, format, parseISO } from "date-fns";
import { redirect, useParams } from "next/navigation";
import { useRef } from "react";
import { VariableSizeList } from "react-window";

export default function Event() {
  const params = useParams<{ eventId: string }>();
  const { data, error, isError, isPending } = useGetEvent(params.eventId);
  const { toast } = useToast();
  const gridContainerRef = useRef<VariableSizeList>(null);

  if (isPending) {
    return (
      <div className="grid h-fit min-h-[50rem] grid-flow-col justify-center gap-3 pb-4">
        <div className="w-[20rem]">
          <Skeleton className="h-full w-full rounded-md bg-primary-light/30" />
        </div>
        <div className="w-[60rem]">
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

  const { event, responses }: GetEventResponse = data;

  const availabilityType = event.isSpecificDates ? AvailabilityType.SPECIFIC_DATES : AvailabilityType.DAYS_OF_WEEK;

  const sortedEventTimes: EventTime[] = [];

  let currentTime = parseISO(getTimeSlot(event.startTime));

  const endTime = parseISO(getTimeSlot(event.endTime));

  while (currentTime <= endTime) {
    const formattedTime = format(currentTime, EVENT_TIME_FORMAT);
    sortedEventTimes.push(formattedTime);
    currentTime = addMinutes(currentTime, TIME_SLOT_INTERVAL_MINUTES);
  }

  // TODO: handle case when there are no event dates, waiting to fetch
  const sortedEventDates = event.dates.sort((date1: EventDate, date2: EventDate) => {
    return parseISO(date1).getTime() - parseISO(date2).getTime();
  });

  // TODO: use user_id as well when logged in users functionality is implemented

  const allParticipants = responses
    .map((response) => response.alias)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const timeSlotsToParticipants: Record<TimeSlot, string[]> = {};
  // TODO: use user_id as well when logged in users functionality is implemented
  responses.forEach(({ alias, availabilities }) => {
    (availabilities || []).forEach((timeSlot) => {
      if (timeSlotsToParticipants[timeSlot] === undefined) {
        timeSlotsToParticipants[timeSlot] = [];
      }
      timeSlotsToParticipants[timeSlot].push(alias);
    });
  });

  return (
    <div className="grid h-fit grid-flow-col justify-center gap-3 pb-4">
      <div className="w-[20rem]">
        <AvailabilityGridInfoPanel
          allParticipants={allParticipants}
          availabilityType={availabilityType}
          eventDates={event.dates}
          eventName={event.name}
          gridContainerRef={gridContainerRef}
          sortedEventDates={sortedEventDates}
          timeSlotsToParticipants={timeSlotsToParticipants}
        />
      </div>
      <div className="min-h-[50rem]">
        <AvailabilityGrid
          allParticipants={allParticipants}
          availabilityType={availabilityType}
          eventDates={event.dates}
          eventEndTime={event.endTime}
          eventId={event.id}
          eventResponses={responses}
          eventStartTime={event.startTime}
          gridContainerRef={gridContainerRef}
          sortedEventDates={sortedEventDates}
          sortedEventTimes={sortedEventTimes}
          timeSlotsToParticipants={timeSlotsToParticipants}
        />
      </div>
    </div>
  );
}
