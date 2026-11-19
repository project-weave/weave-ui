"use client";

import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(function ({ action, description, id, title, variant, ...props }) {
        return (
          <Toast
            duration={4000}
            key={id}
            onPointerDown={(e) => e.preventDefault()}
            onPointerMove={(e) => e.preventDefault()}
            {...props}
            variant={variant}
          >
            <div className="text-sm text-black 2xl:text-base">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
