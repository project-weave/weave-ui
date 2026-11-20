"use client";

import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
      {toasts.map(function ({ action, description, id, placement, title, variant, ...props }) {
        return (
          <Toast
            key={id}
            onPointerDown={(e) => e.preventDefault()}
            onPointerMove={(e) => e.preventDefault()}
            {...props}
            // timing is handled in use-toast so hovering can't keep a toast open
            duration={Infinity}
            variant={variant}
          >
            <div className="min-w-0 truncate text-sm text-black">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
          </Toast>
        );
      })}
      <ToastViewport placement={toasts[0]?.placement ?? "bottom"} />
    </ToastProvider>
  );
}
