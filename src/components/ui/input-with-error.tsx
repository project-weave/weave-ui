import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

export interface InputWithErrorProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errorText?: string;
}

export default function InputWithLabel({ className, errorText, type, ...props }: InputWithErrorProps) {
  return (
    <div className="relative">
      <input
        className={cn(
          "placeholder:text-muted-foreground peer flex w-full rounded-xl border border-primary bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
          {
            "border-red-500": !!errorText
          }
        )}
        type={type}
        {...props}
      />
      <Label
        className={cn("absolute -bottom-5 left-4 text-2xs text-red-600", {
          hidden: !errorText || errorText.length === 0
        })}
      >
        {errorText}
      </Label>
    </div>
  );
}
