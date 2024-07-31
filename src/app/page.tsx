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
    <div className="mt-14 flex flex-col items-center">
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

      <p className="mt-10 hidden w-9/12 text-center font-medium sm:mt-8 sm:block sm:w-8/12 md:mt-10 md:text-lg xl:w-9/12 xl:px-10 xl:text-xl 2xl:w-3/4">
        {SUBTITLE}
      </p>

      <Button
        className="mt-16 h-auto px-8 py-3 text-sm md:mt-20 md:px-10 md:py-4 md:text-base xl:px-12 "
        onClick={() => {
          eventFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        {CREATE_A_WEAVE}
      </Button>

      <div className="h-full min-h-screen w-full pb-10 sm:mt-10 xl:mt-20">
        <div className="pt-24 sm:pt-[6rem]" ref={eventFormRef}>
          <NewEventForm />
        </div>
      </div>
    </div>
  );
}
