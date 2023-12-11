import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

type SpeechBubbleProps = {
  animationDelay?: number;
  avatarColour: string;
  children: React.ReactNode;
  colour: string;
  height: string;
  isAvatarLeft: boolean;
  width: string;
};

export default function SpeechBubble({
  animationDelay,
  avatarColour,
  children,
  colour,
  height,
  isAvatarLeft,
  width
}: SpeechBubbleProps) {
  const animationControls = useAnimation();

  useEffect(() => {
    animationControls.start({
      scale: [1, 1.1, 1],
      transition: { delay: animationDelay, duration: 0.8, ease: "easeInOut" },
      x: [0, isAvatarLeft ? 15 : -15, 0],
      y: [0, -10, 0]
    });
  }, [animationControls, animationDelay, isAvatarLeft]);

  return (
    <div className="flex flex-row">
      {isAvatarLeft && (
        <div className={`mr-3 h-10 w-10 self-end rounded-full`} style={{ backgroundColor: avatarColour }} />
      )}
      <motion.div
        animate={animationControls}
        className={cn(`cursor-pointer rounded-[2rem] rounded-bl-none px-7 pt-5`, {
          "rounded-bl-[2rem] rounded-br-none hover:-translate-x-2": !isAvatarLeft
        })}
        style={{
          backgroundColor: colour,
          height: height,
          width: width
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        whileHover={{ scale: 1.05, x: isAvatarLeft ? 10 : -10, y: -5 }}
      >
        {children}
      </motion.div>
      {!isAvatarLeft && (
        <div className={`ml-3 h-10 w-10 self-end rounded-full`} style={{ backgroundColor: avatarColour }} />
      )}
    </div>
  );
}
