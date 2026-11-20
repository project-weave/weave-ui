"use client";

import { AnimationScope } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { memo, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  MODAL_SIZE
} from "@/components/ui/dialog";
import useAvailabilityGridStore from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

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

      {/* same layout and size as the "Save your availability?" modal */}
      <DialogContent
        className={cn(MODAL_SIZE, "max-h-[calc(100dvh-2rem)] overflow-y-auto")}
        // don't put a focus outline back on the button that opened it (e.g. the Edit toggle) when it closes
        onCloseAutoFocus={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            {allowModeSelection && viewMode !== "initial" && (
              <Button
                aria-label="Back"
                className="-ml-2 h-8 w-8 shrink-0 bg-transparent p-0 hover:bg-input"
                onClick={() => setViewMode("initial")}
                type="button"
                variant="ghost"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-text-light">
            {viewMode === "edit-existing"
              ? "Choose your name from the list."
              : viewMode === "initial"
                ? "Add a new name or pick yours from the list."
                : "Enter your name so others know whose times these are."}
          </DialogDescription>
        </DialogHeader>

        {viewMode === "initial" && (
          <div className="space-y-2">
            <Button
              className="h-10 w-full text-sm hover:bg-light-gray"
              onClick={() => setViewMode("add-new")}
              type="button"
              variant="ghost"
            >
              Use a new name
            </Button>
            {allUserNames.length > 0 && (
              <Button
                className="h-10 w-full text-sm hover:bg-light-gray"
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
