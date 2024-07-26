import { EventDate, EventTime } from "@/types/Event";
import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export interface CreateEventResponse {
  eventId: string;
}

export interface CreateEventRequest {
  dates: EventDate[];
  endTime: EventTime;
  isSpecificDates: boolean;
  name: string;
  startTime: EventTime;
}

async function createEvent(request: CreateEventRequest): Promise<CreateEventResponse> {
  const { data } = await axios.post(`/api/v1/event`, request);
  return data;
}

const useCreateEvent = () => {
  return useMutation({
    mutationFn: createEvent
  });
};

export default useCreateEvent;
