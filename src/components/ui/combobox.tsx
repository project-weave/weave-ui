"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { KeyboardEvent, ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";

import useScrollingClass from "@/hooks/useScrollingClass";
import { cn } from "@/utils/cn";

export type ComboboxOption = {
  // optional section heading shown above this option when nothing has been typed
  group?: string;
  // unique key (the same value can appear in two groups, e.g. "Recent" and "All")
  key: string;
  value: string;
};

type ComboboxProps<T extends ComboboxOption> = {
  ariaLabel: string;
  className?: string;
  // what the field shows for the chosen value when you're not typing
  displayValue: (value: string) => string;
  emptyMessage: string;
  error?: boolean;
  // options to list for what's been typed, best match first. An empty query lists everything.
  getOptions: (query: string) => T[];
  onBlur?: () => void;
  onChange: (value: string) => void;
  // turn whatever was typed into a value when you press Enter or leave the field without picking one
  parseTyped?: (text: string) => null | string;
  placeholder?: string;
  renderOption: (option: T, state: { isHighlighted: boolean; isSelected: boolean }) => ReactNode;
  // a chevron on the right that flips while the list is open
  showChevron?: boolean;
  value: string;
};

/**
 * A text field you can type straight into. Clicking it opens a list right below it (left-aligned and no
 * wider than the field); typing filters the list; arrow keys and Enter pick from it.
 */
export default function Combobox<T extends ComboboxOption>({
  ariaLabel,
  className,
  displayValue,
  emptyMessage,
  error,
  getOptions,
  onBlur,
  onChange,
  parseTyped,
  placeholder,
  renderOption,
  showChevron,
  value
}: ComboboxProps<T>) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // null while not typing: the field shows the chosen value
  const [query, setQuery] = useState<null | string>(null);
  const [highlighted, setHighlighted] = useState(0);

  const options = useMemo(() => getOptions(query ?? ""), [getOptions, query]);

  useScrollingClass(listRef, undefined, open);

  // opening: highlight and show the chosen value; typing: highlight the best match
  useEffect(() => {
    if (!open) return;
    const index = query === null ? options.findIndex((option) => option.value === value) : 0;
    setHighlighted(Math.max(0, index));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);

  // keep the highlighted option in view (on opening, the list appears a frame later: centre the chosen one)
  const justOpenedRef = useRef(false);
  useEffect(() => {
    if (open) justOpenedRef.current = true;
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const item = listRef.current?.querySelector<HTMLElement>(`[data-index="${highlighted}"]`);
      item?.scrollIntoView({ block: justOpenedRef.current ? "center" : "nearest" });
      if (item) justOpenedRef.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [highlighted, open, options]);

  function close() {
    setOpen(false);
    setQuery(null);
  }

  function choose(nextValue: string) {
    onChange(nextValue);
    close();
  }

  // leaving the field (or Enter) with text typed: use what was typed if it makes sense, otherwise the best match
  function commitTyped() {
    if (query === null || query.trim() === "") return close();
    const parsed = parseTyped?.(query);
    if (parsed) return choose(parsed);
    if (options[highlighted]) return choose(options[highlighted].value);
    close();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setHighlighted((index) => Math.min(Math.max(index + step, 0), options.length - 1));
    } else if (e.key === "Enter") {
      if (!open) return;
      e.preventDefault();
      if (query !== null && query.trim() !== "" && parseTyped?.(query)) return commitTyped();
      if (options[highlighted]) choose(options[highlighted].value);
    } else if (e.key === "Escape") {
      if (!open) return;
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      if (open) commitTyped();
    }
  }

  let lastGroup: string | undefined;

  return (
    <PopoverPrimitive.Root
      onOpenChange={(next) => {
        if (!next) commitTyped();
      }}
      open={open}
    >
      <PopoverPrimitive.Anchor asChild>
        <div className="relative w-full">
          <input
            aria-activedescendant={open && options[highlighted] ? `${listId}-${highlighted}` : undefined}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={open}
            aria-invalid={error || undefined}
            aria-label={ariaLabel}
            autoComplete="off"
            className={cn(
              "h-8 w-full min-w-0 rounded-[5px] bg-field px-2 text-base text-black outline-none placeholder:text-text-light sm:text-sm",
              error && "ring-2 ring-red/60",
              showChevron && "pr-7",
              className
            )}
            onBlur={() => onBlur?.()}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onClick={() => setOpen(true)}
            onFocus={(e) => {
              e.target.select();
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            ref={inputRef}
            role="combobox"
            spellCheck={false}
            value={query ?? displayValue(value)}
          />
          {showChevron && (
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute right-2 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-black transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          )}
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border bg-white p-1 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onInteractOutside={(e) => {
            // clicking back into the field keeps the list open
            if (e.target === inputRef.current) e.preventDefault();
          }}
          // keep typing in the field: don't move focus into the list
          onOpenAutoFocus={(e) => e.preventDefault()}
          sideOffset={4}
        >
          <div
            className="grid-scrollbar max-h-[min(15rem,45dvh)] overflow-y-auto"
            id={listId}
            ref={listRef}
            role="listbox"
          >
            {options.length === 0 && (
              <p className="m-1 rounded-sm bg-field py-1.5 text-center text-xs text-text-light">{emptyMessage}</p>
            )}
            {options.map((option, index) => {
              const heading = query === null && option.group !== lastGroup ? option.group : undefined;
              lastGroup = option.group;
              const isHighlighted = index === highlighted;
              const isSelected = option.value === value;
              return (
                <div key={option.key}>
                  {heading && (
                    <p
                      className={cn(
                        "px-2 pb-1 pt-1.5 text-xs text-text-light",
                        index > 0 && "mt-1 border-t border-light-gray pt-2"
                      )}
                    >
                      {heading}
                    </p>
                  )}
                  <div
                    aria-selected={isSelected}
                    className={cn(
                      "mr-1 flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm",
                      isSelected ? "bg-primary text-white" : isHighlighted && "bg-light-gray/60"
                    )}
                    data-index={index}
                    id={`${listId}-${index}`}
                    // pick on mouse down so the field doesn't lose focus first
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(option.value);
                    }}
                    onMouseMove={() => setHighlighted(index)}
                    role="option"
                  >
                    {renderOption(option, { isHighlighted, isSelected })}
                  </div>
                </div>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
