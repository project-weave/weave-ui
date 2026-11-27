"use client";

import { NewWeaveButton } from "@/components/navbar";
import NewEventForm from "@/components/new-event-form";

const SUBTITLE =
  "Weave is designed to help you save time, whether it's seeing your friends or planning a club meeting, we've got you covered.";

/**
 * Landing page: a roomy hero (heading, subtitle and a "New Weave" button that jumps down to the form), then
 * the create event form beside the big calendar, laid out like the event page.
 */
export default function LandingPage() {
  function jumpToForm() {
    const form = document.getElementById("new-event-form");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    form?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    form?.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true });
  }

  return (
    <div className="flex w-full flex-col pb-12">
      {/* same side padding and width as the cards below, so the heading lines up with the form. The hero takes
          most of the first screen, with the top of the form showing below it */}
      <div className="flex min-h-[calc(100svh-9rem)] w-full flex-col justify-center px-6 py-20 sm:px-8 md:min-h-[calc(100svh-12rem)] lg:px-5">
        <div className="mx-auto w-full max-w-[82rem]">
          <h1 className="text-[1.75rem] font-medium leading-[2.25rem] tracking-tight text-black sm:text-[2rem] sm:leading-[2.5rem]">
            Find time for what&apos;s <span className="text-primary">important</span>
          </h1>
          <p className="mt-2 max-w-[30rem] text-sm leading-[1.4rem] text-text-light">{SUBTITLE}</p>
          <NewWeaveButton className="mt-6" onClick={jumpToForm} />
        </div>
      </div>
      <NewEventForm />
    </div>
  );
}
