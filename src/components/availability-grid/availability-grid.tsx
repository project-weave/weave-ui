"use client";
import useUpdateAvailability, { UpdateAvailabilityRequest } from "@/hooks/requests/useUpdateAvailability";
import useAvailabilityGridStore, {
  AvailabilityGridMode,
  AvailabilityType,
  EventDate,
  EventTime,
  TimeSlot
} from "@/store/availabilityGridStore";
import { type EventResponse } from "@/types/Event";
import { useEffect } from "react";
import { VariableSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";

import { useToast } from "../ui/use-toast";
import AvailabilityGridCells from "./availability-grid-cells";

type AvailbilityGridProps = {
  availabilityType: AvailabilityType;
  eventDates: EventDate[];
  eventEndTime: EventTime;
  eventId: string;
  eventResponses: EventResponse[];
  eventStartTime: EventTime;
  gridContainerRef: React.RefObject<VariableSizeList>;
  allParticipants: string[];
  timeSlotsToParticipants: Record<TimeSlot, string[]>;
  sortedEventDates: EventDate[];
  sortedEventTimes: EventTime[];
};

export default function AvailabilityGrid({
  availabilityType,
  eventDates,
  eventEndTime,
  eventId,
  eventResponses,
  eventStartTime,
  gridContainerRef,
  allParticipants,
  timeSlotsToParticipants,
  sortedEventDates,
  sortedEventTimes
}: AvailbilityGridProps) {
  const [user, setUser] = useAvailabilityGridStore(useShallow((state) => [state.user, state.setUser]));
  const setUserFilter = useAvailabilityGridStore(useShallow((state) => state.setUserFilter));
  const setIsBestTimesEnabled = useAvailabilityGridStore(useShallow((state) => state.setIsBestTimesEnabled));
  const setMode = useAvailabilityGridStore(useShallow((state) => state.setMode));
  const [selectedtimeSlots, setSelectedTimeSlots] = useAvailabilityGridStore(
    useShallow((state) => [state.selectedTimeSlots, state.setSelectedTimeSlots])
  );

  const { mutate } = useUpdateAvailability();
  const { toast } = useToast();

  // TODO: add timezone logic

  function setGridStateForUser(user: string) {
    setUser(user);
    setIsBestTimesEnabled(false);
    setUserFilter([]);

    const userResponse = eventResponses.find(({ alias }) => {
      // TODO: use user_id as well when logged in users functionality is implemented
      return user === alias;
    });

    if (userResponse !== undefined) {
      setSelectedTimeSlots(userResponse.availabilities || []);
    } else {
      setSelectedTimeSlots([]);
    }
  }

  useEffect(() => {
    return setGridStateForUser("");
  }, []);

  useEffect(() => {
    // adjust grid container dimensions when dates or times are changed s
    gridContainerRef.current?.resetAfterIndex(0);
  }, [eventDates, eventStartTime, eventEndTime, gridContainerRef]);

  function handleSaveUserAvailability() {
    setUser("");
    setMode(AvailabilityGridMode.VIEW);

    const req: UpdateAvailabilityRequest = {
      alias: user,
      availabilities: Array.from(selectedtimeSlots),
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
  }

  return (
    <AvailabilityGridCells
      allParticipants={allParticipants}
      availabilityType={availabilityType}
      eventEndTime={eventEndTime}
      gridContainerRef={gridContainerRef}
      handleSaveUserAvailability={handleSaveUserAvailability}
      handleUserChange={setGridStateForUser}
      sortedEventDates={sortedEventDates}
      sortedEventTimes={sortedEventTimes}
      timeSlotsToParticipants={timeSlotsToParticipants}
    />
  );
}
