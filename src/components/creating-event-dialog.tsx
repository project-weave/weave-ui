"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

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
        // a plain white page behind it rather than the dimmed, blurred backdrop other popups use
        className={cn(MODAL_SIZE, "z-[1001] gap-0 border-0 p-5 shadow-none outline-none focus:outline-none")}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        // above everything on the page, including the phone's pinned Create Weave button
        overlayClassName="z-[1000] bg-white backdrop-blur-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{isCreated ? "Event created" : "Creating your event"}</DialogTitle>
        <DialogDescription className="sr-only">
          {isCreated ? "Taking you to your event" : "Setting up your event"}
        </DialogDescription>

        <ol aria-live="polite" className="flex flex-col gap-2.5">
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
          </AnimatePresence>
        </ol>
        {/* the finish looks like the app's toasts: a light grey pill with a check */}
        <AnimatePresence>
          {isCreated && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex justify-center"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-light-gray bg-input px-5 py-2.5 text-sm text-black shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                Event created
              </span>
            </motion.div>
          )}
        </AnimatePresence>
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
            className="flex h-5 w-5 items-center justify-center text-primary"
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
            className="h-4 w-4 animate-spin rounded-full border-2 border-light-gray border-t-primary motion-reduce:animate-none"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="working"
          />
        )}
      </AnimatePresence>
    </span>
  );
}
