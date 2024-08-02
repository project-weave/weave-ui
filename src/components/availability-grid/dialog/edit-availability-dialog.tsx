import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InputWithError from "@/components/ui/input-with-error";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useAvailabilityGridStore, { AvailabilityGridMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { AnimationScope, motion } from "framer-motion";
import { User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const LOGIN_WITH_GOOGLE = "Login with Google";
const CONTINUE_WITHOUT_LOGIN = "or continue without login";
const ENTER_NEW_AVAILABILITY = "Enter New Availability";
const EDIT_EXISTING_AVAILABILITY = "Edit Existing Availability";
const WHAT_IS_YOUR_NAME = "What is your name?";
const SELECT_EXISTING_USER = "Select An Existing User";
const CONTINUE = "Continue";
const EDIT_AVAILABILITY = "Edit Availability";
const ENTER_YOUR_NAME = "Enter Your Name";

type EditAvailabilityDialogProps = {
  allParticipants: string[];
  className?: string;
  editAvailabilityButtonAnimationScope?: AnimationScope;
};

export default function EditAvailabilityDialog({
  allParticipants,
  className,
  editAvailabilityButtonAnimationScope
}: EditAvailabilityDialogProps) {
  const [isEnterNewAvailability, setIsEnterNewAvailability] = useState(true);
  const [enteredUserName, setEnteredUserName] = useState<null | string>(null);
  const [selectedUserName, setSelectedUserName] = useState<null | string>(null);
  const [validUserName, setValidUserName] = useState(false);
  const [nameAlreadyTaken, setNameAlreadyTaken] = useState(false);

  const setMode = useAvailabilityGridStore((state) => state.setMode);
  const setUSerGridState = useAvailabilityGridStore((state) => state.setUserGridState);

  useEffect(() => {
    if (isEnterNewAvailability) {
      if (enteredUserName === null || enteredUserName.trim().length === 0) {
        setValidUserName(false);
        return;
      }
      if (allParticipants.map((p) => p.toLowerCase()).includes(enteredUserName.trim().toLowerCase())) {
        setValidUserName(false);
        setNameAlreadyTaken(true);
        return;
      }
      setValidUserName(true);
      setNameAlreadyTaken(false);
    } else {
      if (selectedUserName !== null) {
        setValidUserName(true);
      } else {
        setValidUserName(false);
      }
    }
  }, [enteredUserName, selectedUserName, isEnterNewAvailability]);

  function onSubmit() {
    if (validUserName) {
      setUSerGridState(isEnterNewAvailability ? enteredUserName! : selectedUserName!);
      setMode(AvailabilityGridMode.EDIT);
    }
  }

  function resetState() {
    // delay reset until after dialog is closed
    setTimeout(() => {
      setIsEnterNewAvailability(true);
      setEnteredUserName(null);
      setSelectedUserName(null);
      setValidUserName(false);
      setNameAlreadyTaken(false);
    }, 20);
  }

  const MotionButton = motion(Button);

  return (
    <Dialog onOpenChange={resetState}>
      <DialogTrigger asChild>
        <MotionButton
          className={className}
          ref={editAvailabilityButtonAnimationScope}
          variant="default"
          whileTap={{ scale: 0.95 }}
        >
          {EDIT_AVAILABILITY}
        </MotionButton>
      </DialogTrigger>

      <DialogContent className="px-3 xs:px-8">
        <DialogHeader>
          <DialogTitle className="mb-1 px-1 text-secondary">Edit Availability</DialogTitle>
        </DialogHeader>
        <MotionButton className="mx-8 mt-2" disabled variant="outline" whileTap={{ scale: 0.95 }}>
          <p className="mr-2 text-sm">{LOGIN_WITH_GOOGLE}</p>
          <Image alt="google-logo" className="h-4 w-4" height={40} src="/google.png" width={40} />
        </MotionButton>
        <form onSubmit={onSubmit}>
          <div className="flex-column my-2 flex w-full items-center">
            <hr className="h-[2px] w-full bg-secondary" />
            <span className="mx-4 whitespace-nowrap text-xs text-secondary">{CONTINUE_WITHOUT_LOGIN}</span>
            <hr className="h-[2px] w-full bg-secondary" />
          </div>

          {allParticipants.length > 0 && (
            <div className="mx-auto my-8 px-0 xs:px-4">
              <RadioGroup
                className="mx-auto grid w-full cursor-pointer grid-flow-col justify-center space-x-2 xs:space-x-6"
                defaultValue="new"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    className="border-secondary"
                    id="r1"
                    onClick={() => setIsEnterNewAvailability(true)}
                    value="new"
                  />
                  <Label
                    className={cn("cursor-pointer text-xs text-secondary md:text-sm", {
                      "font-medium": isEnterNewAvailability
                    })}
                    htmlFor="r1"
                  >
                    {ENTER_NEW_AVAILABILITY}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    className="border-secondary"
                    id="r2"
                    onClick={() => setIsEnterNewAvailability(false)}
                    value="existing"
                  />
                  <Label
                    className={cn("cursor-pointer text-xs text-secondary md:text-sm", {
                      "font-medium": !isEnterNewAvailability
                    })}
                    htmlFor="r2"
                  >
                    {EDIT_EXISTING_AVAILABILITY}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
          <div className="mb-3 mt-4">
            <Label className="mb-2 ml-2 text-sm font-semibold text-secondary">
              {isEnterNewAvailability ? ENTER_YOUR_NAME : SELECT_EXISTING_USER}
            </Label>
            <hr className="mx-auto mt-1 h-[1.5px] w-full bg-secondary" />

            {isEnterNewAvailability ? (
              <div className="mb-5 mt-4 flex flex-col">
                <InputWithError
                  className="text-sm"
                  containerClassName="w-[86%] mx-auto"
                  errorText={nameAlreadyTaken ? "Name already taken" : undefined}
                  id="name"
                  onChange={(e) => setEnteredUserName(e.target.value)}
                  placeholder={WHAT_IS_YOUR_NAME}
                  value={enteredUserName ? enteredUserName : ""}
                />
              </div>
            ) : (
              <div className="mt-3 grid max-h-[7rem] w-full grid-cols-3 gap-x-3 gap-y-1 overflow-y-scroll scroll-smooth px-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full md:max-h-64">
                {allParticipants.map((paricipant) => (
                  <motion.button
                    className={cn(
                      "my-[2px] inline-flex w-full flex-row items-center rounded-xl border-2 border-primary-light bg-background px-2 py-[5px] outline-none duration-100 hover:bg-accent-light",
                      {
                        "border-2 border-primary bg-accent font-semibold hover:bg-purple-200":
                          paricipant === selectedUserName
                      }
                    )}
                    key={`edit-availability-button-${paricipant}`}
                    onClick={() => setSelectedUserName(paricipant)}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                  >
                    <User className="h-4 w-4" />
                    <span className="mx-1 max-w-[6rem] overflow-hidden text-ellipsis whitespace-nowrap text-2xs">
                      {paricipant}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-20 flex flex-col xs:mt-14">
            <MotionButton
              className="w-full self-end text-sm md:w-[8rem] "
              disabled={!validUserName}
              type="submit"
              whileTap={{ scale: 0.95 }}
            >
              {CONTINUE}
            </MotionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
