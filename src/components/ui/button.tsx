import { cn } from "@/utils/cn";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center outline-none rounded-md  font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    defaultVariants: {
      size: "default",
      variant: "default"
    },
    variants: {
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        icon: "h-10 w-10",
        lg: "h-11 rounded-lg px-8",
        sm: "h-9 rounded-lg px-3"
      },
      variant: {
        dark: "bg-primary-dark text-primary-foreground hover:bg-primary-dark-hover",
        "dark-disabled": "text-primary-dark bg-primary-foreground",
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        "default-disabled": "text-primary bg-primary-foreground",
        failure: "bg-failure text-failure-foreground hover:bg-failure/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        outline: "border border-primary-light text-secondary hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
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
