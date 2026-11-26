"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";

import { Dialog, DialogContent, DialogDescription, DialogTitle, MODAL_SIZE } from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

export type CreatingEventStep = {
  // shown while this step is being read, e.g. "Reading event name"
  activeLabel: string;
  // shown once it's done, e.g. "Event name"
  doneLabel: string;
  value: string;
};

type CreatingEventDialogProps = {
  // how many steps are finished; the next one is in progress
  completedSteps: number;
  isCreated: boolean;
  open: boolean;
  steps: CreatingEventStep[];
};

/**
 * Shown while an event is being created. Reads back what's being set up, one line at a time (name, times,
 * time zone, dates), the way an AI agent lists what it's working on, then confirms the event was created.
 */
export default function CreatingEventDialog({ completedSteps, isCreated, open, steps }: CreatingEventDialogProps) {
  const reduceMotion = useReducedMotion();
  const visibleSteps = steps.slice(0, Math.min(completedSteps + 1, steps.length));

  return (
    <Dialog open={open}>
      <DialogContent
        className={cn(MODAL_SIZE, "gap-0 p-5")}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <div className="flex items-center gap-3">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white">
            <Image
              alt=""
              className={cn("h-5 w-5", !isCreated && !reduceMotion && "animate-weave-breathe")}
              height={20}
              src="/favicon.ico"
              width={20}
            />
          </span>
          <div className="min-w-0">
            <DialogTitle className={cn("text-base font-normal", !isCreated && "shimmer-text")}>
              {isCreated ? "Your Weave is ready" : "Creating your Weave"}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-light">
              {isCreated ? "Taking you to your event…" : "Setting up your event"}
            </DialogDescription>
          </div>
        </div>

        <ol aria-live="polite" className="mt-4 flex flex-col gap-2.5 border-t border-[#E5E5E5] pt-4">
          <AnimatePresence initial={false}>
            {visibleSteps.map((step, index) => {
              const isDone = index < completedSteps;
              return (
                <motion.li
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5"
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  key={step.doneLabel}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <StepIcon isDone={isDone} />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs", isDone ? "text-text-light" : "shimmer-text")}>
                      {isDone ? step.doneLabel : `${step.activeLabel}…`}
                    </p>
                    <p className={cn("truncate text-sm", isDone ? "text-black" : "text-text-light")}>{step.value}</p>
                  </div>
                </motion.li>
              );
            })}
            {isCreated && (
              <motion.li
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5"
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                key="created"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                </span>
                <p className="text-sm text-black">Event created</p>
              </motion.li>
            )}
          </AnimatePresence>
        </ol>
      </DialogContent>
    </Dialog>
  );
}

function StepIcon({ isDone }: { isDone: boolean }) {
  return (
    <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
      <AnimatePresence initial={false} mode="wait">
        {isDone ? (
          <motion.span
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/15 flex h-5 w-5 items-center justify-center rounded-full text-primary"
            initial={{ opacity: 0, scale: 0.6 }}
            key="done"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span
            animate={{ opacity: 1 }}
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="working"
          />
        )}
      </AnimatePresence>
    </span>
  );
}
