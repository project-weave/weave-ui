import { useQuery } from "@tanstack/react-query";

import { Event, EventResponse } from "@/types/Event";
import axios from "@/utils/axios";

export interface GetEventResponse {
  event: Event;
  responses: EventResponse[];
}

const mockEvent: GetEventResponse = {
  event: {
    dates: Array.from({ length: 31 }, (_, i) => `2025-01-${String(i + 1).padStart(2, "0")}`),
    endTime: "21:00:00",
    id: "12345",
    isSpecificDates: true,
    name: "Mock Event",
    startTime: "09:00:00",
    timeZone: "UTC"
  },
  responses: [
    {
      alias: "John",
      availabilities: [
        "2025-01-05 10:00:00",
        "2025-01-06 14:00:00",
        "2025-01-07 15:00:00",
        "2025-01-10 13:00:00",
        "2025-01-12 16:00:00",
        "2025-01-15 09:00:00"
      ],
      userId: "user_abc_001"
    },
    {
      alias: "Emily",
      availabilities: [
        "2025-01-05 10:00:00", // Overlaps with John
        "2025-01-06 14:00:00", // Overlaps with John
        "2025-01-10 13:00:00", // Overlaps with John
        "2025-01-12 17:00:00",
        "2025-01-15 09:00:00", // Overlaps with John
        "2025-01-18 11:30:00"
      ],
      userId: "user_abc_002"
    },
    {
      alias: "Raj",
      availabilities: [
        "2025-01-05 10:00:00", // Overlaps with John & Emily
        "2025-01-06 14:00:00", // Overlaps
        "2025-01-08 10:00:00",
        "2025-01-12 16:00:00", // Overlaps with John
        "2025-01-15 09:00:00", // Overlaps with both
        "2025-01-22 18:00:00"
      ],
      userId: "user_abc_003"
    },
    {
      alias: "Lena",
      availabilities: [
        "2025-01-06 14:00:00", // Overlaps with John, Emily, Raj
        "2025-01-08 10:00:00", // Overlaps with Raj
        "2025-01-10 13:00:00", // Overlaps with John, Emily
        "2025-01-12 16:00:00", // Overlaps with John, Raj
        "2025-01-15 09:00:00", // Overlaps with everyone
        "2025-01-18 11:30:00" // Overlaps with Emily
      ],
      userId: "user_abc_004"
    },
    {
      alias: "Carlos",
      availabilities: [
        "2025-01-05 10:00:00", // Overlaps with others
        "2025-01-06 14:00:00", // Overlaps with many
        "2025-01-12 16:00:00", // Common popular time
        "2025-01-15 09:00:00", // Everyone’s in
        "2025-01-22 18:00:00", // Matches Raj
        "2025-01-25 19:00:00"
      ],
      userId: "user_abc_005"
    }
  ]
};

export async function getEvent(eventId: string) {
  try {
    const { data } = await axios.get(`/api/v1/event/${eventId}`);
    return data;
  } catch (error) {
    console.warn("Backend is unavailable. Using mock event data.");

    return mockEvent;
  }
}

const useGetEvent = (eventId: string) => {
  return useQuery({
    queryFn: () => getEvent(eventId),
    queryKey: ["event", eventId],
    refetchOnWindowFocus: true
  });
};

export default useGetEvent;
