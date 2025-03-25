import { useQuery } from "@tanstack/react-query";

import { Event, EventResponse } from "@/types/Event";
import axios from "@/utils/axios";

export interface GetEventResponse {
  event: Event;
  responses: EventResponse[];
}

const mockEvent: GetEventResponse = {
  event: {
    id: "12345",
    name: "Mock Event",
    isSpecificDates: true,
    startTime: "09:00:00",
    endTime: "21:00:00",
    dates: Array.from({ length: 31 }, (_, i) => `2025-01-${String(i + 1).padStart(2, "0")}`),
    timeZone: "UTC"
  },
  responses: [
    {
      alias: "John",
      userId: "user_abc_001",
      availabilities: [
        "2025-01-05 10:00:00",
        "2025-01-06 14:00:00",
        "2025-01-07 15:00:00",
        "2025-01-10 13:00:00",
        "2025-01-12 16:00:00",
        "2025-01-15 09:00:00"
      ]
    },
    {
      alias: "Emily",
      userId: "user_abc_002",
      availabilities: [
        "2025-01-05 10:00:00", // Overlaps with John
        "2025-01-06 14:00:00", // Overlaps with John
        "2025-01-10 13:00:00", // Overlaps with John
        "2025-01-12 17:00:00",
        "2025-01-15 09:00:00", // Overlaps with John
        "2025-01-18 11:30:00"
      ]
    },
    {
      alias: "Raj",
      userId: "user_abc_003",
      availabilities: [
        "2025-01-05 10:00:00", // Overlaps with John & Emily
        "2025-01-06 14:00:00", // Overlaps
        "2025-01-08 10:00:00",
        "2025-01-12 16:00:00", // Overlaps with John
        "2025-01-15 09:00:00", // Overlaps with both
        "2025-01-22 18:00:00"
      ]
    },
    {
      alias: "Lena",
      userId: "user_abc_004",
      availabilities: [
        "2025-01-06 14:00:00", // Overlaps with John, Emily, Raj
        "2025-01-08 10:00:00", // Overlaps with Raj
        "2025-01-10 13:00:00", // Overlaps with John, Emily
        "2025-01-12 16:00:00", // Overlaps with John, Raj
        "2025-01-15 09:00:00", // Overlaps with everyone
        "2025-01-18 11:30:00" // Overlaps with Emily
      ]
    },
    {
      alias: "Carlos",
      userId: "user_abc_005",
      availabilities: [
        "2025-01-05 10:00:00", // Overlaps with others
        "2025-01-06 14:00:00", // Overlaps with many
        "2025-01-12 16:00:00", // Common popular time
        "2025-01-15 09:00:00", // Everyone’s in
        "2025-01-22 18:00:00", // Matches Raj
        "2025-01-25 19:00:00"
      ]
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
