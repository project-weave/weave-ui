"use-client";

import { AnimationScope } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import useAvailabilityGridStore from "@/store/availabilityGridStore";

import EditAvailabilityForm from "./edit-availability-form";

const LOGIN_WITH_GOOGLE = "Google Calendar (coming soon)";
const EDIT_AVAILABILITY = "Edit Availability";

type EditAvailabilityDialogProps = {
  className?: string;
  editAvailabilityButtonAnimationScope?: AnimationScope;
  trigger?: React.ReactNode;
};

type ViewMode = "add-new" | "edit-existing" | "initial";

const EditAvailabilityDialog = ({
  className,
  editAvailabilityButtonAnimationScope,
  trigger
}: EditAvailabilityDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("initial");
  const allUserNames = useAvailabilityGridStore((state) => state.eventData.allParticipants);

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setViewMode("initial");
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className={className} ref={editAvailabilityButtonAnimationScope} variant="default">
            {EDIT_AVAILABILITY}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="pb-6">
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
          <div className="mb-1 px-1 text-center text-lg ">Edit your availability</div>
        </DialogHeader>

        {viewMode === "initial" && (
          <>
            <Button className="py-6">
              <Image
                alt="google-logo"
                className="mr-2 h-5 w-5"
                height={40}
                key="google-logo"
                src="/google.png"
                width={40}
              />
              <span className="text-base">{LOGIN_WITH_GOOGLE}</span>
            </Button>
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

        {viewMode === "add-new" && <EditAvailabilityForm isDialogOpen={isOpen} mode="add-new" />}
        {viewMode === "edit-existing" && <EditAvailabilityForm isDialogOpen={isOpen} mode="edit-existing" />}
      </DialogContent>
    </Dialog>
  );
};

export default memo(EditAvailabilityDialog);
