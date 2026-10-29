import { useEffect, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import ParticipantAvatar from "@/components/participant-avatar";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  mode,
  onComplete
}: {
  isDialogOpen: boolean;
  mode: "add-new" | "edit-existing";
  onComplete?: () => void;
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
      const timeout = setTimeout(() => {
        isSubmitAttempted.current = false;
        form.reset();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [form, isDialogOpen]);

  useEffect(() => {
    form.setValue("isEnterNewAvailability", mode === "add-new");
  }, [mode, form]);

  useEffect(() => {
    if (isEnterNewAvailability) {
      if (isSubmitAttempted.current) form.trigger("enteredUserName");
    } else {
      if (isSubmitAttempted.current) form.trigger("selectedUserName");
    }
  }, [form, isEnterNewAvailability]);

  const isSubmitAttempted = useRef(false);
  const allUserNames = useAvailabilityGridStore((state) => state.eventData.allParticipants);
  const setMode = useAvailabilityGridStore((state) => state.setMode);
  const setUserGridState = useAvailabilityGridStore((state) => state.setUserGridState);

  const nameInput = (
    <FormField
      control={form.control}
      name="enteredUserName"
      render={({ field, fieldState: { invalid } }) => (
        <FormItem className="space-y-2">
          <FormLabel className="mb-0 block">Your name</FormLabel>
          <FormControl>
            <Input
              {...field}
              className="h-11 text-sm placeholder:text-sm"
              error={invalid}
              placeholder={WHAT_IS_YOUR_NAME}
              type="text"
            />
          </FormControl>
          <FormMessage className="static m-0 whitespace-normal text-xs text-red" />
        </FormItem>
      )}
      rules={{
        validate: (value, formValues) => {
          if (formValues.isEnterNewAvailability) {
            if (value.trim().length === 0) return "Name must be at least 1 character long";
            if (allUserNames.some((name) => name.toLowerCase() === value.trim().toLowerCase()))
              return "This name is already taken.";
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
        <div className="space-y-2">
          <div className="scrollbar-primary grid max-h-48 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {allUserNames.map((userName, index) => (
              <button
                aria-pressed={field.value === userName}
                className={cn(
                  "inline-flex min-h-[2.5rem] w-full min-w-0 items-center gap-1.5 rounded-lg border border-transparent bg-input px-2 py-2 font-normal outline-none duration-100 focus-visible:ring-2 focus-visible:ring-ring",
                  {
                    "border-black font-medium": userName === field.value
                  }
                )}
                key={`edit-availability-button-${userName}`}
                onBlur={field.onBlur}
                onClick={() => {
                  field.onChange(userName);
                  form.trigger("selectedUserName");
                }}
                ref={index === 0 ? field.ref : undefined}
                title={userName}
                type="button"
              >
                <ParticipantAvatar className="h-5 w-5 text-[0.6rem]" name={userName} />
                <span className="truncate text-2xs">{userName}</span>
              </button>
            ))}
          </div>
          {form.formState.errors.selectedUserName && (
            <p className="text-xs font-medium text-red">{form.formState.errors.selectedUserName.message}</p>
          )}
        </div>
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
        className="space-y-6"
        id="edit-availability-dialog"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          isSubmitAttempted.current = true;
          form.handleSubmit((data) => {
            const userName = mode === "add-new" ? data.enteredUserName.trim() : data.selectedUserName;
            setUserGridState(userName);
            setMode(AvailabilityGridMode.EDIT);
            onComplete?.();
          })();
        }}
      >
        {mode === "add-new" ? nameInput : existingUserSelection}
        <Button className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90" type="submit">
          {CONTINUE}
        </Button>
      </form>
    </FormProvider>
  );
}
