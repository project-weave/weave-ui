"use-client";

import { AnimationScope } from "framer-motion";
import Image from "next/image";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import EditAvailabilityForm from "./edit-availability-form";

const LOGIN_WITH_GOOGLE = "Login with Google";
const EDIT_AVAILABILITY = "Edit Availability";

type EditAvailabilityDialogProps = {
  className?: string;
  editAvailabilityButtonAnimationScope?: AnimationScope;
};

const EditAvailabilityDialog = ({ className, editAvailabilityButtonAnimationScope }: EditAvailabilityDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className} ref={editAvailabilityButtonAnimationScope} variant="default">
          {EDIT_AVAILABILITY}
        </Button>
      </DialogTrigger>

      <DialogContent className="px-8">
        <DialogHeader>
          <DialogTitle className="mb-1 px-1 text-secondary">Edit Availability</DialogTitle>
        </DialogHeader>
        <Button className="mx-8 mt-2" variant="outline">
          <p className="mr-2 text-sm">{LOGIN_WITH_GOOGLE}</p>
          <Image alt="google-logo" className="h-4 w-4" height={40} key="google-logo" src="/google.png" width={40} />
        </Button>
        <EditAvailabilityForm isDialogOpen={isOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default memo(EditAvailabilityDialog);
