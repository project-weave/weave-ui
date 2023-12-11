"use client";
import SpeechBubble from "@/components/ui/speech-bubble";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

import NewEventPage from "./(event)/new/page";

const TEXT_1 = "Is anyone free for a quick meeting this week?";
const TEXT_2 = "flights to LA in June are on sale 🛩️ what dates work?";
const TEXT_3 = "girls night out 👯🥂! are you free this weekend?";
const TEXT_4 = "let's study over midterm break!";
const TEXT_5 = "Hey team! What days work best for our weekly basketball practice? 🏀⛹️";
const TITLE = "find time for what's important";
const SUBTITLE = "create. add. share.";

export default function LandingPage() {
  const titleRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col items-center">
      <div
        className="mt-10 grid max-h-[70rem] w-full"
        style={{
          gridTemplateRows: "40% 20% 40%"
        }}
      >
        <div className="flex h-full w-full items-center justify-between pt-10 text-xl text-white">
          <div className="mr-20 flex flex-row self-end">
            <SpeechBubble
              animationDelay={0.5}
              avatarColour="#B9AFCC"
              colour="#B58DFF"
              height="7.4rem"
              isAvatarLeft={true}
              width="16rem"
            >
              {TEXT_1}
            </SpeechBubble>
          </div>
          <div className="grid h-full grid-cols-2 grid-rows-2">
            <div className="mb-4">
              <SpeechBubble
                animationDelay={1}
                avatarColour="#FBC2DA"
                colour="#4F3F6B"
                height="6rem"
                isAvatarLeft={false}
                width="20rem"
              >
                {TEXT_2}
              </SpeechBubble>
            </div>
            <div className="col-start-2 row-start-2 ml-6 mt-4">
              <SpeechBubble
                animationDelay={2}
                avatarColour="#E0B8FF"
                colour="#907AB7"
                height="6rem"
                isAvatarLeft={false}
                width="18rem"
              >
                {TEXT_3}
              </SpeechBubble>
            </div>
          </div>
        </div>
        <h1 className="mb-10 mt-5 text-center text-[5rem] font-semibold tracking-wide">send a weave.</h1>
        <div className="flex h-full w-full items-center justify-between pt-10 text-xl text-white">
          <div className="mb-20 ml-20">
            <SpeechBubble
              animationDelay={1.5}
              avatarColour="#B2AD96"
              colour="#907AB7"
              height="6rem"
              isAvatarLeft={true}
              width="16rem"
            >
              {TEXT_4}
            </SpeechBubble>
          </div>

          <div className="col-start-2 row-start-2 mr-16 mt-8">
            <SpeechBubble
              animationDelay={1}
              avatarColour="#4E4E4E"
              colour="#4D2E87"
              height="8rem"
              isAvatarLeft={true}
              width="22rem"
            >
              {TEXT_5}
            </SpeechBubble>
          </div>
        </div>
      </div>

      <div className="my-16 cursor-pointer">
        <ChevronDown
          className="duration-100 hover:translate-y-2"
          height={60}
          onClick={() => {
            titleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          width={60}
        />
      </div>

      <div className="tracing-wider pt-32 font-semibold" ref={titleRef}>
        <h1 className="text-3xl">{TITLE}</h1>
        <h3 className="mt-4 text-center text-lg">{SUBTITLE}</h3>
      </div>

      <div className="pb-20 pt-20">
        <NewEventPage />
      </div>
    </div>
  );
}
