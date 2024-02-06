import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InputWithError from "@/components/ui/input-with-error";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import useAvailabilityGridStore, { AvailabilityGridMode } from "@/store/availabilityGridStore";
import { Label } from "@radix-ui/react-label";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const LOGIN_WITH_GOOGLE = "Login with Google";
const CONTINUE_WITHOUT_LOGIN = "or continue without login";
const ENTER_NEW_AVAILABILITY = "Enter New Availability";
const EDIT_EXISTING_AVAILABILITY = "Edit Existing Availability";
const WHAT_IS_YOUR_NAME = "What is your name?";
const SELECT_EXISTING_USER = "Select An Existing User";
const CONTINUE = "Continue";

export default function EditAvailabilityDialog() {
  const [isEnterNewAvailability, setIsEnterNewAvailability] = useState(true);
  const [enteredUserName, setEnteredUserName] = useState<null | string>(null);
  const [selectedUserName, setSelectedUserName] = useState<null | string>(null);
  const [validUserName, setValidUserName] = useState(false);
  const [nameAlreadyTaken, setNameAlreadyTaken] = useState(false);

  const users = useAvailabilityGridStore((state) => Object.keys(state.eventUserAvailability));
  const setUser = useAvailabilityGridStore((state) => state.setUser);
  const setMode = useAvailabilityGridStore((state) => state.setMode);

  useEffect(() => {
    if (isEnterNewAvailability) {
      if (enteredUserName === null || enteredUserName.trim().length === 0) {
        setValidUserName(false);
        return;
      }
      if (users.map((u) => u.toLowerCase()).includes(enteredUserName.trim().toLowerCase())) {
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
      setUser(isEnterNewAvailability ? enteredUserName! : selectedUserName!);
      setMode(AvailabilityGridMode.EDIT);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Availability</DialogTitle>
      </DialogHeader>
      <Button className="mx-8 mt-2" variant="outline">
        <p className="mr-2 text-xs">{LOGIN_WITH_GOOGLE}</p>
        <Image alt="google-logo" className="h-4 w-4" height={40} src="/google.png" width={40} />
      </Button>

      <div className="flex-column my-2 flex w-full items-center text-xs">
        <hr className="h-[2px] w-full bg-secondary" />
        <span className="mx-4 whitespace-nowrap text-xs text-secondary">{CONTINUE_WITHOUT_LOGIN}</span>
        <hr className="h-[2px] w-full bg-secondary" />
      </div>
      {users.length > 0 && (
        <div className="mx-auto my-1">
          <RadioGroup className="flex w-full space-x-6" defaultValue="new">
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                className="border-secondary"
                id="r1"
                onClick={() => setIsEnterNewAvailability(true)}
                value="new"
              />
              <Label
                className={cn("text-xs text-secondary", {
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
                className={cn("text-xs text-secondary", {
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
      {isEnterNewAvailability ? (
        <div className="mb-5 mt-4 flex flex-col">
          <InputWithError
            className="mx-auto w-[86%] py-[11px] text-xs"
            errorText={nameAlreadyTaken ? "Name already taken" : undefined}
            id="name"
            onChange={(e) => setEnteredUserName(e.target.value)}
            placeholder={WHAT_IS_YOUR_NAME}
            value={enteredUserName ? enteredUserName : ""}
          />
        </div>
      ) : (
        <div className="mb-6">
          <Label className="text-top mb-2 ml-4 text-xs font-medium text-secondary">{SELECT_EXISTING_USER}</Label>
          <hr className="mx-auto mt-1 h-[1px] w-[95%] bg-secondary" />
          <div className="mx-3 mt-3 max-h-64 overflow-y-scroll scroll-smooth px-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full">
            {users.map((user) => (
              <motion.button
                className={cn(
                  "mx-[5px] my-[2px] inline-flex w-[8rem] flex-row items-center rounded-xl border-2 border-primary-light bg-background px-2 py-[5px] outline-none duration-100 hover:bg-accent-light",
                  {
                    "border-2 border-primary bg-accent font-semibold hover:bg-purple-200": user === selectedUserName
                  }
                )}
                key={`edit-availability-button-${user}`}
                onClick={() => setSelectedUserName(user)}
                whileTap={{ scale: 0.92 }}
              >
                <User className="h-4 w-4" />
                <span className="mx-1 max-w-[6rem] overflow-hidden text-ellipsis whitespace-nowrap text-2xs">
                  {user}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button className="min-w-[6rem] text-xs" disabled={!validUserName} onClick={onSubmit} type="submit">
            {CONTINUE}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
