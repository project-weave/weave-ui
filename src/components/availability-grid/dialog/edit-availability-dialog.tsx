"use client";

import { AnimationScope } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { memo, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import useAvailabilityGridStore from "@/store/availabilityGridStore";

import EditAvailabilityForm from "./edit-availability-form";

const EDIT_AVAILABILITY = "Edit Availability";

type EditAvailabilityDialogProps = {
  allowModeSelection?: boolean;
  className?: string;
  editAvailabilityButtonAnimationScope?: AnimationScope;
  initialViewMode?: ViewMode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title?: string;
  trigger?: React.ReactNode;
};

type ViewMode = "add-new" | "edit-existing" | "initial";

const EditAvailabilityDialog = ({
  allowModeSelection = true,
  className,
  editAvailabilityButtonAnimationScope,
  trigger,
  open,
  onOpenChange,
  title = "Edit your availability",
  initialViewMode = "initial"
}: EditAvailabilityDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const allUserNames = useAvailabilityGridStore((state) => state.eventData.allParticipants);

  useEffect(() => {
    if (isOpen) setViewMode(initialViewMode);
  }, [initialViewMode, isOpen]);

  function changeOpen(next: boolean) {
    setInternalOpen(next);
    onOpenChange?.(next);
    if (!next) setViewMode(initialViewMode);
  }

  return (
    <Dialog onOpenChange={changeOpen} open={isOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger || (
            <Button className={className} ref={editAvailabilityButtonAnimationScope} variant="default">
              {EDIT_AVAILABILITY}
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent
        className="top-1/2 max-h-[calc(100dvh-2rem)] max-w-[min(32rem,calc(100vw-1.5rem))] gap-6 overflow-y-auto p-6"
        showCloseButton={false}
      >
        <div className="grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2">
          {allowModeSelection && viewMode !== "initial" ? (
            <Button
              aria-label="Back"
              className="h-8 w-8 bg-transparent p-0 hover:bg-accent"
              onClick={() => setViewMode("initial")}
              type="button"
              variant="ghost"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
          <DialogHeader className="space-y-0">
            <DialogTitle className="text-center text-lg font-medium leading-snug">{title}</DialogTitle>
            <DialogDescription className="sr-only">
              {allowModeSelection
                ? "Choose a participant or enter your name to add availability."
                : "Enter your name to add your availability."}
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button
              aria-label="Close"
              className="h-8 w-8 bg-transparent p-0 hover:bg-accent"
              type="button"
              variant="ghost"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </div>

        {viewMode === "initial" && (
          <div className="space-y-3">
            <Button
              className="h-12 w-full text-base hover:bg-light-gray"
              onClick={() => setViewMode("add-new")}
              type="button"
              variant="ghost"
            >
              Use a new name
            </Button>
            {allUserNames.length > 0 && (
              <Button
                className="h-12 w-full text-base hover:bg-light-gray"
                onClick={() => setViewMode("edit-existing")}
                type="button"
                variant="ghost"
              >
                Choose an existing participant
              </Button>
            )}
          </div>
        )}

        {viewMode === "add-new" && (
          <EditAvailabilityForm isDialogOpen={isOpen} mode="add-new" onComplete={() => changeOpen(false)} />
        )}
        {viewMode === "edit-existing" && (
          <EditAvailabilityForm isDialogOpen={isOpen} mode="edit-existing" onComplete={() => changeOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(EditAvailabilityDialog);
