import { forwardRef } from "react";

import { cn } from "@/utils/cn";

import { Input } from "./input";
import { Label } from "./label";

export interface InputWithLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  id: string;
  label: string;
}

const InputWithLabel = forwardRef<HTMLDivElement, InputWithLabelProps>(({ error, id, label, type, ...props }, ref) => {
  return (
    <div className="relative w-full scroll-m-24" ref={ref}>
      <Input
        className={cn(
          "peer flex h-11 w-full appearance-none border-2 border-primary border-opacity-40 bg-background px-4 pb-2.5 pt-3 hover:border-opacity-100 focus:border-[3px] focus:border-opacity-100 focus:outline-none",
          error && "border-red-500"
        )}
        id={id}
        type={type}
        {...props}
        placeholder=" "
      />
      <Label
        className="absolute left-1 top-1 z-10 origin-[0] -translate-y-3.5 scale-75 transform rounded-sm bg-background px-3 text-[.9rem] duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[.9rem] peer-focus:top-1 peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:px-2"
        htmlFor={id}
      >
        {label}
      </Label>
    </div>
  );
});

export default InputWithLabel;
