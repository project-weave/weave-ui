import { useQuery } from "@tanstack/react-query";

import { Event, EventResponse } from "@/types/Event";
import axios from "@/utils/axios";

export interface GetEventResponse {
  event: Event;
  responses: EventResponse[];
}

export async function getEvent(eventId: string) {
  const { data } = await axios.get(`/api/v1/event/${eventId}`);
  return data;
}

const useGetEvent = (eventId: string) => {
  return useQuery({
    queryFn: () => getEvent(eventId),
    queryKey: ["event", eventId],
    refetchOnWindowFocus: true
  });
};

export default useGetEvent;
