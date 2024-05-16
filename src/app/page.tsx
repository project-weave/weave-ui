"use client";
import NewEventForm from "@/components/new-event-form";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRef } from "react";

const SUBTITLE =
  "The hardest part about getting together is finding time for it. With Weave, you'll be able to schedule group events with ease, and enjoy doing so.";
const CREATE_A_WEAVE = "Create a Weave";

export default function LandingPage() {
  const eventFormRef = useRef<HTMLDivElement | null>(null);

  const words = ["friends", "family", "colleagues", "you"];
  const wordHeight = 77;

  return (
    <div className="flex h-fit w-full flex-col items-center">
      <div className="grid w-full">
        <h1 className="flex flex-col text-center text-[2.3rem] font-semibold leading-[2.7rem] sm:mt-8 sm:text-[2.7rem] sm:leading-[3rem] md:text-[3.7rem] md:leading-[4rem] xl:text-[4.3rem] xl:leading-[4.3rem]">
          <div>find time for</div>
          <div className="relative h-[44px] overflow-hidden sm:h-[50px] md:h-[68px] xl:h-[75px] ">
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

      <p className="mt-10 hidden w-9/12 text-center text-sm font-medium sm:mt-8 sm:block sm:w-8/12 sm:text-sm md:mt-10 md:text-lg xl:w-9/12 xl:px-10 xl:text-xl 2xl:w-3/4">
        {SUBTITLE}
      </p>

      <Button
        className="mt-20 h-auto px-10 py-3 text-sm sm:mt-16 md:mt-20 md:px-10 md:py-4 xl:px-12 xl:text-base"
        onClick={() => {
          eventFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        {CREATE_A_WEAVE}
      </Button>

      <div className="mb-24 mt-12 h-full w-full sm:mt-6 md:mt-8 xl:mb-48 xl:mt-12 2xl:mb-[30rem]">
        <div className="pt-20 sm:pt-[7rem] md:pt-[7.5rem]" ref={eventFormRef}>
          <NewEventForm />
        </div>
      </div>
    </div>
  );
}
