import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center outline-none rounded-md font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:border-0 disabled:text-text-light disabled:pointer-events-none disabled:bg-input",
  {
    defaultVariants: {
      size: "default",
      variant: "default"
    },
    variants: {
      size: {
        // based on the Figma "New Weave" button, 5px taller: 32px tall (8px above, below and beside the text),
        // 5px corners, 5px icon gap, 14px regular text.
        // Inputs, dropdowns and the sliding toggle use the same height and corners.
        // DM Sans text sits a little high in its line, so the content is nudged down 1px and icons up 1px
        // to put text and icon on the button's centre line
        default:
          "h-8 gap-[5px] rounded-[5px] px-2 py-0 pt-[2px] text-sm font-normal leading-[1.105] [&_svg]:-translate-y-[1.4px]",
        icon: "h-10 w-10",
        lg: "h-11 rounded-lg px-8",
        sm: "h-9 rounded-lg px-3"
      },
      variant: {
        dark: "bg-primary-dark text-primary-foreground hover:bg-primary-dark-hover",
        "dark-disabled": "text-primary-dark bg-primary-foreground",
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        "default-disabled": "text-black bg-input",
        "default-disabled-white": "text-black bg-white",
        failure: "bg-failure text-failure-foreground hover:bg-failure/90",
        ghost: "bg-input font-normal",
        link: "text-primary underline-offset-4 hover:underline",
        outline: "border border-primary border-2 text-secondary hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
