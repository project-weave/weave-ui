import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn";
import { Check } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { Label } from "./label";

export interface DropdownWithLabelProps {
  emptyOptionText?: string;
  error: boolean;
  filterFunc: (value: string, search: string) => 0 | 1;
  label: string;
  options: string[];
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}
export default function DropdownWithLabel({
  emptyOptionText,
  error,
  filterFunc,
  label,
  options,
  selected,
  setSelected
}: DropdownWithLabelProps) {
  const [open, setOpen] = useState(false);
  const commandGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // neeed setTimeout here to allow for the DOM to render CommandGroup
    setTimeout(() => {
      if (commandGroupRef.current && open) {
        const selectedItem = commandGroupRef.current.querySelector(`[data-value="${selected}"]`);
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: "center", inline: "start" });
        }
      }
    });
  }, [open]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <div
            className={cn(
              "peer box-border flex h-10 w-32 items-center rounded-2xl bg-background px-4 pb-2.5 pt-3 text-sm outline outline-2 outline-primary/40 focus-within:outline-primary hover:outline-primary",
              {
                "outline-primary": open,
                "outline-red-600/40 focus-within:outline-red-600 hover:outline-red-600": error
              }
            )}
          >
            {selected}
          </div>
          <Label
            className={cn(
              "absolute left-1 top-1.5 z-10 origin-[0] -translate-y-4 scale-75 transform rounded-sm bg-background px-3 text-sm text-black duration-300 peer-focus-within:px-2 ",
              {
                "border-primary px-2": open
              }
            )}
          >
            {label}
          </Label>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[116px] border-2 border-primary p-0 2xl:w-[134px]">
        <Command className="bg-background" filter={(value, search) => filterFunc(value, search)}>
          <CommandInput className="h-8 border-primary text-2xs 2xl:h-9 2xl:text-sm" />
          {emptyOptionText !== undefined && emptyOptionText !== "" && (
            <CommandEmpty className="m-1 rounded-sm bg-red-100 py-1.5 text-center text-2xs 2xl:text-sm">
              {emptyOptionText}
            </CommandEmpty>
          )}
          <CommandGroup
            className="my-1 max-h-[150px] overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary 2xl:max-h-[240px]"
            ref={commandGroupRef}
          >
            {options.map((option) => (
              <CommandItem
                className={cn("text-2xs 2xl:text-sm", {
                  "mb-1 border-[1px] border-primary 2xl:border-2": selected === option
                })}
                data-value={option}
                key={option}
                onSelect={(val) => {
                  setSelected(val);
                  setOpen(false);
                }}
                value={option}
              >
                {option}
                <Check
                  className={cn(
                    "ml-4 h-3 w-3 2xl:ml-3 2xl:h-4 2xl:w-4",
                    selected === option ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
