import * as React from "react";

import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, type, ...props }, ref) => {
  return (
    <input
      className={cn(
        "placeholder:text-muted-foreground peer flex w-full rounded-2xl border border-primary bg-background px-3 py-2  file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500",
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
