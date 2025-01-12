import dynamic from "next/dynamic";
import { forwardRef } from "react";

import { EventDateCalendarProps } from "@/components/event-date-calendar";

import { Skeleton } from "./ui/skeleton";

const NoSSREventDateCalendar = dynamic(() => import("@/components/event-date-calendar"), {
  loading: () => <Skeleton className="h-full min-h-[17rem] w-full rounded-md bg-primary-light/30" />,
  ssr: false
});

const ForwardedEventDateCalendar = forwardRef<HTMLDivElement, EventDateCalendarProps>((props, ref) => {
  return <NoSSREventDateCalendar forwardedRef={ref} {...props} />;
});

export default ForwardedEventDateCalendar;
