import { EventDate, EventTime, TimeSlot } from "@/store/availabilityGridStore";

export interface Event {
  dates: EventDate[];
  endTime: EventTime;
  id: string;
  isSpecificDates: boolean;
  name: string;
  startTime: EventTime;
}

export interface EventResponse {
  alias: string;
  availabilities: TimeSlot[];
  userId: string;
}
