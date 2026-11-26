"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/utils/cn";

const ToastProvider = ToastPrimitives.Provider;

// Toasts sit just above the floating control bar (1rem/1.5rem from the bottom, 54px tall) and slide up from
// under it. Layering: above the calendar and its editing ring (z-40), below the control bar (z-[48]) and modals.
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    className={cn(
      "pointer-events-none fixed bottom-[calc(1rem+54px+0.5rem+env(safe-area-inset-bottom))] left-1/2 z-[45] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center sm:bottom-[calc(1.5rem+54px+0.5rem+env(safe-area-inset-bottom))]",
      className
    )}
    ref={ref}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-none relative flex max-w-full items-center overflow-hidden whitespace-nowrap rounded-full border px-5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:duration-300 data-[state=closed]:duration-300 data-[state=open]:ease-out data-[state=closed]:ease-in data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-[calc(100%+0.75rem)] data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-[calc(100%+0.75rem)]",
  {
    defaultVariants: {
      variant: "default"
    },
    variants: {
      variant: {
        // every toast uses the same look: a light grey pill (like the date buttons) with black text
        default: "border-light-gray bg-input text-black",
        failure: "failure group border-light-gray bg-input text-black",
        success: "success group border-light-gray bg-input text-black"
      }
    }
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return <ToastPrimitives.Root className={cn(toastVariants({ variant }), className)} ref={ref} {...props} />;
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-4 font-medium ring-offset-background transition-colors hover:bg-secondary group-[.failure]:hover:border-failure/30 group-[.success]:hover:border-success/30 group-[.failure]:hover:bg-failure group-[.success]:hover:bg-success group-[.failure]:hover:text-failure-foreground group-[.success]:hover:text-success-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 group-[.failure]:focus:ring-failure group-[.success]:focus:ring-success disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    className={cn(
      "group-[.failure]:focus:ring-offset-red-600 group-[.success]:focus:ring-offset-green-600 p1 absolute right-0.5 top-0.5 rounded-md p-1 text-foreground/50 opacity-100 transition-opacity group-hover:opacity-100 hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-[.failure]:focus:ring-failure group-[.success]:focus:ring-success sm:opacity-0",
      className
    )}
    ref={ref}
    toast-close=""
    {...props}
  >
    <X className="h-3 w-3" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title className={cn("hidden font-normal sm:block", className)} ref={ref} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description className={cn("truncate opacity-90", className)} ref={ref} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  Toast,
  ToastAction,
  type ToastActionElement,
  ToastClose,
  ToastDescription,
  type ToastProps,
  ToastProvider,
  ToastTitle,
  ToastViewport
};
