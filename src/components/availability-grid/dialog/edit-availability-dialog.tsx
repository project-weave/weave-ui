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
  DialogTrigger
} from "@/components/ui/dialog";
import useAvailabilityGridStore from "@/store/availabilityGridStore";

import EditAvailabilityForm from "./edit-availability-form";

const EDIT_AVAILABILITY = "Edit Availability";

type EditAvailabilityDialogProps = {
  className?: string;
  editAvailabilityButtonAnimationScope?: AnimationScope;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialViewMode?: ViewMode;
};

type ViewMode = "add-new" | "edit-existing" | "initial";

const EditAvailabilityDialog = ({
  className,
  editAvailabilityButtonAnimationScope,
  trigger,
  open,
  onOpenChange,
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

      <DialogContent className="max-w-[min(32rem,calc(100vw-1.5rem))] pb-6">
        <DialogHeader className="mb-8">
          {viewMode !== "initial" && (
            <Button
              className="absolute left-4 top-4 h-8 w-8 bg-transparent p-0"
              onClick={() => setViewMode("initial")}
              variant="ghost"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <DialogTitle className="mb-1 px-1 text-center text-lg font-medium">Edit your availability</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a participant or enter your name to add availability.
          </DialogDescription>
        </DialogHeader>

        {viewMode === "initial" && (
          <>
            <Button
              className="w-full py-6 text-base hover:bg-light-gray"
              onClick={() => setViewMode("add-new")}
              variant="ghost"
            >
              Add new availability
            </Button>
            {allUserNames.length > 0 && (
              <Button
                className="w-full py-6 text-base hover:bg-light-gray"
                onClick={() => setViewMode("edit-existing")}
                variant="ghost"
              >
                Edit existing availability
              </Button>
            )}
          </>
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
