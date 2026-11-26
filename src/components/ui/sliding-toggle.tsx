"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";

export type SlidingToggleOption<T extends number | string> = {
  // background of the sliding pill while this option is selected
  activeColor: string;
  // text colour while selected (defaults to black)
  activeTextClassName?: string;
  icon?: ReactNode;
  label: string;
  value: T;
};

type SlidingToggleProps<T extends number | string> = {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  // label text hidden on very small screens (icons stay)
  hideLabelsOnXxs?: boolean;
  onChange: (value: T) => void;
  options: SlidingToggleOption<T>[];
  value: T;
};

/**
 * Two (or more) options in a grey track. The selected option is filled edge to edge by a pill that slides
 * over and changes colour when the selection changes.
 */
export default function SlidingToggle<T extends number | string>({
  ariaLabel,
  className,
  disabled,
  hideLabelsOnXxs,
  onChange,
  options,
  value
}: SlidingToggleProps<T>) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const reduceMotion = useReducedMotion();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  useLayoutEffect(() => {
    const selected = optionRefs.current[selectedIndex];
    if (!selected) return;
    const measure = () => setPill({ left: selected.offsetLeft, width: selected.offsetWidth });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(selected);
    return () => observer.disconnect();
  }, [selectedIndex, options.length]);

  return (
    <div
      aria-label={ariaLabel}
      className={cn("relative flex h-8 shrink-0 items-stretch overflow-hidden rounded-[5px] bg-input", className)}
      role="radiogroup"
    >
      <motion.span
        animate={{ backgroundColor: options[selectedIndex].activeColor, x: pill.left }}
        aria-hidden="true"
        className="absolute inset-y-0 left-0 rounded-[5px]"
        initial={false}
        style={{ width: pill.width }}
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
      />
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <button
            aria-checked={isSelected}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-[5px] whitespace-nowrap rounded-[5px] px-2 text-sm font-normal leading-[1.105] outline-none transition-[color,background-color,transform] duration-300 focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none",
              isSelected ? (option.activeTextClassName ?? "text-black") : "text-text-light hover:bg-black/5"
            )}
            disabled={disabled}
            key={String(option.value)}
            onClick={() => !isSelected && onChange(option.value)}
            ref={(element) => (optionRefs.current[index] = element)}
            role="radio"
            type="button"
          >
            {option.icon}
            <span className={cn(hideLabelsOnXxs && option.icon && "hidden xs:inline")}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
