import AvailabilityGrid from "@/components/availability-grid/availability-grid";

// AvailabilityDate is the date portion of a single availability, ie. 2000-11-29
export type AvailabilityDate = string;

// AvailabilityDate is the time portion of a single availability in 24 hour format, ie. 12:00:00
export type AvailabilityTime = string;

// AvailabilityDateTime is an ISO formatted date string that represents a single availbability, ie. 2000-11-29T12:00:00
export type AvailabilityDateTime = string;

// TODO: fetch data from backend and pass in as prop
const sampleData = {
  endTimeUTC: "16:00:00",
  eventDates: [
    "2023-10-01",
    "2023-10-15",
    "2023-10-17",
    "2023-10-18",
    "2023-10-20",
    "2023-10-21",
    "2023-10-22",
    "2023-10-23",
    "2023-10-24",
    "2023-10-26"
  ],
  eventName: "test",
  eventTimeZone: "America/Vancouver",
  startTimeUTC: "08:00:00"
};

export default function EventPage() {
  return (
    <div className="flex h-auto">
      <AvailabilityGrid
        availabilityDates={sampleData.eventDates}
        endAvailabilityTime={sampleData.endTimeUTC}
        eventTimeZone={sampleData.eventTimeZone}
        startAvailabilityTime={sampleData.startTimeUTC}
      />
    </div>
  );
}
