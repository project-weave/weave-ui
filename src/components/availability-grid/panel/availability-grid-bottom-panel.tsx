import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import useEventResponsesFilters from "@/hooks/useEventResponsesFilters";
import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import EditAvailabilityDialog from "../dialog/edit-availability-dialog";
import AvailbilityGridResponseFilterButton from "./availability-grid-response-filter-button";

const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";
const RESPONSES_TITLE = "Responses";
const COPY_LINK = "Copy Link";

type AvailabilityGridBottomPanelProps = {
  handleSaveUserAvailability: (user: string) => void;
};

export default function AvailabilityGridBottomPanel({ handleSaveUserAvailability }: AvailabilityGridBottomPanelProps) {
  const { allParticipants, eventId } = useAvailabilityGridStore((state) => state.eventData);

  const user = useAvailabilityGridStore((state) => state.user);
  const mode = useAvailabilityGridStore((state) => state.mode);

  const [accordionOpen, setAccordionOpen] = useState(false);
  const [accordionExplicitlyClosed, setAccordionExplicitlyClosed] = useState(false);

  const isAnyTimeSlotHovered = useAvailabilityGridStore((state) => state.hoveredTimeSlot !== null);

  const MotionButton = motion(Button);

  const {
    allParticipantsWithCurrentUser,
    currentResponseCount,
    currentResponses,
    onFliterClicked,
    totalResponseCount
  } = useEventResponsesFilters();

  useEffect(() => {
    if (accordionExplicitlyClosed || totalResponseCount === 0) return;
    if (isAnyTimeSlotHovered) setAccordionOpen(true);
  }, [isAnyTimeSlotHovered, accordionExplicitlyClosed, totalResponseCount]);

  const saveUserAvailabilityButton = (
    <MotionButton
      className="h-[2rem] whitespace-nowrap rounded-[.5rem]"
      onClick={() => handleSaveUserAvailability(user)}
      variant="default"
      whileTap={{ scale: 0.94 }}
    >
      {SAVE_AVAILABILITY_BUTTON_TEXT}
    </MotionButton>
  );

  const editUserAvailabilityButton = (
    <EditAvailabilityDialog allParticipants={allParticipants} className="h-[2rem] whitespace-nowrap rounded-[.5rem]" />
  );

  return (
    <>
      <div style={{ height: accordionOpen && isViewMode(mode) ? "calc(8.6rem + 14vh)" : "8.2rem" }}></div>
      <div
        className={cn(
          "fixed bottom-0 w-full rounded-t-3xl bg-background pb-5 shadow-[0px_-1px_6px_1px] shadow-gray-100",
          isEditMode(mode) && "rounded-t-none pt-2"
        )}
      >
        <div className="flex w-full flex-col">
          {isViewMode(mode) && (
            <ResponsesAccordion
              accordionOpen={accordionOpen}
              allParticipantsWithCurrentUser={allParticipantsWithCurrentUser}
              currentResponseCount={currentResponseCount}
              currentResponses={currentResponses}
              onFilterClicked={onFliterClicked}
              setAccordionExplicitlyClosed={setAccordionExplicitlyClosed}
              setAccordionOpen={setAccordionOpen}
              totalResponseCount={totalResponseCount}
            />
          )}
          <div className="z-10 mx-auto grid w-full max-w-[45rem] grid-flow-col justify-between px-6 pt-4">
            <MotionButton
              className="h-[2rem] rounded-[.5rem] border-2 text-sm"
              onClick={() => {
                const url = `${window.location.origin}/${eventId}`;
                navigator.clipboard.writeText(url);
                toast({
                  className: "w-fit ml-auto py-4 text-sm md:w-full md:py-6",
                  description: "Copied link to clipboard.",
                  variant: "success"
                });
              }}
              variant="outline"
              whileTap={{ scaleX: 0.97 }}
            >
              {COPY_LINK} <Copy className="ml-2 h-4 w-4" />
            </MotionButton>
            <div className="text-sm">{isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function ResponsesAccordion({
  accordionOpen,
  allParticipantsWithCurrentUser,
  currentResponseCount,
  currentResponses,
  onFilterClicked,
  setAccordionExplicitlyClosed,
  setAccordionOpen,
  totalResponseCount
}) {
  return (
    <>
      <header
        className={cn(
          "flex h-[3rem] w-full items-center justify-between rounded-t-2xl border-[1px] border-b-0 border-accent bg-background px-6 pt-1 text-center font-medium sm:border-2 sm:border-b-0 md:px-14",
          totalResponseCount !== 0 && "cursor-pointer",
          !accordionOpen && "border-b-[1px] border-accent sm:border-2"
        )}
        onClick={() => {
          if (totalResponseCount === 0) return;
          setAccordionOpen((isOpen) => {
            if (isOpen) setAccordionExplicitlyClosed(true);
            return !isOpen;
          });
        }}
      >
        <span className="ml-1 flex">
          <p className="text-secondary">{RESPONSES_TITLE}</p>
          <p className="ml-4 text-secondary">
            {currentResponseCount}/{totalResponseCount}
          </p>
        </span>
        {totalResponseCount !== 0 && (
          <motion.div
            animate={{ rotate: accordionOpen ? "-180deg" : "0" }}
            className="mr-2"
            initial={false}
            transition={{ ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-secondary" />
          </motion.div>
        )}
      </header>

      <AnimatePresence initial={false}>
        {accordionOpen && totalResponseCount !== 0 && (
          <>
            <motion.section
              animate="accordionOpen"
              className="flex h-full max-h-[14vh] w-full justify-center overflow-y-scroll border-t-[1px] border-accent bg-background scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary-light sm:border-t-2"
              exit="collapsed"
              initial="collapsed"
              key="content"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              variants={{
                accordionOpen: { height: "auto", opacity: 1 },
                collapsed: { height: 0, opacity: 0 }
              }}
            >
              <div className="mx-5 mb-2 mt-2 max-w-[40rem] flex-1 px-1 text-secondary xs:mx-6 md:my-4 ">
                {allParticipantsWithCurrentUser.map((name) => (
                  <AvailbilityGridResponseFilterButton
                    className="m-1 p-[3px] text-[0.74rem]"
                    currentResponses={currentResponses}
                    key={`${name}-filter-button-bottom-panel`}
                    name={name}
                    onFilterClicked={onFilterClicked}
                  />
                ))}
              </div>
            </motion.section>
            <motion.div
              animate="open"
              className="h-1 border-b-[1px] border-accent pt-1 sm:border-b-2"
              exit="collapsed"
              initial="collapsed"
              transition={{ duration: 0.24, ease: "easeOut" }}
              variants={{
                collapsed: { height: 0, opacity: 0 },
                open: { height: "auto", opacity: 1 }
              }}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
