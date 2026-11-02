import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GetEventResponse } from "@/hooks/requests/useGetEvent";
import { EventResponse } from "@/types/Event";
import { TimeSlot } from "@/types/Timeslot";
import axios from "@/utils/axios";

export interface UpdateAvailabilityRequest {
  alias: string;
  availabilities: TimeSlot[];
  eventId: string;
  userId?: string;
}

async function updateAvailability({
  alias,
  availabilities,
  eventId,
  userId
}: UpdateAvailabilityRequest): Promise<void> {
  await axios.post(`/api/v1/event/${eventId}/availability`, { alias, availabilities, ...(userId ? { userId } : {}) });
}

function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateAvailabilityRequest, { prevEventData: GetEventResponse | undefined }>({
    mutationFn: updateAvailability,

    onError: (_error, variables, context) => {
      if (context?.prevEventData) {
        queryClient.setQueryData(["event", variables.eventId], context.prevEventData);
      }
    },

    onMutate: async (data) => {
      // cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey: ["event", `${data.eventId}`] });

      const prevEventData = queryClient.getQueryData<GetEventResponse>(["event", data.eventId]);

      queryClient.setQueryData<GetEventResponse>(["event", data.eventId], (prevEventData) => {
        if (!prevEventData) return prevEventData;
        let updatedResponses: EventResponse[] = [];
        const prevResonse = prevEventData.responses.find((response) => response.alias === data.alias);

        // TODO: fix userID
        const newResponse: EventResponse = {
          alias: data.alias,
          availabilities: data.availabilities,
          userId: prevResonse?.userId ?? ""
        };

        if (prevResonse === undefined) {
          updatedResponses = [...prevEventData.responses, newResponse];
        } else {
          updatedResponses = prevEventData.responses.map((response) => {
            if (response.alias === data.alias) return newResponse;
            return response;
          });
        }

        return {
          ...prevEventData,
          responses: updatedResponses
        };
      });

      // return context object of snapshotted value
      return { prevEventData };
    },
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] })
  });
}

export default useUpdateAvailability;
