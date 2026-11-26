"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const TYPE_MS = 90;
const DELETE_MS = 45;
const HOLD_MS = 1600;
const PAUSE_MS = 350;

/**
 * Types a word letter by letter, holds it, backspaces it, then types the next one, with a blinking cursor.
 * With reduced motion it just swaps the whole word every couple of seconds.
 */
export default function TypingWords({ words }: { words: string[] }) {
  const reduceMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const word = words[wordIndex % words.length];

  useEffect(() => {
    if (reduceMotion) {
      const timeout = setTimeout(() => setWordIndex((index) => index + 1), 2500);
      return () => clearTimeout(timeout);
    }
    let delay = isDeleting ? DELETE_MS : TYPE_MS;
    if (!isDeleting && length === word.length) delay = HOLD_MS;
    if (isDeleting && length === 0) delay = PAUSE_MS;

    const timeout = setTimeout(() => {
      if (!isDeleting && length === word.length) return setIsDeleting(true);
      if (isDeleting && length === 0) {
        setIsDeleting(false);
        setWordIndex((index) => index + 1);
        return;
      }
      setLength((current) => current + (isDeleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(timeout);
  }, [isDeleting, length, reduceMotion, word.length]);

  const shown = reduceMotion ? word : word.slice(0, length);
  // the cursor stays solid while typing and blinks while waiting
  const isWaiting = !reduceMotion && ((!isDeleting && length === word.length) || (isDeleting && length === 0));

  return (
    <span aria-hidden="true" className="whitespace-nowrap">
      <span className="text-primary">{shown}</span>
      <span
        className={
          "ml-1 inline-block h-[0.85em] w-[0.06em] translate-y-[0.08em] bg-primary " +
          (isWaiting || reduceMotion ? "animate-cursor-blink" : "")
        }
      />
    </span>
  );
}
