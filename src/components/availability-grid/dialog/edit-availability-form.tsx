import { User } from "lucide-react";
import { useEffect, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAvailabilityGridStore, { AvailabilityGridMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

type EditAvailabiltyFormType = {
  enteredUserName: string;
  isEnterNewAvailability: boolean;
  selectedUserName: string;
};

const WHAT_IS_YOUR_NAME = "What is your name?";
const CONTINUE = "Continue";

export default function EditAvailabilityForm({
  isDialogOpen,
  mode
}: {
  isDialogOpen: boolean;
  mode: "add-new" | "edit-existing";
}) {
  const form = useForm<EditAvailabiltyFormType>({
    defaultValues: {
      enteredUserName: "",
      isEnterNewAvailability: mode === "add-new",
      selectedUserName: ""
    },
    mode: "onSubmit",
    reValidateMode: "onChange"
  });

  const isEnterNewAvailability = form.watch("isEnterNewAvailability");

  useEffect(() => {
    if (!isDialogOpen) {
      setTimeout(() => {
        isSubmitAttempted.current = false;
        form.reset();
      }, 100);
    }
  }, [isDialogOpen]);

  useEffect(() => {
    form.setValue("isEnterNewAvailability", mode === "add-new");
  }, [mode, form]);

  useEffect(() => {
    if (isEnterNewAvailability) {
      if (isSubmitAttempted.current) form.trigger("enteredUserName");
    } else {
      if (isSubmitAttempted.current) form.trigger("selectedUserName");
    }
  }, [isEnterNewAvailability]);

  const isSubmitAttempted = useRef(false);
  const allUserNames = useAvailabilityGridStore((state) => state.eventData.allParticipants);
  const setMode = useAvailabilityGridStore((state) => state.setMode);
  const setUserGridState = useAvailabilityGridStore((state) => state.setUserGridState);

  const nameInput = (
    <FormField
      control={form.control}
      name="enteredUserName"
      render={({ field, fieldState: { invalid } }) => (
        <FormItem>
          <FormControl>
            <Input
              {...field}
              className="placeholder:text-sm"
              error={invalid}
              placeholder={WHAT_IS_YOUR_NAME}
              type="text"
            />
          </FormControl>
          <FormMessage className="ml-3 text-red" />
        </FormItem>
      )}
      rules={{
        validate: (value, formValues) => {
          if (formValues.isEnterNewAvailability) {
            if (value.trim().length === 0) return "Name must be at least 1 character long";
            if (allUserNames.includes(value.trim())) return "This name is already taken.";
          }
        }
      }}
    />
  );

  const existingUserSelection = (
    // using Controller rather than FormField beacause for some reason FormField causing a bug
    // where it updates the value of "enteredUserName"" as well
    <Controller
      control={form.control}
      name="selectedUserName"
      render={({ field }) => (
        <>
          <div className="scrollbar-primary mb-1 grid grid-cols-3 gap-x-3 gap-y-1 overflow-y-scroll scroll-smooth ">
            {allUserNames.map((userName) => (
              <button
                {...field}
                className={cn(
                  "my-[2px] inline-flex w-full flex-row items-center rounded-xl bg-input px-2 py-[5px] font-normal outline-none duration-100 ",
                  {
                    "border-[1px] border-black font-medium": userName === form.watch("selectedUserName")
                  }
                )}
                key={`edit-availability-button-${userName}`}
                onClick={() => {
                  field.onChange(userName);
                  form.trigger("selectedUserName");
                }}
                type="button"
              >
                <User className="h-4 w-4" />
                <span className="mx-1 max-w-[6rem] overflow-hidden text-ellipsis whitespace-nowrap text-2xs">
                  {userName}
                </span>
              </button>
            ))}
          </div>
          <div className="text-red-600 ml-3 h-2 whitespace-nowrap text-2xs font-medium">
            {form.formState.errors.selectedUserName?.message}
          </div>
        </>
      )}
      rules={{
        validate: (value, formValues) => {
          if (!formValues.isEnterNewAvailability && value === "") {
            return "You must select a user.";
          }
        }
      }}
    />
  );

  return (
    <FormProvider {...form}>
      <form
        id="edit-availability-dialog"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          isSubmitAttempted.current = true;
          form.handleSubmit((data) => {
            const userName = mode === "add-new" ? data.enteredUserName : data.selectedUserName;
            setUserGridState(userName);
            setMode(AvailabilityGridMode.EDIT);
          })();
        }}
      >
        {mode === "add-new" ? (
          <>
            <Label className="ml-2 text-2xs font-normal text-dark-gray">Your name</Label>
            {nameInput}
            <Button
              className="mt-6 w-full rounded-lg bg-primary py-6 text-base text-white hover:bg-primary/90"
              type="submit"
            >
              {CONTINUE}
            </Button>
          </>
        ) : (
          <>
            {existingUserSelection}
            <Button
              className="mt-6 w-full rounded-lg bg-primary py-6 text-base text-white hover:bg-primary/90"
              type="submit"
            >
              {CONTINUE}
            </Button>
          </>
        )}
      </form>
    </FormProvider>
  );
}
