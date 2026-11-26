"use client";

import NewEventForm from "@/components/new-event-form";
import TypingWords from "@/components/typing-words";

const WORDS = ["friends", "family", "colleagues", "you"];

/**
 * Landing page: "find time for ___" (typed out, one word after another) on the left, vertically centred,
 * with the create event form beside it. On phones the heading sits at the top left with the form right under it.
 */
// (the page pulls itself up over the space the layout keeps for the navbar, which the landing page doesn't have)
export default function LandingPage() {
  return (
    <div className="mx-auto -mt-[3.25rem] flex w-full max-w-[64rem] flex-col gap-6 px-6 pb-10 pt-10 sm:px-8 md:-mt-[3.75rem] lg:min-h-[100dvh] lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-5 lg:py-12">
      <h1
        aria-label={`find time for ${WORDS.join(", ")}`}
        className="text-left text-[2.6rem] font-semibold leading-[3.1rem] md:text-[3.7rem] md:leading-[4.2rem] xl:text-[4.3rem] xl:leading-[4.8rem]"
      >
        <span aria-hidden="true" className="block">
          find time for
        </span>
        {/* fixed height so the form doesn't jump while letters are typed and deleted */}
        <span className="block h-[3.1rem] md:h-[4.2rem] xl:h-[4.8rem]">
          <TypingWords words={WORDS} />
        </span>
      </h1>

      <div className="w-full min-w-0 sm:max-w-[24rem] lg:w-[22rem] lg:shrink-0">
        <NewEventForm />
      </div>
    </div>
  );
}
