"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

import NewEventForm from "@/components/new-event-form";
import { Button } from "@/components/ui/button";

// const SUBTITLE =
//   "The hardest part about getting together is finding time for it. With Weave, you'll be able to schedule group events with ease, and enjoy doing so.";
const CREATE_A_WEAVE = "Create a Weave";

export default function LandingPage() {
  const eventFormRef = useRef<HTMLDivElement | null>(null);

  const words = ["friends", "family", "colleagues", "you"];
  const wordHeight = 77;

  return (
    <div className="mt-48 flex flex-col items-center">
      <div className="grid h-full w-full">
        <h1 className="flex flex-col text-center text-[2.6rem] font-semibold leading-[3.2rem] sm:mt-8 sm:leading-[3rem] md:text-[3.7rem] md:leading-[4rem] xl:text-[4.3rem] xl:leading-[4.3rem]">
          <div>find time for</div>
          <div className="relative h-[50px] overflow-hidden sm:mt-0 sm:h-[50px] md:h-[68px] xl:h-[75px] ">
            <motion.div
              animate={{
                y: [
                  0,
                  0,
                  -wordHeight,
                  -wordHeight,
                  -2 * wordHeight,
                  -2 * wordHeight,
                  -3 * wordHeight,
                  -3 * wordHeight,
                  0
                ]
              }}
              className="flex flex-col align-top"
              transition={{ duration: 10, ease: "anticipate", repeat: Infinity }}
            >
              {words.map((word, index) => (
                <div className="relative mb-[26px] flex h-[50px] justify-center text-start text-primary" key={index}>
                  <p>{word}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </h1>
      </div>

      <Button
        className="mt-8 h-auto px-10 py-3 text-sm md:mt-16 md:px-16  md:text-lg"
        onClick={() => {
          eventFormRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        {CREATE_A_WEAVE}
      </Button>

      <div className="mt-28 h-full min-h-screen w-full pb-10 sm:pb-0">
        <div className="pt-20" ref={eventFormRef}>
          <NewEventForm />
        </div>
      </div>
    </div>
  );
}
