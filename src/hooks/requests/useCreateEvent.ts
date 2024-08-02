import { EventDate, EventTime } from "@/types/Event";
import axios from "@/utils/axios";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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
}

async function createEvent(request: CreateEventRequest): Promise<CreateEventResponse> {
  const { data } = await axios.post(`/api/v1/event`, request);
  return data;
}

const useCreateEvent = () => {
  const queryClient = new QueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createEvent,

    onSuccess: async (data) => {
      await queryClient.prefetchQuery({ queryFn: () => getEvent(data.eventId), queryKey: ["event", data.eventId] });
      router.push(`${data.eventId}`);
    }
  });
};

export default useCreateEvent;
