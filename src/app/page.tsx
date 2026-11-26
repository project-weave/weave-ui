"use client";

import NewEventForm from "@/components/new-event-form";

const SUBTITLE =
  "Weave is designed to help you save time. Whether it's seeing your friends or planning a club meeting, we've got you covered.";

/**
 * Landing page: a short heading and subtitle, then the create event form beside the big calendar,
 * laid out like the event page.
 */
export default function LandingPage() {
  return (
    <div className="flex w-full flex-col pb-12">
      {/* same side padding and width as the cards below, so the heading lines up with the form */}
      <div className="w-full px-6 pb-10 pt-12 sm:px-8 md:pb-12 md:pt-20 lg:px-5">
        <div className="mx-auto w-full max-w-[82rem]">
          <h1 className="text-[2rem] font-medium leading-[2.5rem] tracking-tight text-black">
            Find time for <span className="text-primary">what&apos;s important</span>
          </h1>
          <p className="mt-2 max-w-[30rem] text-sm leading-[1.4rem] text-text-light">{SUBTITLE}</p>
        </div>
      </div>
      <NewEventForm />
    </div>
  );
}
