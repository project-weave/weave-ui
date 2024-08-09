"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ action, description, id, title, variant, ...props }) {
        let icon;
        switch (variant) {
          case "success":
            icon = <CheckCircle2 className="h-5 w-5 text-success" />;
            break;
          case "failure":
            icon = <XCircle className="h-5 w-5 text-failure" />;
            break;
          default:
            icon = <></>;
        }
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="grid grid-flow-col items-center gap-1 text-sm 2xl:text-base">
              <div className="mr-2 mt-[.2px]">{icon}</div>
              <div>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
