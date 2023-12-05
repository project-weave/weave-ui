// "use client";
// import AvailabilityGrid from "@/components/availability-grid/availability-grid";
// import AvailabilityGridInfoPanel from "@/components/availability-grid/info-panel/availability-grid-info-panel";
// import { useRef } from "react";
// import { VariableSizeList } from "react-window";

// export default function EventPage() {
//   const gridContainerRef = useRef<VariableSizeList>(null);

//   return (
//     <div className="grid h-full grid-flow-col justify-center gap-3 pb-4">
//       <div className="w-[20rem]">
//         <AvailabilityGridInfoPanel gridContainerRef={gridContainerRef} />
//       </div>
//       <AvailabilityGrid gridContainerRef={gridContainerRef} />
//     </div>
//   );
// }

"use client";
import AvailabilityGrid from "@/components/availability-grid/availability-grid";
import AvailabilityGridInfoPanel from "@/components/availability-grid/info-panel/availability-grid-info-panel";
import Image from "next/image";
import Calendar from "@/components/event-date-calendar";
import { MONTH_FORMAT } from "@/components/event-date-calendar";
import EventForm from "@/components/event-form";
import { EventDate } from "@/store/availabilityGridStore";
import { format, startOfToday } from "date-fns";
import { useState } from "react";

export default function LandingPage() {
  const today = startOfToday();

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(format(today, MONTH_FORMAT));
  const [selectedDates, setSelectedDates] = useState(new Set<EventDate>());

  return (
    <div className="flex flex-col items-center space-y-6 pt-20 list-none">
      <li>
        <a href="#createSchedule">
          <Image alt="weave-logo" height={50} src="/placeholder.jpg" width={1250} />
        </a>
      </li>

      <li>
        <a href="#createSchedule">
          <div className="flex items-center justify-center pt-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              className="absolute h-12 w-12"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </a>
      </li>

      <div className="pt-20 text-3xl font-bold">
        <h1>find time for what's important</h1>
      </div>

      <div className="text-xl font-bold">
        <h3>create. add. share.</h3>
      </div>

      <div className="pb-20 pt-20" id="createSchedule">
        <div className="mt-3 flex select-none flex-row gap-4">
          <EventForm
            currentCalendarMonth={currentCalendarMonth}
            selectedDates={selectedDates}
            setCurrentCalendarMonth={setCurrentCalendarMonth}
            setSelectedDates={setSelectedDates}
          />
          <Calendar
            currentMonthOverride={currentCalendarMonth}
            id="create-event-calendar-lg"
            isViewMode={false}
            selectedDates={selectedDates}
            setCurrentMonthOverride={setCurrentCalendarMonth}
            setSelectedDates={setSelectedDates}
            size="large"
          />
        </div>
      </div>
    </div>
  );
}
