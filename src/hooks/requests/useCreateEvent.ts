import { useMutation, useQueryClient } from "@tanstack/react-query";

import { EventDate, EventTime } from "@/types/Timeslot";
import axios from "@/utils/axios";

import { getEvent } from "./useGetEvent";

export interface CreateEventResponse {
  eventId: string;
}

export interface CreateEventRequest {
  dates: EventDate[];
  endTime: EventTime;
  isSpecificDates: boolean;
  name: string;
  startTime: EventTime;
  timeZone: string;
}

async function createEvent(request: CreateEventRequest): Promise<CreateEventResponse> {
  const { data } = await axios.post(`/api/v1/event`, request);
  return data;
}

const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,

    onSuccess: async (data) => {
      // load the new event ahead of time; the create form moves to its page once its animation finishes
      await queryClient.prefetchQuery({ queryFn: () => getEvent(data.eventId), queryKey: ["event", data.eventId] });
    }
  });
};

export default useCreateEvent;
