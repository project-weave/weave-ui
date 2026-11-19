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
            duration={3000}
            key={id}
            onPointerDown={(e) => e.preventDefault()}
            onPointerMove={(e) => e.preventDefault()}
            {...props}
            variant={variant}
          >
            <div className="text-sm text-white 2xl:text-base">
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
