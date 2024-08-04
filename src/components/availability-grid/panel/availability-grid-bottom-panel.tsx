import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import useEventResponsesFilters from "@/hooks/useEventResponsesFilters";
import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, X } from "lucide-react";
import { useState } from "react";

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

  const [open, setOpen] = useState(false);

  const MotionButton = motion(Button);

  const saveUserAvailabilityButton = (
    <MotionButton
      className="h-[2.2rem] whitespace-nowrap rounded-[.5rem]"
      onClick={() => handleSaveUserAvailability(user)}
      variant="default"
      whileTap={{ scale: 0.94 }}
    >
      {SAVE_AVAILABILITY_BUTTON_TEXT}
    </MotionButton>
  );

  const editUserAvailabilityButton = (
    <EditAvailabilityDialog
      allParticipants={allParticipants}
      className="h-[2.2rem] whitespace-nowrap rounded-[.5rem]"
    />
  );

  return (
    <>
      <div className="3rem"></div>
      <div
        className={cn(
          "fixed bottom-0 w-full rounded-t-2xl bg-background pb-4 shadow-[0px_1px_1px_2px] shadow-gray-100",
          isEditMode(mode) && "rounded-t-none pt-2 shadow-[0px_2px_2px_4px] "
        )}
      >
        <div className="flex w-full flex-col">
          {isViewMode(mode) && <ResponsesAccordion open={open} setOpen={setOpen} />}
          <div className="z-10 mx-auto grid w-full max-w-[45rem] grid-flow-col justify-between px-4 pt-3">
            <MotionButton
              className="h-[2.2rem] rounded-[.5rem] border-2 text-sm"
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

function ResponsesAccordion({ open, setOpen }) {
  const {
    allParticipantsWithCurrentUser,
    currentResponseCount,
    currentResponses,
    onFliterClicked,
    totalResponseCount
  } = useEventResponsesFilters();
  return (
    <>
      <header
        className="flex h-[3.3rem] w-full items-center justify-between rounded-t-2xl bg-accent/80 px-6 pt-0.5 text-center font-medium"
        onClick={() => setOpen((state) => !state)}
      >
        <span className="flex">
          <p className="text-secondary">{RESPONSES_TITLE}</p>
          <p className="ml-2 text-secondary">
            {currentResponseCount}/{totalResponseCount}
          </p>
        </span>
        {totalResponseCount !== 0 && (
          <motion.div animate={{ rotate: open ? "0" : "-45deg" }} initial={false} transition={{ ease: "easeInOut" }}>
            <X className="h-4 w-4 text-secondary" />
          </motion.div>
        )}
      </header>

      <AnimatePresence initial={false}>
        {open && totalResponseCount !== 0 && (
          <motion.section
            animate="open"
            className="flex max-h-[15vh] w-full justify-center overflow-y-scroll bg-accent/20 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary-light"
            exit="collapsed"
            initial="collapsed"
            key="content"
            transition={{ ease: "easeInOut" }}
            variants={{
              collapsed: { height: 0, opacity: 0 },
              open: { height: "auto", opacity: 1 }
            }}
          >
            <div className="mx-8 my-2 max-w-[40rem] flex-1 px-1 text-secondary xs:mx-11 md:my-4">
              {allParticipantsWithCurrentUser.map((name) => (
                <AvailbilityGridResponseFilterButton
                  className="m-1 p-[3px] text-[0.74rem]"
                  currentResponses={currentResponses}
                  key={`${name}-filter-button-bottom-panel`}
                  name={name}
                  onFilterClicked={onFliterClicked}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <hr className="hidden h-0.5 bg-accent md:block" />
    </>
  );
}
