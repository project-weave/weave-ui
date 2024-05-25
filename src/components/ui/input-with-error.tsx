import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

export interface InputWithErrorProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  errorText?: string;
  labelClassName?: string;
}

export default function InputWithLabel({
  className,
  containerClassName,
  errorText,
  labelClassName,
  type,
  ...props
}: InputWithErrorProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <input
        className={cn(
          "placeholder:text-muted-foreground peer flex w-full rounded-xl border border-primary bg-background px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
          {
            "border-red-500": !!errorText
          }
        )}
        type={type}
        {...props}
      />
      <Label
        className={cn("absolute -bottom-5 left-2 text-2xs text-red-600", labelClassName, {
          hidden: !errorText || errorText.length === 0
        })}
      >
        {errorText}
      </Label>
    </div>
  );
}
