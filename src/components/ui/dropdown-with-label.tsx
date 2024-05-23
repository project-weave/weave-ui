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
              "peer box-border flex h-10 items-center rounded-2xl bg-background px-4 pb-2.5 pt-3 text-sm outline outline-2 outline-primary/40 focus-within:outline-primary hover:outline-primary sm:text-sm",
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
              "absolute left-1 top-1 z-10 origin-[0] -translate-y-4 scale-75 transform rounded-sm bg-background px-3 text-[.9rem] duration-300 sm:top-1 ",
              {
                "border-primary px-2": open
              }
            )}
          >
            {label}
          </Label>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[130px] border-2 border-primary p-0 sm:w-[150px]">
        <Command className="bg-background" filter={(value, search) => filterFunc(value, search)}>
          <CommandInput className="border-primary py-5 text-xs" />
          {emptyOptionText !== undefined && emptyOptionText !== "" && (
            <CommandEmpty className="m-2 rounded-sm bg-gray-200 py-1.5 text-center text-2xs">
              {emptyOptionText}
            </CommandEmpty>
          )}
          <CommandGroup
            className="my-1 max-h-[150px] overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary xl:max-h-[210px]"
            ref={commandGroupRef}
          >
            {options.map((option) => (
              <CommandItem
                className={cn("my-[1px] mr-2 flex items-center justify-between text-xs hover:bg-primary/20 ", {
                  "mb-1 border-[1px] border-primary md:border-[1.5px]": selected === option
                })}
                data-value={option}
                key={option}
                onSelect={(val) => {
                  setSelected(val);
                  setOpen(false);
                }}
                value={option}
              >
                <span>{option}</span>
                <Check className={cn("h-5 w-5 ", selected === option ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
