"use client";
import NewEventForm from "@/components/new-event-form";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const SUBTITLE =
  "The hardest part about getting together is finding time for it. With Weave, you'll be able to schedule group events with ease, and enjoy doing so.";
const CREATE_A_WEAVE = "Create a Weave";

export default function LandingPage() {
  const titleRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="grid w-full"
        style={{
          gridTemplateRows: "40% 20% 40%"
        }}
      >
        <h1 className="flex flex-col text-center text-[2.3rem] font-semibold leading-[2.7rem] sm:mt-8 sm:text-[2.7rem] sm:leading-[3rem] md:text-[3.7rem] md:leading-[4rem] lg:text-[4.3rem] lg:leading-[4.3rem] ">
          <div>find time for</div>
          <div>
            <span>what&apos;s&nbsp;</span>
            <span className="text-primary">important.</span>
          </div>
        </h1>
      </div>

      <p className="mt-4 w-10/12 pt-7 text-center text-xs font-medium sm:px-2  sm:text-sm md:mt-6 md:w-10/12 md:px-0 md:text-xl lg:mt-8 lg:w-9/12 lg:px-10 lg:text-2xl xl:w-3/4">
        {SUBTITLE}
      </p>

      <Button
        className="mt-14 h-auto px-8 py-3 text-xs md:mt-20 md:px-12 md:py-4 lg:text-lg"
        onClick={() => {
          titleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        {CREATE_A_WEAVE}
      </Button>

      <div className="w-full pt-24 lg:pb-24" ref={titleRef}>
        <NewEventForm />
      </div>
    </div>
  );
}
