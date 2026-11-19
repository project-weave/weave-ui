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
            duration={3000}
            key={id}
            onPointerDown={(e) => e.preventDefault()}
            onPointerMove={(e) => e.preventDefault()}
            {...props}
            variant={variant}
          >
            <div className="min-w-0 truncate text-sm text-white">
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
