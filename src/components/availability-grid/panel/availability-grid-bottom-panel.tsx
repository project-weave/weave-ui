import EditAvailabilityDialog from "../dialog/edit-availability-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import useScreenSize, { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

import AvailbilityGridResponseFilterButton from "./availability-grid-response-filter-button";
import AvailabilityResponsesCount from "./availability-responses-count";

const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";
const COPY_LINK = "Copy Link";

export default function AvailabilityGridBottomPanel() {
  const { eventId } = useAvailabilityGridStore((state) => state.eventData);
  const screenSize = useScreenSize();

  const mode = useAvailabilityGridStore((state) => state.mode);
  const getEventParticipants = useAvailabilityGridStore((state) => state.getEventParticipants);
  const eventParticipants = getEventParticipants();
  const userFilter = useAvailabilityGridStore((state) => state.userFilter);

  const [accordionOpen, setAccordionOpen] = useState(false);
  const [accordionExplicitlyClosed, setAccordionExplicitlyClosed] = useState(false);

  const isAnyTimeSlotHovered = useAvailabilityGridStore((state) => state.hoveredTimeSlot !== null);

  const totalResponseCount = userFilter.length === 0 ? eventParticipants.length : userFilter.length;

  useEffect(() => {
    if (accordionExplicitlyClosed || totalResponseCount === 0) return;
    if (isAnyTimeSlotHovered && !accordionOpen) setAccordionOpen(true);
  }, [accordionExplicitlyClosed, isAnyTimeSlotHovered, totalResponseCount]);

  const saveUserAvailabilityButton = (
    <Button
      className="h-[2rem] whitespace-nowrap rounded-[.5rem] sm:h-[2.3rem] md:h-[2.6rem] md:px-6 md:text-[1.05rem]"
      form="availability-grid"
      type="submit"
      variant="default"
    >
      {SAVE_AVAILABILITY_BUTTON_TEXT}
    </Button>
  );

  const editUserAvailabilityButton = (
    <EditAvailabilityDialog className="h-[2rem] whitespace-nowrap rounded-[.5rem] sm:h-[2.3rem] md:h-[2.6rem] md:px-6 md:text-[1.05rem]" />
  );

  let spacingHeightStyle = "";

  if (accordionOpen && isViewMode(mode)) {
    if (screenSize <= ScreenSize.XS) spacingHeightStyle = "calc(8.4rem + 14vh)";
    if (screenSize === ScreenSize.SM) spacingHeightStyle = "calc(9.6rem + 14vh)";
    if (screenSize >= ScreenSize.MD) spacingHeightStyle = "calc(10.6rem + 18vh)";
  } else {
    if (screenSize <= ScreenSize.XS) spacingHeightStyle = "8rem";
    if (screenSize === ScreenSize.SM) spacingHeightStyle = "9rem";
    if (screenSize >= ScreenSize.MD) spacingHeightStyle = "10rem";
  }

  return (
    <>
      <div style={{ height: spacingHeightStyle }}></div>
      <div
        className={cn(
          "fixed bottom-0 w-full rounded-t-3xl bg-background pb-5 shadow-[0px_-1px_6px_1px] shadow-gray-100",
          isEditMode(mode) && "rounded-t-none pt-2"
        )}
      >
        <div className="flex w-full flex-col">
          {isViewMode(mode) && (
            <>
              <ResponsesAccordion
                accordionOpen={accordionOpen}
                eventParticipants={eventParticipants}
                setAccordionExplicitlyClosed={setAccordionExplicitlyClosed}
                setAccordionOpen={setAccordionOpen}
                totalResponseCount={totalResponseCount}
              />
              <div className="h-1 border-b-[1px] border-accent pt-1" />
            </>
          )}
          <div className="z-10 mx-auto grid w-full max-w-[56rem] grid-flow-col justify-between px-6 pt-4">
            <Button
              className="h-[2rem] rounded-[.5rem] border-2 text-sm sm:h-[2.3rem] md:h-[2.6rem] md:px-6 md:text-[1.05rem]"
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
            >
              {COPY_LINK} <Copy className="ml-2 h-4 w-4 md:ml-3 md:h-5 md:w-5" />
            </Button>
            <div className="text-sm">{isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function ResponsesAccordion({
  accordionOpen,
  eventParticipants,
  setAccordionExplicitlyClosed,
  setAccordionOpen,
  totalResponseCount
}) {
  return (
    <>
      <header
        className={cn(
          "flex h-[3rem] w-full items-center justify-between rounded-t-2xl border-[1px] border-b-0 border-accent bg-background px-5 pt-1 text-center font-medium sm:h-[3.5rem] sm:pt-0 md:h-[3.6rem] md:px-7",
          totalResponseCount !== 0 && "cursor-pointer"
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
          <AvailabilityResponsesCount className="md:text-[1.1rem" />
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
          <motion.section
            animate="accordionOpen"
            className="flex h-full max-h-[14vh] w-full justify-center border-t-[1px] border-accent bg-background sm:border-t-2 md:max-h-[18vh]"
            exit="collapsed"
            initial="collapsed"
            key="content"
            transition={{ ease: "easeInOut" }}
            variants={{
              accordionOpen: { height: "auto", opacity: 1 },
              collapsed: { height: 0, opacity: 0 }
            }}
          >
            <ScrollArea className="mr-2 w-full md:mr-4">
              <div className="mx-auto my-1 max-w-[48rem] flex-1 px-5 text-secondary sm:grid sm:grid-cols-4 sm:px-7 md:my-2 md:grid-cols-5">
                {eventParticipants.map((name, i) => (
                  <AvailbilityGridResponseFilterButton
                    className="my-1.5 mx-1 p-[3px] text-[0.74rem] font-medium md:text-[0.84rem]"
                    key={`${name}-${i}-filter-button-bottom-panel`}
                    name={name}
                  />
                ))}
              </div>
            </ScrollArea>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
