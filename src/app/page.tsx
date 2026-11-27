"use client";

import { useEffect, useRef, useState } from "react";

import { NewWeaveButton } from "@/components/navbar";
import NewEventForm from "@/components/new-event-form";

const SUBTITLE =
  "Weave is designed to help you save time, whether it's seeing your friends or planning a club meeting, we've got you covered.";

/**
 * Landing page: a roomy hero (heading, subtitle and a "New Weave" button that jumps down to the form), then
 * the create event form beside the big calendar, laid out like the event page.
 */
export default function LandingPage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  // room below the cards: the same as the gap above them once they're centred on screen, so jumping to the
  // form centres it with even space top and bottom (at least 3rem, e.g. on phones where the form is tall)
  const [bottomSpace, setBottomSpace] = useState(48);

  // the two cards themselves (the form's row), not the wrapper around the form component
  function getCards() {
    return cardsRef.current?.querySelector<HTMLElement>("#new-event-form")?.parentElement ?? cardsRef.current;
  }

  useEffect(() => {
    const cards = getCards();
    if (!cards) return;
    function measure() {
      if (!cards) return;
      setBottomSpace(Math.max(48, Math.round((window.innerHeight - cards.offsetHeight) / 2)));
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(cards);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  function jumpToForm() {
    const cards = getCards();
    if (!cards) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fitsOnScreen = cards.offsetHeight <= window.innerHeight;
    cards.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: fitsOnScreen ? "center" : "start" });
    cards.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true });
  }

  return (
    <div className="flex w-full flex-col" style={{ paddingBottom: bottomSpace }}>
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
      <div ref={cardsRef}>
        <NewEventForm />
      </div>
    </div>
  );
}
