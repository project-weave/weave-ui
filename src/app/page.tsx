"use client";
import { useRef } from "react";

import NewEventPage from "./(event)/new/page";

const TITLE = "find time for \n what's important";
const SUBTITLE =
  "The hardest part about getting together is finding time for it. With Weave, you'll be able to schedule group events with ease, and enjoy doing so.";

export default function LandingPage() {
  const titleRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col items-center">
      <div
        className="mt-8 grid max-h-[70rem] w-full"
        style={{
          gridTemplateRows: "40% 20% 40%"
        }}
      >
        <h1 className="mt-5 whitespace-pre-line text-center text-[5rem] font-semibold tracking-wide">{TITLE} </h1>
      </div>

      <h1 className="tracing-wider w-4/5 content-center pt-10 text-center text-2xl font-medium">{SUBTITLE}</h1>

      <button
        className="text-m mt-16 h-auto rounded-2xl bg-primary px-12 py-2 align-bottom font-bold text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          titleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        Create Event
      </button>

      <div className="pb-24 pt-24" ref={titleRef}>
        <NewEventPage />
      </div>
    </div>
  );
}
