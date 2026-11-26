"use client";

import NewEventForm from "@/components/new-event-form";
import TypingWords from "@/components/typing-words";

const WORDS = ["what's important", "friends", "family", "your team"];
const SUBTITLE =
  "Weave is designed to help you save time. Whether it's seeing your friends or planning a club meeting, we've got you covered.";

/**
 * Landing page: a short heading ("Find time for ___", typed out one phrase after another) and subtitle,
 * then the create event form beside the big calendar, laid out like the event page.
 */
export default function LandingPage() {
  return (
    <div className="flex w-full flex-col pb-12">
      {/* same side padding and width as the cards below, so the heading lines up with the form */}
      <div className="w-full px-6 pb-6 pt-6 sm:px-8 md:pt-10 lg:px-5">
        <div className="mx-auto w-full max-w-[82rem]">
          <h1
            aria-label={`Find time for ${WORDS.join(", ")}`}
            className="min-h-[5rem] text-[2rem] font-medium leading-[2.5rem] tracking-tight text-black sm:min-h-0"
          >
            <span aria-hidden="true">Find time for </span>
            <TypingWords words={WORDS} />
          </h1>
          <p className="mt-2 max-w-[30rem] text-sm leading-[1.4rem] text-text-light">{SUBTITLE}</p>
        </div>
      </div>
      <NewEventForm />
    </div>
  );
}
