import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type NavArrowButtonProps = {
  direction: "next" | "previous";
  label: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type">;

/**
 * The square previous/next arrow used everywhere dates are paged (calendar grid, create page calendar,
 * mini calendar): purple when it can be used, light grey when there's nothing further that way.
 */
export default function NavArrowButton({ className, direction, label, ...props }: NavArrowButtonProps) {
  const Icon = direction === "next" ? ChevronRight : ChevronLeft;
  return (
    <Button
      aria-label={label}
      className={cn("h-8 w-8 shrink-0 rounded-md p-0 transition-transform active:scale-95", className)}
      title={label}
      type="button"
      {...props}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </Button>
  );
}
