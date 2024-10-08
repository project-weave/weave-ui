import { User } from "lucide-react";
import { useEffect, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useAvailabilityGridStore, { AvailabilityGridMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

type EditAvailabiltyFormType = {
  enteredUserName: string;
  isEnterNewAvailability: boolean;
  selectedUserName: string;
};

const CONTINUE_WITHOUT_LOGIN = "or continue without login";
const ENTER_NEW_AVAILABILITY = "Enter New Availability";
const EDIT_EXISTING_AVAILABILITY = "Edit Existing Availability";
const WHAT_IS_YOUR_NAME = "What is your name?";
const SELECT_EXISTING_USER = "Select An Existing User";
const CONTINUE = "Continue";
const ENTER_YOUR_NAME = "Enter Your Name";

export default function EditAvailabilityForm({ isDialogOpen }: { isDialogOpen: boolean }) {
  const form = useForm<EditAvailabiltyFormType>({
    defaultValues: {
      enteredUserName: "",
      isEnterNewAvailability: true,
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
          <FormMessage className="ml-3" />
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
          <div className="grid scrollbar-primary text-secondary grid-cols-3 gap-x-3 gap-y-1 overflow-y-scroll scroll-smooth mb-1">
            {allUserNames.map((userName) => (
              <button
                {...field}
                className={cn(
                  "my-[2px] inline-flex w-full flex-row items-center rounded-xl border-2 border-primary-light bg-background px-2 py-[5px] outline-none duration-100 hover:bg-accent-light",
                  {
                    "border-2 border-primary bg-accent font-semibold hover:bg-purple-200":
                      userName === form.watch("selectedUserName")
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
          <div className="ml-3 h-2 text-2xs font-medium text-red-600 whitespace-nowrap">
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

  const editAvailbilityModeRadio = (
    <RadioGroup
      className="mx-auto grid w-full cursor-pointer justify-center xs:grid-flow-col xs:space-x-6"
      defaultValue="new"
    >
      <div className="mb-3 flex items-center space-x-2 xs:mb-0">
        <RadioGroupItem
          className="border-secondary"
          id="r1"
          onClick={() => {
            form.setValue("isEnterNewAvailability", true);
          }}
          value="new"
        />
        <Label
          className={cn("cursor-pointer text-[0.85rem] text-secondary sm:text-sm", {
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
          onClick={() => {
            form.setValue("isEnterNewAvailability", false);
          }}
          value="existing"
        />
        <Label
          className={cn("cursor-pointer text-[0.85rem] text-secondary sm:text-sm", {
            "font-medium": !isEnterNewAvailability
          })}
          htmlFor="r2"
        >
          {EDIT_EXISTING_AVAILABILITY}
        </Label>
      </div>
    </RadioGroup>
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
            setUserGridState(data.isEnterNewAvailability ? data.enteredUserName : data.selectedUserName);
            setMode(AvailabilityGridMode.EDIT);
          })();
        }}
      >
        <div className="flex-column my-2 flex w-full items-center">
          <hr className="h-[2px] w-full bg-secondary" />
          <span className="mx-4 whitespace-nowrap text-xs text-secondary">{CONTINUE_WITHOUT_LOGIN}</span>
          <hr className="h-[2px] w-full bg-secondary" />
        </div>

        {allUserNames.length > 0 && <div className="mx-auto my-6 px-4 sm:my-8"> {editAvailbilityModeRadio}</div>}
        <div className="mb-10 mt-6">
          {isEnterNewAvailability ? (
            <>
              <Label className="mb-2 ml-2 text-sm font-semibold text-secondary">{ENTER_YOUR_NAME}</Label>
              <hr className="mx-auto mt-1 h-[1px] w-full bg-secondary" />
              <div className="mb-5 mt-4 flex flex-col w-[86%] mx-auto ">{nameInput}</div>
            </>
          ) : (
            <>
              <Label className="mb-2 ml-2 text-sm font-semibold text-secondary">{SELECT_EXISTING_USER}</Label>
              <hr className="mx-auto mt-1 h-[1px] w-full bg-secondary" />
              <div className="mt-3 w-full px-4">{existingUserSelection}</div>
            </>
          )}
        </div>
        <div
          className={cn("mt-14 flex flex-col", !isEnterNewAvailability && "mt-8", allUserNames.length === 0 && "mt-10")}
        >
          <Button
            className="w-full self-end text-sm md:w-[8rem] "
            disabled={isSubmitAttempted.current && !form.formState.isValid}
            form="edit-availability-dialog"
            type="submit"
          >
            {CONTINUE}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
