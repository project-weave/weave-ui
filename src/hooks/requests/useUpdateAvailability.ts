import { GetEventResponse } from "@/hooks/requests/useGetEvent";
import { TimeSlot } from "@/store/availabilityGridStore";
import { EventResponse } from "@/types/event";
import axios from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateAvailabilityRequest {
  alias: string;
  availabilities: TimeSlot[];
  eventId: string;
  // TODO: add userId
}

async function updateAvailability({
  alias,
  availabilities,
  eventId
}: UpdateAvailabilityRequest): Promise<UpdateAvailabilityRequest> {
  return axios.post(`/api/v1/event/${eventId}/availability`, { alias, availabilities });
}

const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAvailability,

    onError: (err, newEventData, context) => {
      const prevEventData = (context as { prevEventData: GetEventResponse }).prevEventData;
      queryClient.setQueryData(["event", `${prevEventData.event.id}`], prevEventData);
    },

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["event", `${data.eventId}`] });

      const prevEventData = queryClient.getQueryData(["event", `${data.eventId}`]);

      queryClient.setQueryData(["event", `${data.eventId}`], (prevEventData: GetEventResponse) => {
        let updatedResponses = [];
        const prevResonse = prevEventData.responses.find((response) => response.alias === data.alias);

        // TODO: fix userID
        const newResponse: EventResponse = { alias: data.alias, availabilities: data.availabilities, userId: "" };

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
    onSettled: (data) => {
      if (data !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["event", `${data.eventId}`] });
      }
    }
  });
};

export default useUpdateAvailability;
