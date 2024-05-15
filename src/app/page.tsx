"use client";
import NewEventForm from "@/components/new-event-form";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const SUBTITLE =
  "The hardest part about getting together is finding time for it. With Weave, you'll be able to schedule group events with ease, and enjoy doing so.";
const CREATE_A_WEAVE = "Create a Weave";

export default function LandingPage() {
  const eventFormRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex h-fit w-full flex-col items-center">
      <div className="mt-16 grid w-full">
        <h1 className="flex flex-col text-center text-[2.3rem] font-semibold leading-[2.7rem] sm:mt-8 sm:text-[2.7rem] sm:leading-[3rem] md:text-[3.7rem] md:leading-[4rem] xl:text-[4.3rem] xl:leading-[4.3rem] ">
          <div>find time for</div>
          <div>
            <span>what&apos;s&nbsp;</span>
            <span className="text-primary">important.</span>
          </div>
        </h1>
      </div>

      <p className="mt-4 w-10/12 pt-7 text-center text-xs font-medium sm:px-2 sm:text-sm md:mt-6 md:w-10/12 md:px-0 md:text-xl xl:mt-8 xl:w-9/12 xl:px-10 xl:text-2xl 2xl:w-3/4">
        {SUBTITLE}
      </p>

      <Button
        className="mt-20 h-auto px-8 py-3 text-xs sm:mt-24 md:mt-28 md:px-12 md:py-4 md:text-sm xl:text-lg"
        onClick={() => {
          eventFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        {CREATE_A_WEAVE}
      </Button>

      <div className="mb-12 mt-16 h-full w-full sm:mt-52 xl:mb-48 xl:mt-32 2xl:mb-[30rem]">
        <div className="pt-20 sm:pt-[7rem] md:pt-[7.5rem]" ref={eventFormRef}>
          <NewEventForm />
        </div>
      </div>
    </div>
  );
}
