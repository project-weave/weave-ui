import * as React from "react";

import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorText?: string;
}

// Inputs use 16px text on phones: iOS Safari zooms in on any focused field smaller than that, and the
// zoom stays after you leave the field (or the page)
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, type, ...props }, ref) => {
  return (
    <input
      className={cn(
        "peer flex w-full rounded-md bg-field px-4 py-2.5 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-light focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        className
      )}
      ref={ref}
      type={type}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
